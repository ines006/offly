const Participants = require("../models/participants");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const { Op } = require("sequelize");


exports.getParticipants = async (req, res) => {
  const { id, teams_id } = req.query;

  try {
    console.log("Query recebida:", req.query);
    let whereClause = {};

    if (id && !isNaN(id)) {
      whereClause.id = parseInt(id, 10);
    }

    if (teams_id && !isNaN(teams_id)) {
      whereClause.teams_id = parseInt(teams_id, 10);
    }

    console.log("Cláusula WHERE gerada:", whereClause);

    const participants = await Participants.findAll({
      where: whereClause,
    });

    res.status(200).json(participants);
  } catch (error) {
    console.error("Erro ao buscar participantes:", error);
    res.status(500).json({ error: "Erro ao buscar participantes." });
  }
};

// GET /participants_has_challenges?participants_id=xx
exports.getParticipantsHasChallenges = async (req, res) => {
  const { participants_id } = req.query;

  if (!participants_id) {
    return res.status(400).json({ error: "É necessário fornecer participants_id." });
  }

  try {
    const challenges = await ParticipantsHasChallenges.findAll({
      where: { participants_id },
    });

    res.status(200).json(challenges);
  } catch (error) {
    console.error("Erro ao buscar desafios do participante:", error);
    res.status(500).json({ error: "Erro ao buscar desafios." });
  }
};

module.exports = exports;