const { Op, literal, Sequelize } = require("sequelize"); 
const moment = require("moment");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const Challenges = require("../models/challenges");
const ChallengeLevels = require("../models/challengeLevel");


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

// GET - Buscar carta ativa 
exports.getActiveChallengeByUser = async (req, res) => {
  const { participants_id } = req.params;

  try {
    const activeChallenge = await ParticipantsHasChallenges.findOne({
      where: {
        participants_id,
        validated: 0,
        challenge_types_id: 1,
      },
      attributes: [
        "participants_id",
        "challenges_id",
        "starting_date",
        "completed_date",
        "challenge_levels_id_challenge_levels", 
        "challenge_types_id",
        "validated"
      ],
      include: [
        {
          model: Challenges,
          as: "challenge",
          attributes: ["id", "title", "description", "img"],
        },
      ],
    });

    if (!activeChallenge) {
      return res
        .status(404)
        .json({ error: "Nenhuma carta ativa encontrada." });
    }

    const levelId = activeChallenge.challenge_levels_id_challenge_levels;

    // Corrigido: busca pelo id correto
    const level = await ChallengeLevels.findOne({
      where: { id: levelId },
      attributes: ["image_level"],
    });

    return res.json({
      participants_id: activeChallenge.participants_id,
      challenges_id: activeChallenge.challenges_id,
      starting_date: activeChallenge.starting_date,
      completed_date: activeChallenge.completed_date,
      challenge: {
        id: activeChallenge.challenge?.id,
        titulo: activeChallenge.challenge?.title,
        imagem: activeChallenge.challenge?.img,
        carta: activeChallenge.challenge?.description,
        imagem_nivel: level?.image_level || null,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar carta ativa:", error);
    return res
      .status(500)
      .json({ error: "Erro ao buscar carta ativa.", details: error.message });
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

  exports.getChallengeOfToday = async (req, res) => {
  const { participants_id } = req.params;

  try {
    const today = new Date().toISOString().split("T")[0]; // formato YYYY-MM-DD
    console.log("🔍 A procurar desafio do dia para participante:", participants_id, "na data:", today);

    // 1. Buscar registo com validated = 1 e data igual à de hoje (starting_date OU completed_date)
    const challengeRecord = await ParticipantsHasChallenges.findOne({
      where: {
        participants_id,
        validated: 1,
        [Op.or]: [
        Sequelize.where(Sequelize.fn("DATE", Sequelize.col("starting_date")), today),
        Sequelize.where(Sequelize.fn("DATE", Sequelize.col("completed_date")), today),
      ],
      },
      attributes: ["challenges_id"],
    });

    if (!challengeRecord) {
      return res.status(404).json({ error: "Nenhum desafio válido encontrado para hoje." });
    }

    const { challenges_id } = challengeRecord;

    // 2. Buscar desafio correspondente na tabela challenges
    const challenge = await Challenges.findOne({
      where: { id: challenges_id },
      attributes: ["title", "description", "challenge_levels_id"],
    });

    if (!challenge) {
      return res.status(404).json({ error: "Desafio associado não encontrado." });
    }

    const levelValue = challenge.challenge_levels_id;

    // 3. Buscar dados do nível (imagem, número)
    const level = await ChallengeLevels.findOne({
      where: { level: levelValue },
      attributes: ["image_level", "level"],
    });

    return res.json({
      challenges_id,
      title: challenge.title,
      description: challenge.description,
      level: levelValue,
      imagem_nivel: level?.image_level || null,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar desafio do dia:", error);
    return res.status(500).json({
      error: "Erro interno ao buscar desafio do dia.",
      details: error.message,
    });
  }
};


exports.getActiveChallengeWithUserImage = async (req, res) => {
  const { participants_id } = req.params;

  try {
    // Busca o desafio mais recente e validado do tipo diário
    const challenge = await ParticipantsHasChallenges.findOne({
      where: {
        participants_id,
        validated: 1,
        challenge_types_id: 1,
      },
      order: [["starting_date", "DESC"]],
    });

    if (!challenge) {
      return res.status(404).json({ error: "Nenhum desafio diário validado encontrado." });
    }

    const startDate = new Date(challenge.starting_date);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // +1 dia

    const startOfDay = (date) => new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = (date) => new Date(date.setHours(23, 59, 59, 999));

    const filteredChallenge = await ParticipantsHasChallenges.findOne({
      where: {
        participants_id,
        validated: 1,
        challenge_types_id: 1,
        completed_date: {
          [Op.or]: [
            {
              [Op.between]: [startOfDay(new Date(startDate)), endOfDay(new Date(startDate))],
            },
            {
              [Op.between]: [startOfDay(new Date(endDate)), endOfDay(new Date(endDate))],
            },
          ],
        },
      },
      attributes: [
        "participants_id",
        "challenges_id",
        "starting_date",
        "completed_date",
        "challenge_levels_id_challenge_levels",
        "challenge_types_id",
        "validated",
        "user_img", // Blob da imagem do usuário
      ],
      include: [
        {
          model: Challenges,
          as: "challenge",
          attributes: ["id", "title", "description", "img"],
        },
      ],
    });

    if (!filteredChallenge) {
      return res.status(404).json({
        error: "Nenhuma carta encontrada com a data concluída esperada.",
      });
    }

    // Pega imagem de nível
    const level = await ChallengeLevels.findOne({
      where: { id: filteredChallenge.challenge_levels_id_challenge_levels },
      attributes: ["image_level"],
    });

    // Convertendo blob em base64 (se existir)
    let userImageBase64 = null;
    if (filteredChallenge.user_img) {
      const mimeType = "image/jpeg"; // ou image/png dependendo do tipo real
      const base64 = filteredChallenge.user_img.toString("base64");
      userImageBase64 = `data:${mimeType};base64,${base64}`;
    }

    // Resposta final
    return res.json({
      participants_id: filteredChallenge.participants_id,
      challenges_id: filteredChallenge.challenges_id,
      starting_date: filteredChallenge.starting_date,
      completed_date: filteredChallenge.completed_date,
      user_img: userImageBase64, 
      challenge: {
        id: filteredChallenge.challenge?.id,
        titulo: filteredChallenge.challenge?.title,
        imagem: filteredChallenge.challenge?.img,
        carta: filteredChallenge.challenge?.description,
        imagem_nivel: level?.image_level || null,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar carta ativa com imagem:", error);
    return res.status(500).json({
      error: "Erro ao buscar carta ativa.",
      details: error.message,
    });
  }
};

  module.exports = exports;
