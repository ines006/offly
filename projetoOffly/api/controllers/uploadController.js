const { OpenAI } = require("openai");
const Participants = require("../models/participants");
const Teams = require("../models/teams");
const { sequelize } = require("../config/database");

// Configuração do OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Função para analisar a imagem com ChatGPT
const analyzeScreenTime = async (imageBuffer) => {
  try {
    // Get the current date and calculate the previous day's date
    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const previousDateStr = previousDate.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const prompt = `
Analyze a screenshot of a device's screen time settings (e.g., iOS Screen Time or Android Digital Wellbeing).

Steps:
1. Confirm the image shows daily screen time and a date.
2. Check if the date is "${previousDateStr}" or "Yesterday".
3. Extract the daily screen time in hours (e.g., "2 hours", "2h", "2:00").

Points:
- 1 hour = 10 points
- 2 hours = 20 points
- 3 hours = 30 points
- 4 or more hours = 50 points

Return exactly one of these:
- A number: "10", "20", "30", or "50" if the image is valid and from the previous day.
- "Invalid image" if the image is not a screen time screenshot.
- "Wrong date" if the date is not the previous day.
- "Cannot extract" if screen time cannot be read.

Do not return any other text or format.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBuffer.toString("base64")}`,
              },
            },
          ],
        },
      ],
      max_tokens: 50, // Limit tokens for concise response
    });

    // Log raw response for debugging
    console.log("Raw OpenAI response:", response.choices[0].message.content);

    const result = response.choices[0].message.content.trim();

    // Map response to points or error
    if (["10", "20", "30", "50"].includes(result)) {
      return parseInt(result, 10);
    }

    // Map error strings to frontend-compatible messages
    switch (result) {
      case "Invalid image":
        throw new Error("Imagem não é um print válido do tempo de ecrã.");
      case "Wrong date":
        throw new Error(
          `A imagem deve ser do dia anterior (${previousDateStr}).`
        );
      case "Cannot extract":
        throw new Error("Não foi possível extrair o tempo de ecrã.");
      default:
        console.error("Resposta inesperada:", result);
        throw new Error("Resposta inválida da API");
    }
  } catch (error) {
    console.error("Erro em analyzeScreenTime:", error.message, error.stack);
    throw new Error(error.message);
  }
};

// Controller para processar o upload
exports.analyzeUpload = async (req, res) => {
  console.log("Requisição recebida em analyzeUpload:", {
    headers: req.headers,
    body: req.body,
    file: req.file ? "Imagem recebida" : "Nenhuma imagem recebida",
  });

  try {
    const { userId } = req.body;
    const image = req.file;

    if (!userId || !image) {
      console.log("Erro: Dados ausentes", { userId, image });
      return res
        .status(400)
        .json({ error: "userId e imagem são obrigatórios" });
    }

    // Verificar se userId é um número válido
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      console.log("Erro: userId inválido", { userId });
      return res
        .status(400)
        .json({ error: "userId deve ser um número válido" });
    }

    // Verificar se o participante existe
    const participant = await Participants.findByPk(parsedUserId, {
      include: [{ model: Teams, as: "team" }],
    });
    if (!participant) {
      console.log("Erro: Participante não encontrado", { parsedUserId });
      return res.status(404).json({ error: "Participante não encontrado" });
    }

    // Verificar se o participante pertence a uma equipe
    if (!participant.teams_id) {
      console.log("Erro: Participante sem equipe", { parsedUserId });
      return res
        .status(400)
        .json({ error: "Participante não pertence a nenhuma equipe" });
    }

    // Verificar se o upload já foi realizado hoje
    if (participant.upload === 1) {
      console.log("Erro: Upload já realizado", { parsedUserId });
      return res
        .status(400)
        .json({ error: "Upload já realizado hoje. Tente novamente amanhã." });
    }

    // Analisar a imagem com ChatGPT usando o buffer
    const points = await analyzeScreenTime(image.buffer);

    // Iniciar transação para garantir consistência
    await sequelize.transaction(async (t) => {
      // Calcular a variação (negativa, pois os pontos estão sendo subtraídos)
      const variation = -points;

      // Atualizar a pontuação da equipe e o campo last_variation
      await Teams.update(
        {
          points: sequelize.literal(`points - ${points}`),
          last_variation: variation, // Usar last_variation com underscore
        },
        { where: { id: participant.teams_id }, transaction: t }
      );

      // Atualizar o campo upload do participante
      await Participants.update(
        { upload: true },
        { where: { id: parsedUserId }, transaction: t }
      );
    });

    return res.status(200).json({
      message: "Imagem analisada e pontuação registrada com sucesso",
      points,
    });
  } catch (error) {
    console.error("Erro ao processar o upload:", error.message, error.stack);
    // Specific error for invalid images
    if (
      error.message.includes("Imagem não é um print válido") ||
      error.message.includes("A imagem deve ser do dia anterior") ||
      error.message.includes("Não foi possível extrair")
    ) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao processar o upload" });
  }
};
