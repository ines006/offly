const Challenge = require("../models/challenges");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const { Op, Sequelize } = require("sequelize");

exports.getRandomChallenges = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    // Buscar os IDs de desafios já validados pelo utilizador
    const validated = await ParticipantsHasChallenges.findAll({
      where: {
        participants_id: userId,
        validated: 1, // Somente os validados (1 = true)
      },
      attributes: ["challenges_id"],
    });

    const validatedIds = validated.map((entry) => entry.challenges_id);

    // Buscar até 3 desafios ainda não validados
    const challenges = await Challenge.findAll({
      where: {
        id: {
          [Op.notIn]: validatedIds.length ? validatedIds : [0],
        },
      },
      attributes: ["id", "title", "description", "img"],
      order: Sequelize.literal("RAND()"),
      limit: 3,
    });

    res.status(200).json(challenges);
  } catch (error) {
    console.error("Erro ao buscar desafios:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
