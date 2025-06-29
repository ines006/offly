const { OpenAI } = require("openai");
const sharp = require("sharp");
const {
  Participants,
  Teams,
  Challenges,
  ParticipantsHasChallenges,
} = require("../models");
const { sequelize } = require("../config/database");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Função para comprimir imagem até no máximo 64 KB se não ao guardar com mais capacidade acaba por cortar a imagem e não renderiza toda
const compressImageTo64KB = async (inputBuffer) => {
  let quality = 80;

  while (quality >= 20) {
    const buffer = await sharp(inputBuffer)
      .jpeg({ quality })
      .toBuffer();

    if (buffer.length <= 64 * 1024) {
      return buffer;
    }

    quality -= 10;
  }

  // Tenta redimensionar se não conseguiu só com qualidade
  const buffer = await sharp(inputBuffer)
    .resize({ width: 600 }) // Ajusta conforme necessário
    .jpeg({ quality: 40 })
    .toBuffer();

  if (buffer.length <= 64 * 1024) {
    return buffer;
  }

  throw new Error("Não foi possível comprimir a imagem abaixo de 64 KB");
};

const validateChallengeImage = async (imageBuffer, challengeDescription) => {
  const prompt = `
    Com base na imagem submetida pelo utilizador, valida com detalhe se a pessoa realizou pelo menos uma das tarefas do desafio personalizado que escolheu: "${challengeDescription}".

    É suficiente que apenas uma das partes do desafio tenha sido cumprida, desde que esteja claramente relacionada com o desafio proposto.

    Não é necessário seres específico em situações que em imagens não são possíveis de serem confirmadas, por exemplo, não precisas de confirmar se um bairro é desconhecido ou não ao utilizador.
    Retorne apenas:
    - "válido"
    - "inválido: <justificação>"
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
    max_tokens: 100,
  });

  const result = response.choices[0].message.content.trim();
  console.log("Resposta da OpenAI:", result);
  return result;
};

exports.validateChallengeUpload = async (req, res) => {
  try {
    const { userId } = req.body;
    const image = req.file;

    if (!userId || !image) {
      return res
        .status(400)
        .json({ error: "userId e imagem são obrigatórios" });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: "userId inválido" });
    }

    const participation = await ParticipantsHasChallenges.findOne({
      where: {
        participants_id: parsedUserId,
        completed_date: null,
        validated: 0,
        challenge_types_id: 1,
      },
    });

    if (!participation) {
      return res.status(404).json({
        error: "Nenhum desafio pendente encontrado para o participante.",
      });
    }

    const challengeId = participation.challenges_id;

    const challenge = await Challenges.findByPk(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Desafio não encontrado." });
    }

    const challengeDescription = challenge.description;
    const challengeLevel = challenge.challenge_levels_id;

    const participant = await Participants.findByPk(parsedUserId);
    if (!participant) {
      return res.status(404).json({ error: "Participante não encontrado." });
    }

    const team = await Teams.findByPk(participant.teams_id);
    if (!team) {
      return res.status(404).json({ error: "Equipa não encontrada." });
    }

    // Comprimir imagem para no máximo 64 KB 
    const compressedImageBuffer = await compressImageTo64KB(image.buffer);

    // Validar imagem com OpenAI
    const validationResponse = await validateChallengeImage(
      compressedImageBuffer,
      challengeDescription
    );

    if (validationResponse.startsWith("válido")) {
      let pointsToAdd = 0;
      switch (challengeLevel) {
        case 1:
          pointsToAdd = 40;
          break;
        case 2:
          pointsToAdd = 70;
          break;
        case 3:
          pointsToAdd = 100;
          break;
        default:
          pointsToAdd = 0;
      }

      await sequelize.transaction(async (t) => {
        // Atualiza pontos da equipa
        await Teams.update(
          {
            points: sequelize.literal(`points + ${pointsToAdd}`),
            last_variation: pointsToAdd,
          },
          {
            where: { id: team.id },
            transaction: t,
          }
        );

        // Marca desafio como concluído e guarda a imagem comprimida
        await ParticipantsHasChallenges.update(
          {
            completed_date: new Date(),
            validated: 1,
            user_img: compressedImageBuffer,
          },
          {
            where: {
              participants_id: parsedUserId,
              challenges_id: challengeId,
            },
            transaction: t,
          }
        );

        // Incrementa challenge_count do participante
        await Participants.update(
          {
            challenge_count: sequelize.literal("challenge_count + 1"),
          },
          {
            where: { id: parsedUserId },
            transaction: t,
          }
        );
      });

      return res.status(200).json({
        message: "Desafio validado com sucesso!",
        resultado: "válido",
        pontos_atribuidos: pointsToAdd,
      });
    } else if (validationResponse.startsWith("inválido")) {
      return res.status(400).json({
        resultado: "inválido",
        justificativa: validationResponse.replace("inválido:", "").trim(),
      });
    } else {
      return res
        .status(500)
        .json({ error: "Resposta inesperada da API de validação." });
    }
  } catch (error) {
    console.error("Erro ao validar desafio:", error.message);
    return res.status(500).json({ error: "Erro ao validar o desafio." });
  }
};
