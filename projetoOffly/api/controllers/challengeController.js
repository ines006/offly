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
    const [result] = await sequelize.query(
      "SELECT img FROM challenges WHERE id = ?",
      {
        replacements: [challengeId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!result || !result.img) {
      return res.status(404).send("Imagem não encontrada.");
    }

    // Redireciona para a URL da imagem
    return res.redirect(result.img);
  } catch (error) {
    console.error("Erro ao redirecionar para imagem:", error);
    return res.status(500).send("Erro interno ao obter imagem.");
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

    // Cria o intervalo de data do dia exato
    const inicioDia = new Date(`${ano}-${mesFormatado}-${diaFormatado}T00:00:00.000Z`);
    const proximoDia = new Date(inicioDia);
    proximoDia.setDate(proximoDia.getDate() + 1); // Dia seguinte às 00:00

    const teamMembers = await Participants.findAll({
      where: {
        teams_id: participante.teams_id,
      },
      attributes: ["id", "name", "image"],
    });

    const completedChallenges = await ParticipantsHasChallenges.findAll({
      where: {
        completed_date: {
          [Op.gte]: inicioDia,
          [Op.lt]: proximoDia,
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
      order: [["completed_date", "ASC"]],
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
       AND validated = 0
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
        ORDER BY starting_date DESC
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


exports.validateTeamChallenge = async (req, res) => {
  const { teamId } = req.params;

  try {
    if (!teamId) {
      return res.status(400).json({ message: "teamId é obrigatório." });
    }

    const teamIdInt = parseInt(teamId, 10);
    if (isNaN(teamIdInt)) {
      return res.status(400).json({ message: "teamId inválido." });
    }

    // Buscar o desafio ativo (não validado ainda) mais recente da equipe
    const [challengeRecord] = await sequelize.query(
      `SELECT challenges_id FROM challenges_has_teams 
       WHERE teams_id = ? AND validated = 0 
       ORDER BY starting_date DESC LIMIT 1`,
      {
        replacements: [teamIdInt],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!challengeRecord) {
      return res.status(404).json({ message: "Desafio não encontrado ou já validado." });
    }

    const challengeId = challengeRecord.challenges_id;

    // Marcar o desafio como validado na tabela challenges_has_teams
    await sequelize.query(
      `UPDATE challenges_has_teams 
       SET validated = 1 
       WHERE teams_id = ? AND challenges_id = ?`,
      {
        replacements: [teamIdInt, challengeId],
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Validar também para os participantes da equipa
    await sequelize.query(
      `UPDATE participants_has_challenges 
       SET validated = 1 
       WHERE challenges_id = ? 
       AND participants_id IN (
         SELECT id FROM participants WHERE teams_id = ?
       )`,
      {
        replacements: [challengeId, teamIdInt],
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Buscar os streaks dos participantes da equipa
    const participantes = await sequelize.query(
  `
        SELECT phc.streak 
        FROM participants_has_challenges phc
        JOIN participants p ON p.id = phc.participants_id
        WHERE p.teams_id = ? AND phc.challenges_id = ?
        `,
        {
          replacements: [teamId, challengeId], 
          type: sequelize.QueryTypes.SELECT,
        }
      );

    let totalBolinhasAzuis = 0;
    const totalPossivel = participantes.length * 7;

    participantes.forEach(p => {
      try {
        const parsedStreak = JSON.parse(p.streak);
        totalBolinhasAzuis += parsedStreak.filter(val => val === "1" || val === 1).length;
      } catch (e) {
        console.warn("Erro ao fazer parse do streak:", p.streak);
      }
    });

    let progresso = 0;
    if (totalPossivel > 0) {
      progresso = Math.round((totalBolinhasAzuis / totalPossivel) * 100);
    }

    // Buscar pontos atuais da equipa
    const [team] = await sequelize.query(
      `SELECT points FROM teams WHERE id = ?`,
      {
        replacements: [teamIdInt],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!team) {
      return res.status(404).json({ message: "Equipe não encontrada." });
    }

    const pontosAtuais = team.points || 0;
    const novosPontos = pontosAtuais + progresso;

    // Atualizar pontos da equipa
    const [updateResult] = await sequelize.query(
      `UPDATE teams SET points = ? WHERE id = ?`,
      {
        replacements: [novosPontos, teamIdInt],
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    if (updateResult === 0) {
      console.warn("Nenhuma linha foi atualizada na tabela teams.");
    }

    return res.json({
      message: "Desafio da equipe e dos participantes validado com sucesso.",
      pontosGanhos: progresso,
      pontosTotais: novosPontos,
    });

  } catch (error) {
    console.error("Erro ao validar desafio:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

