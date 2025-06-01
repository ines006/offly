const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const Challenges = require("../models/challenges");


// POST - Criação de uma relação participante/desafio
exports.createChallengeSelection = async (req, res) => {
  const { participants_id, challenges_id, starting_date } = req.body;

  if (!participants_id || !challenges_id || !starting_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const startDate = new Date(starting_date);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    await ParticipantsHasChallenges.create({
      participants_id,
      challenges_id,
      starting_date: startDate,
      end_date: endDate,
      completed_date: null,
      validated: 0,
      streak: "0",
      challenge_levels_id_challenge_levels: 1,
      user_img: "",
    });

    res.status(201).json({ message: "Challenge selection created successfully" });
  } catch (error) {
    console.error("❌ Erro ao guardar seleção:", error);
    res.status(500).json({ error: "Erro interno ao criar desafio." });
  }
};

// GET - Buscar carta ativa (onde completed_date é null)
exports.getActiveChallengeByUser = async (req, res) => {
  const { participants_id } = req.params;

  try {
    const activeChallenge = await ParticipantsHasChallenges.findOne({
        where: {
          participants_id,
          completed_date: null,
        },
        include: [{
          model: Challenges,
          as: "challenge", 
          attributes: ["id", "title", "description", "img"],
        }],
      });

    if (!activeChallenge) {
      return res.status(404).json({ error: "Nenhuma carta ativa encontrada." });
    }

    res.json({
        participants_id: activeChallenge.participants_id,
        challenges_id: activeChallenge.challenges_id,
        starting_date: activeChallenge.starting_date,
        completed_date: activeChallenge.completed_date,
        challenge: {
            id: activeChallenge.challenge?.id,
            titulo: activeChallenge.challenge?.title,
            imagem: activeChallenge.challenge?.img,
            carta: activeChallenge.challenge?.description,
        },
      });
  } catch (error) {
    console.error("❌ Erro ao buscar carta ativa:", error);
    res.status(500).json({ error: "Erro ao buscar carta ativa." });
  }
};

// PUT - Marcar carta ativa como completada (atualiza completed_date)
exports.completeActiveChallenge = async (req, res) => {
    const { participants_id } = req.params;
  
    try {
      const activeChallenge = await ParticipantsHasChallenges.findOne({
        where: {
          participants_id,
          completed_date: null,
        },
      });
  
      if (!activeChallenge) {
        return res.status(404).json({ error: "Nenhuma carta ativa encontrada para completar." });
      }
  
      activeChallenge.completed_date = new Date(); // Data atual
      await activeChallenge.save();
  
      res.status(200).json({ message: "Carta completada com sucesso.", data: activeChallenge });
    } catch (error) {
      console.error("❌ Erro ao completar carta:", error);
      res.status(500).json({ error: "Erro ao completar carta." });
    }
  };

  

  exports.getStickerBook = async (req, res) => {
  try {
    const { participants_id } = req.params;

    // Verifica se o participante existe
    const participant = await Participants.findByPk(participants_id);
    if (!participant) {
      return res.status(404).json({ error: "Participante não encontrado." });
    }

    const teamId = participant.team_id;

    if (!teamId) {
      return res.status(422).json({ error: "Participante não está numa equipa." });
    }

    // Buscar todos os membros da equipa
    const teamMembers = await Participants.findAll({
      where: { team_id: teamId },
      attributes: ["id"],
    });

    const memberIds = teamMembers.map((m) => m.id);

    // Gerar últimos 7 dias
    const today = new Date();
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    });

    // Buscar desafios completados nos últimos 7 dias
    const completions = await ParticipantsHasChallenges.findAll({
      where: {
        participants_id: memberIds,
        validated: 1,
        completed_date: {
          [Op.between]: [new Date(days[days.length - 1]), today],
        },
      },
      attributes: ["participants_id", "completed_date"],
    });

    const stickerBook = days.map((day) => {
      const dayStart = new Date(day);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const completionsForDay = completions.filter((entry) => {
        const completed = new Date(entry.completed_date);
        return completed >= dayStart && completed <= dayEnd;
      });

      const userCompleted = completionsForDay.some(
        (entry) => entry.participants_id === parseInt(participants_id)
      );

      const teammatesCompleted = completionsForDay.some(
        (entry) => entry.participants_id !== parseInt(participants_id)
      );

      return {
        date: dayStart.toISOString().split("T")[0],
        userCompleted,
        teammatesCompleted,
      };
    });

    res.json({ stickerBook });
  } catch (error) {
    console.error("❌ Erro ao buscar caderneta:", error);
    res.status(500).json({ error: "Erro ao gerar caderneta." });
  }
};

  module.exports = exports;

