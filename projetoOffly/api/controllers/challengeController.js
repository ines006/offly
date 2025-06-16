const Challenge = require("../models/challenges");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const { Op, Sequelize, QueryTypes} = require("sequelize");
const { sequelize } = require("../config/database"); 
const Participants = require("../models/participants");
const Team = require("../models/teams");
const ChallengeLevels = require("../models/challengeLevel");


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

exports.getChallengeImage = async (req, res) => {
  const challengeId = req.params.id;

  try {
    const [results] = await sequelize.query(
      "SELECT img FROM challenges WHERE id = ?",
      {
        replacements: [challengeId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results || !results.img) {
      return res.status(404).json({ error: "Imagem não encontrada." });
    }

    res.set("Content-Type", "image/jpeg");
    res.send(results.img); // ou results[0].img se necessário
  } catch (error) {
    console.error("Erro ao carregar imagem:", error);
    res.status(500).json({ error: "Erro ao carregar imagem." });
  }
};

exports.getDesafiosDoDia = async (req, res) => {
  const { dia, participanteId } = req.query;

  if (!dia || !participanteId) {
    return res.status(400).json({ error: "Os parâmetros 'dia' e 'participanteId' são obrigatórios." });
  }

  try {
    const participante = await Participants.findByPk(participanteId);
    if (!participante) {
      return res.status(404).json({ error: "Participante não encontrado." });
    }

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;

    const diaFormatado = String(dia).padStart(2, '0');
    const mesFormatado = String(mes).padStart(2, '0');

    const inicioDia = new Date(`${ano}-${mesFormatado}-${diaFormatado}T00:00:00`);
    const fimDia = new Date(`${ano}-${mesFormatado}-${diaFormatado}T23:59:59`);

    const teamMembers = await Participants.findAll({
      where: {
        teams_id: participante.teams_id,
      },
      attributes: ["id", "name", "image"],
    });

    const completedChallenges = await ParticipantsHasChallenges.findAll({
      where: {
        starting_date: {
          [Op.between]: [inicioDia, fimDia],
        },
      },
      include: [
        {
          model: Participants,
          as: "participant",
          attributes: ["id", "name", "image"],
          required: true,
          where: {
            teams_id: participante.teams_id,
          },
        },
        {
          model: Challenge,
          as: "challenge",
          attributes: ["id", "title", "description", "challenge_levels_id"],
          required: true,
          where: {
            challenge_types_id: 1, // 🔥 filtro pelo tipo de desafio diário
          },
          include: [
            {
              model: ChallengeLevels,
              as: "level",
              attributes: ["id", "level", "image_level"],
            },
          ],
        },
      ],
      order: [["starting_date", "ASC"]],
    });

    res.status(200).json({
      teamMembers,
      completedChallenges,
    });
  } catch (error) {
    console.error("Erro ao buscar desafios do dia:", error);
    res.status(500).json({ error: "Erro ao buscar desafios do dia." });
  }
};

// Controller atualizado para devolver também o teams_id
exports.verificarDesafioRealizado = async (req, res) => {
  const participanteId = req.params.id;

  if (!participanteId) {
    return res.status(400).json({ error: "ID do participante em falta." });
  }

  try {
    const participante = await Participants.findByPk(participanteId);

    if (!participante || !participante.teams_id) {
      return res.status(404).json({ error: "Participante não encontrado ou sem equipa." });
    }

    const teamsId = participante.teams_id;

    const resultado = await sequelize.query(
      `
      SELECT challenges_id
      FROM challenges_has_teams cht
      WHERE teams_id = :teamsId
      LIMIT 1
      `,
      {
        replacements: { teamsId },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    return res.json({
      shakeFeito: resultado.length > 0,
      teamId: teamsId, 
    });

  } catch (error) {
    console.error("Erro ao verificar desafio semanal:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};


exports.discoverWeeklyChallenge = async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId é obrigatório" });
    }

  
    const [participant] = await sequelize.query(
      "SELECT teams_id FROM participants WHERE id = ?",
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!participant) {
      return res.status(404).json({ success: false, message: "Participante não encontrado." });
    }

    const teamId = participant.teams_id;

    const [challenges] = await sequelize.query(
      "SELECT id FROM challenges WHERE challenge_types_id = 2 ORDER BY RAND() LIMIT 1",
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!challenges) {
      return res.status(404).json({ success: false, message: "Nenhum desafio disponível." });
    }

    const challengeId = challenges.id;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias depois

    await sequelize.query(
      "INSERT INTO challenges_has_teams (challenges_id, teams_id, starting_date, end_date, validated) VALUES (?, ?, ?, ?, ?)",
      {
        replacements: [challengeId, teamId, startDate, endDate, 0],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro interno no controller discoverWeeklyChallenge:", err);
    return res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
};


exports.getChallengeForTeam = async (req, res) => {
  try {
    const teamsId = req.params.teamsId; 

    if (!teamsId) {
      return res.status(400).json({ error: 'Parâmetro teamId é obrigatório' });
    }

    console.log("teamsId =>", teamsId);

    // 1. Buscar o challenge_id associado ao team_id
    const [challengeTeam] = await sequelize.query(`
      SELECT challenges_id FROM challenges_has_teams
      WHERE teams_id = ? AND validated = 0
      LIMIT 1
    `, {
      replacements: [teamsId],
      type: QueryTypes.SELECT,
    });

    if (!challengeTeam) {
      return res.status(404).json({ message: 'Não foi encontrado nenhum desafio para este time.' });
    }

    const challengeId = challengeTeam.challenges_id;

    // 2. Buscar os dados do desafio na tabela challenges
    const [challenge] = await sequelize.query(`
      SELECT id, title, description FROM challenges
      WHERE id = ?
      LIMIT 1
    `, {
      replacements: [challengeId],
      type: QueryTypes.SELECT,
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Desafio não encontrado na tabela challenges.' });
    }

    return res.status(200).json({
      challenges_id: challenge.id,
      title: challenge.title,
      description: challenge.description
    });

  } catch (error) {
    console.error('Erro ao buscar desafio:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar desafio' });
  }
};


exports.getChallengeDates = async (req, res) => {
  const { teamId } = req.params;
  try {
    const [result] = await sequelize.query(
      `SELECT starting_date, end_date, validated 
      FROM challenges_has_teams 
      WHERE teams_id = :teamId 
      LIMIT 1`,
      {
        replacements: { teamId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!result) {
      return res.status(404).json({ message: 'Desafio não encontrado para esse time.' });
    }
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar datas do desafio:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.validateChallenge = async (req, res) => {
  const { teamId } = req.params;
  try {
    await sequelize.query(
      `UPDATE challenges_has_teams SET validated = 1 WHERE teams_id = ?`,
      [teamId]
    );
    res.json({ message: 'Desafio validado com sucesso.' });
  } catch (error) {
    console.error('Erro ao validar desafio:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getParticipantsByTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    // 1. Buscar challenge atual da equipa (não validado)
    const [challengeData] = await sequelize.query(
      `
      SELECT challenges_id 
      FROM challenges_has_teams 
      WHERE teams_id = :teamId AND validated = 0
      LIMIT 1
      `,
      {
        replacements: { teamId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!challengeData) {
      return res.status(404).json({ message: 'Desafio ativo não encontrado para esta equipa.' });
    }

    const challengeId = challengeData.challenges_id;

    // 2. Buscar participantes e streaks APENAS para esse desafio
    const participants = await sequelize.query(
      `
      SELECT 
        p.username, 
        p.image, 
        phc.streak
      FROM participants p
      JOIN participants_has_challenges phc 
        ON p.id = phc.participants_id
      WHERE p.teams_id = :teamId
        AND phc.challenges_id = :challengeId
      `,
      {
        replacements: { teamId, challengeId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.json(participants);

  } catch (error) {
    console.error('Erro ao buscar participantes com streaks filtrados:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor.',
      error: error.message,
    });
  }
};
