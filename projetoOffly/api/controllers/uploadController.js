const { OpenAI } = require("openai");
const Participants = require("../models/participants");
const Teams = require("../models/teams");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const Challenges = require("../models/challenges");
const { sequelize } = require("../config/database");

// Configuração do OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Função para verificar se uma string é uma data válida
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Função para analisar a imagem com ChatGPT
const analyzeScreenTime = async (imageBuffer, challengeDescription = null) => {
  try {
    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const previousDateStr = previousDate.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    let prompt = `
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
`;

    // Adicionar verificação do desafio semanal, se aplicável
    if (challengeDescription) {
      prompt += `
4. Verify if the screenshot complies with the weekly challenge description: "${challengeDescription}". 
   - Return "Complies" if the screen time reduction aligns with the challenge (e.g., reduced time compared to a baseline or meets a specific limit).
   - Return "DoesNotComply" if it does not align.
   - Return "CannotVerify" if the compliance cannot be determined.
`;
    }

    prompt += `
Return exactly one of these:
- A number: "10", "20", "30", or "50" if the image is valid and from the previous day.
- "Invalid image" if the image is not a screen time screenshot.
- "Wrong date" if the date is not the previous day.
- "Cannot extract" if screen time cannot be read.
- If a weekly challenge is provided, append either ",Complies", ",DoesNotComply", or ",CannotVerify" to the number (e.g., "20,Complies") or error response (e.g., "Wrong date,CannotVerify").
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
      max_tokens: 50,
    });

    console.log("Raw OpenAI response:", response.choices[0].message.content);

    const result = response.choices[0].message.content.trim();
    const [mainResult, complianceResult] = result.split(",");

    if (["10", "20", "30", "50"].includes(mainResult)) {
      const points = parseInt(mainResult, 10);
      const compliance = complianceResult || "CannotVerify";
      return { points, compliance };
    }

    switch (mainResult) {
      case "Invalid image":
        throw new Error("Imagem não é um print válido do tempo de ecrã.");
      case "Wrong date":
        throw new Error(`A imagem deve ser do dia anterior (${previousDateStr}).`);
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
      return res.status(400).json({ error: "userId e imagem são obrigatórios" });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      console.log("Erro: userId inválido", { userId, parsedUserId });
      return res.status(400).json({ error: "userId deve ser um número inteiro positivo" });
    }

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

    if (!participant.teams_id) {
      console.log("Erro: Participante sem equipe", { parsedUserId });
      return res.status(400).json({ error: "Participante não pertence a nenhuma equipe" });
    }

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

    // Verificar o desafio semanal ativo da equipa
    const teamId = participant.teams_id;
    const [challengeData] = await sequelize.query(
      `SELECT challenges_id, starting_date, end_date 
       FROM challenges_has_teams 
       WHERE teams_id = ? AND validated = 0 
       LIMIT 1`,
      {
        replacements: [teamId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    let challengeDescription = null;
    if (challengeData) {
      console.log("Desafio semanal ativo encontrado:", {
        teamId,
        challenges_id: challengeData.challenges_id,
        start: challengeData.starting_date,
        end: challengeData.end_date,
      });
      const challenge = await Challenges.findByPk(challengeData.challenges_id);
      if (challenge) {
        challengeDescription = challenge.description;
        console.log("Descrição do desafio semanal:", challengeDescription);
      } else {
        console.log("Desafio não encontrado na tabela challenges:", challengeData.challenges_id);
      }
    } else {
      console.log("Nenhum desafio semanal ativo encontrado para a equipe:", teamId);
    }

    // Analisar a imagem com ChatGPT
    const { points, compliance } = await analyzeScreenTime(image.buffer, challengeDescription);
    console.log("Pontos calculados:", { points, compliance });

    const currentDateTime = new Date().toISOString();
    console.log("Tentando atualizar upload_data para:", {
      userId: parsedUserId,
      upload_data: currentDateTime,
    });

    const transaction = await sequelize.transaction();
    try {
      const variation = -points;

      const [teamUpdated] = await Teams.update(
        {
          points: sequelize.literal(`points - ${points}`),
          last_variation: variation,
        },
        { where: { id: participant.teams_id }, transaction }
      );
      console.log("Team update result:", { teamUpdated, teamId: participant.teams_id });

      const participantCheck = await Participants.findByPk(parsedUserId, { transaction });
      if (!participantCheck) {
        throw new Error("Participante não encontrado durante a transação");
      }

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

      // Atualizar streak apenas se houver desafio semanal e compliance for válido
      if (challengeData && compliance === "Complies") {
        console.log("Verificando atualização do streak para desafio semanal:", {
          challengeId: challengeData.challenges_id,
          compliance,
        });
        const challengeId = challengeData.challenges_id;
        const previousDate = new Date();
        previousDate.setDate(new Date().getDate() - 1);
        const dayOfWeek = (previousDate.getDay() + 6) % 7; 

        const participantChallenge = await ParticipantsHasChallenges.findOne({
          where: {
            participants_id: parsedUserId,
            challenges_id: challengeId,
          },
          transaction,
        });

        if (participantChallenge) {
          let streak = JSON.parse(participantChallenge.streak || "[0,0,0,0,0,0,0]");
          if (streak[dayOfWeek] === "0") {
            streak[dayOfWeek] = "1";
            await participantChallenge.update(
              { streak: JSON.stringify(streak) },
              { transaction }
            );
            console.log(`Streak atualizado para '1' no dia ${dayOfWeek} para o participante ${parsedUserId}`);
          } else {
            console.log(`Streak já atualizado no dia ${dayOfWeek} para o participante ${parsedUserId}`);
          }
        } else {
          console.log("Nenhum registro de participante encontrado para o desafio:", {
            participantId: parsedUserId,
            challengeId,
          });
        }
      } else if (challengeData) {
        console.log("Desafio semanal ativo, mas compliance não é 'Complies':", compliance);
      }

      await transaction.commit();
      console.log("Transação confirmada com sucesso");
    } catch (error) {
      await transaction.rollback();
      console.error("Erro na transação, rollback executado:", error.message);
      throw error;
    }

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