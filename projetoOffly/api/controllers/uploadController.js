const { OpenAI } = require("openai");
const Participants = require("../models/participants");
const Teams = require("../models/teams");
const { sequelize } = require("../config/database");

// Configuração do OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Função para verificar se uma string é uma data válida
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

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

    console.log("Raw OpenAI response:", response.choices[0].message.content);

    const result = response.choices[0].message.content.trim();

    if (["10", "20", "30", "50"].includes(result)) {
      return parseInt(result, 10);
    }

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
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      console.log("Erro: userId inválido", { userId, parsedUserId });
      return res
        .status(400)
        .json({ error: "userId deve ser um número inteiro positivo" });
    }

    // Verificar se o participante existe
    const participant = await Participants.findByPk(parsedUserId, {
      include: [{ model: Teams, as: "team" }],
    });
    if (!participant) {
      console.log("Erro: Participante não encontrado", { parsedUserId });
      return res.status(404).json({ error: "Participante não encontrado" });
    }
    console.log("Participante encontrado:", {
      id: participant.id,
      teams_id: participant.teams_id,
      upload_data: participant.upload_data,
    });

    // Verificar se o participante pertence a uma equipe
    if (!participant.teams_id) {
      console.log("Erro: Participante sem equipe", { parsedUserId });
      return res
        .status(400)
        .json({ error: "Participante não pertence a nenhuma equipe" });
    }

    // Verificar se o upload já foi realizado hoje
    const today = new Date().toISOString().split("T")[0];
    let uploadDate = null;
    if (participant.upload_data && isValidDate(participant.upload_data)) {
      uploadDate = new Date(participant.upload_data).toISOString().split("T")[0];
    } else if (participant.upload_data) {
      console.warn("Valor inválido em upload_data:", {
        userId: parsedUserId,
        upload_data: participant.upload_data,
      });
    }
    if (uploadDate === today) {
      console.log("Erro: Upload já realizado hoje", { parsedUserId });
      return res
        .status(400)
        .json({ error: "Upload já realizado hoje. Tente novamente amanhã." });
    }

    // Analisar a imagem com ChatGPT usando o buffer
    const points = await analyzeScreenTime(image.buffer);
    console.log("Pontos calculados:", { points });

    // Definir o datetime atual para upload_data
    const currentDateTime = new Date().toISOString();
    console.log("Tentando atualizar upload_data para:", {
      userId: parsedUserId,
      upload_data: currentDateTime,
    });

    // Iniciar transação
    const transaction = await sequelize.transaction();
    try {
      // Calcular a variação (negativa, pois os pontos estão sendo subtraídos)
      const variation = -points;

      // Atualizar a pontuação da equipe
      const [teamUpdated] = await Teams.update(
        {
          points: sequelize.literal(`points - ${points}`),
          last_variation: variation,
        },
        { where: { id: participant.teams_id }, transaction }
      );
      console.log("Team update result:", { teamUpdated, teamId: participant.teams_id });

      // Verificar novamente o participante antes de atualizar
      const participantCheck = await Participants.findByPk(parsedUserId, { transaction });
      if (!participantCheck) {
        throw new Error("Participante não encontrado durante a transação");
      }

      // Atualizar upload_data
      const [participantUpdated] = await Participants.update(
        {
          upload_data: currentDateTime,
        },
        { where: { id: parsedUserId }, transaction }
      );
      console.log("Participant update result:", { participantUpdated, userId: parsedUserId });

      if (participantUpdated === 0) {
        console.error("Nenhuma linha atualizada para upload_data", {
          userId: parsedUserId,
          upload_data: currentDateTime,
        });
        throw new Error("Falha ao atualizar upload_data: participante não encontrado ou sem alterações");
      }

      // Confirmar transação
      await transaction.commit();
      console.log("Transação confirmada com sucesso");
    } catch (error) {
      await transaction.rollback();
      console.error("Erro na transação, rollback executado:", error.message);
      throw error;
    }

    // Verificar o participante atualizado
    const updatedParticipant = await Participants.findByPk(parsedUserId);
    console.log("Participante após atualização:", {
      id: parsedUserId,
      upload_data: updatedParticipant?.upload_data,
    });

    return res.status(200).json({
      message: "Imagem analisada e pontuação registrada com sucesso",
      points,
    });
  } catch (error) {
    console.error("Erro ao processar o upload:", error.message, error.stack);
    if (
      error.message.includes("Imagem não é um print válido") ||
      error.message.includes("A imagem deve ser do dia anterior") ||
      error.message.includes("Não foi possível extrair") ||
      error.message.includes("Falha ao atualizar upload_data") ||
      error.message.includes("Participante não encontrado durante a transação")
    ) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao processar o upload" });
  }
};