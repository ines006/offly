const Participants = require("../models/participants");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const { Op } = require("sequelize");

const getPassbookData = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "É necessário fornecer o id do utilizador." });
  }

  try {
    const participant = await Participants.findOne({ where: { id } });

    if (!participant) {
      return res.status(404).json({ error: "Participante não encontrado." });
    }

    const teamId = participant.teams_id;

    if (!teamId) {
      return res.status(404).json({ error: "Participante não pertence a nenhuma equipa." });
    }

    const teamParticipants = await Participants.findAll({
      where: { teams_id: teamId },
    });

    const participantIds = teamParticipants.map(p => p.id);

    const challenges = await ParticipantsHasChallenges.findAll({
      where: {
        participants_id: {
          [Op.in]: participantIds,
        },
      },
    });

    res.status(200).json({
      teamParticipants,
      challenges,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados da caderneta:", error);
    res.status(500).json({ error: "Erro ao buscar dados da caderneta." });
  }
};

module.exports = {
  getPassbookData,
};
