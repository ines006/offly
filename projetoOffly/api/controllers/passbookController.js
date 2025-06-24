const Participants = require("../models/participants");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const ChallengesHasTeams = require("../models/challengesHasTeams");
const Challenge = require("../models/challenges"); 
const { Op } = require("sequelize");

exports.getPassbookData = async (req, res) => {
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
      include: [
        {
          model: Challenge,
          as: "challenge", // usa o alias correto conforme definido na associação
          where: {
            challenge_types_id: 1, // 🔥 só desafios do tipo diário
          },
          attributes: ["id", "title", "challenge_types_id"],
        },
      ],
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

exports.getValidatedChallengeImages = async (req, res) => {
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

    const validatedChallenges = await ChallengesHasTeams.findAll({
      where: {
        teams_id: teamId,
        validated: 1,
      },
      include: [
        {
          model: Challenge,
          as: "challenge",
          attributes: ["id", "title", "img"], // agora img é URL
        },
      ],
    });

    const images = validatedChallenges
      .map(entry => {
        const imageUrl = entry.challenge?.img;
        if (imageUrl) {
          return {
            challengeId: entry.challenge.id,
            title: entry.challenge.title,
            imageUrl, // já é uma URL direta
          };
        }
        return null;
      })
      .filter(img => img !== null);

    return res.status(200).json({ images });

  } catch (error) {
    console.error("❌ Erro ao buscar imagens dos desafios validados:", error);
    return res.status(500).json({ error: "Erro ao buscar imagens dos desafios validados." });
  }
};


module.exports = exports;
