const {
  Participants,
  Teams,
  Competitions,
  Challenges,
  ParticipantsHasChallenges,
} = require("../models");
const { Op, literal } = require("sequelize");

// Listar informações de uma equipa

exports.getTeamParticipants = async (req, res) => {
  try {
    const team = await Teams.findByPk(req.params.id, {
      attributes: ["team_name", "points", "capacity"],
      include: [
        {
          model: Participants,
          as: "participants",
          attributes: ["id_participants", "participant_name"],
          required: false,
        },
        {
          model: Competitions,
          as: "competition",
          attributes: ["competition_name"],
          required: false,
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ message: "Equipe não encontrada" });
    }

    res.json({
      team_name: team.team_name,
      points: team.points,
      capacity: team.capacity,
      competition_name: team.competition
        ? team.competition.competition_name
        : null,
      participants: team.participants.map((p) => ({
        id_participants: p.id_participants,
        participant_name: p.participant_name,
      })),
    });
  } catch (error) {
    console.error(
      "Erro detalhado ao listar participantes da equipe:",
      error.stack
    );
    res
      .status(500)
      .json({ message: "Erro ao listar participantes", error: error.message });
  }
};

// Criar uma nova equipa
exports.createTeam = async (req, res) => {
  try {
    const {
      team_name,
      team_description,
      points,
      capacity,
      visibility,
      competitions_id_competitions,
      team_passbooks_id_team_passbooks,
      team_admin,
    } = req.body;

    if (!team_name) {
      return res
        .status(400)
        .json({ message: "O nome da equipe é obrigatório" });
    }

    if (competitions_id_competitions) {
      const competition = await Competitions.findByPk(
        competitions_id_competitions
      );
      if (!competition) {
        return res.status(404).json({ message: "Competição não encontrada" });
      }
    }

    const newTeam = await Teams.create({
      team_name,
      team_description,
      points: 100,
      capacity,
      visibility,
      competitions_id_competitions,
      team_passbooks_id_team_passbooks,
      team_admin,
    });

    res.status(201).json({
      id_teams: newTeam.id_teams,
      team_name: newTeam.team_name,
      team_description: newTeam.team_description,
      points: newTeam.points,
      capacity: newTeam.capacity,
      visibility: newTeam.visibility,
      competitions_id_competitions: newTeam.competitions_id_competitions,
      team_passbooks_id_team_passbooks:
        newTeam.team_passbooks_id_team_passbooks,
      team_admin: newTeam.team_admin,
    });
  } catch (error) {
    console.error("Erro detalhado ao criar equipe:", error.stack);
    res
      .status(500)
      .json({ message: "Erro ao criar equipe", error: error.message });
  }
};

exports.getCompetitionRanking = async (req, res) => {
  try {
    const competitionId = req.params.id;

    // Pesquisar pelo nome da competição
    const competition = await Competitions.findByPk(competitionId, {
      attributes: ["competition_name"],
    });
    if (!competition) {
      return res.status(404).json({ message: "Competição não encontrada" });
    }

    // Listar todas as equipas da competição
    const teams = await Teams.findAll({
      where: {
        competitions_id_competitions: competitionId,
      },
      attributes: ["team_name", "points"],
      order: [["points", "DESC"]], // Ordenar os pontos em ordem descendente
    });

    if (!teams.length) {
      return res
        .status(404)
        .json({ message: "Nenhuma equipa encontrada para esta competição" });
    }

    res.json({
      competition_name: competition.competition_name,
      ranking: teams.map((team) => ({
        team_name: team.team_name,
        points: team.points,
      })),
    });
  } catch (error) {
    console.error(
      "Erro detalhado ao listar ranking da competição:",
      error.stack
    );
    res
      .status(500)
      .json({ message: "Erro ao listar ranking", error: error.message });
  }
};

exports.getTeamChallenges = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { date } = req.query; // Pegar a data como query param (ex.: ?date=2025-04-01)

    // Validação: data é obrigatória
    if (!date) {
      return res
        .status(400)
        .json({ message: "A data é obrigatória (use ?date=YYYY-MM-DD)" });
    }

    // Verificar se a equipa existe
    const team = await Teams.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Equipe não encontrada" });
    }

    const challenges = await ParticipantsHasChallenges.findAll({
      where: {
        validated: 1,
        starting_date: {
          [Op.lte]: literal(`"${date}" + INTERVAL 24 HOUR`), // starting_date <= date + 24h
        },
        end_date: {
          [Op.gte]: literal(`"${date}"`), // end_date >= date
        },
        completed_date: {
          [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`], // completed_date = date
        },
        // Diferença de tempo <= 24 horas
        [Op.and]: literal("TIMESTAMPDIFF(HOUR, starting_date, end_date) <= 24"),
      },
      include: [
        {
          model: Participants,
          as: "participant", // Alias padrão do belongsTo
          where: { teams_id_teams: teamId },
          attributes: ["participant_name"],
          include: [
            {
              model: Teams,
              as: "team",
              attributes: ["team_description"],
            },
          ],
        },
        {
          model: Challenges,
          as: "Challenge", // Alias padrão do belongsTo
          attributes: ["challenge_title"],
        },
      ],
      order: [["completed_date", "ASC"]],
    });

    if (!challenges.length) {
      return res.status(404).json({
        message:
          "Nenhum desafio encontrado para esta equipe na data especificada",
      });
    }

    res.json(
      challenges.map((challenge) => ({
        team_description: challenge.participant.team.team_description,
        participant_name: challenge.participant.participant_name,
        challenge_title: challenge.Challenge.challenge_title,
        starting_date: challenge.starting_date,
        end_date: challenge.end_date,
        completed_date: challenge.completed_date,
        validated: challenge.validated,
      }))
    );
  } catch (error) {
    console.error("Erro detalhado ao listar desafios da equipe:", error.stack);
    res
      .status(500)
      .json({ message: "Erro ao listar desafios", error: error.message });
  }
};

module.exports = exports;
