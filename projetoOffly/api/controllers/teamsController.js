const { Sequelize } = require("sequelize"); // Importa o Sequelize principal
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
      attributes: ["name", "points", "capacity"],
      include: [
        {
          model: Participants,
          as: "participants",
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: Competitions,
          as: "competition",
          attributes: ["name"],
          required: false,
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ message: "Equipe não encontrada" });
    }

    res.json({
      name: team.name,
      points: team.points,
      capacity: team.capacity,
      name: team.competition ? team.competition.name : null,
      participants: team.participants.map((p) => ({
        id: p.id,
        name: p.name,
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
      name,
      description,
      points,
      capacity,
      visibility,
      competitions_id,
      team_passbooks_id,
      team_admin,
    } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "O nome da equipe é obrigatório" });
    }

    if (competitions_id) {
      const competition = await Competitions.findByPk(competitions_id);
      if (!competition) {
        return res.status(404).json({ message: "Competição não encontrada" });
      }
    }

    const newTeam = await Teams.create({
      name,
      description,
      points: 100,
      capacity,
      visibility,
      competitions_id,
      team_passbooks_id,
      team_admin,
    });

    res.status(201).json({
      id: newTeam.id,
      name: newTeam.name,
      description: newTeam.description,
      points: newTeam.points,
      capacity: newTeam.capacity,
      visibility: newTeam.visibility,
      competitions_id: newTeam.competitions_id,
      team_passbooks_id: newTeam.team_passbooks_id,
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
    const { sort } = req.query; // Pega o query param 'sort'

    // Pesquisar pelo nome da competição
    const competition = await Competitions.findByPk(competitionId, {
      attributes: ["name"],
    });
    if (!competition) {
      return res.status(404).json({ message: "Competição não encontrada" });
    }

    // Configurar opções de ordenação com base no query param
    const order = sort === "ranking" ? [["points", "DESC"]] : [];

    // Listar todas as equipas da competição
    const teams = await Teams.findAll({
      where: {
        competitions_id: competitionId,
      },
      attributes: ["name", "points"],
      order, // Aplica ordenação se sort=ranking, senão retorna sem ordenação específica
    });

    if (!teams.length) {
      return res
        .status(404)
        .json({ message: "Nenhuma equipa encontrada para esta competição" });
    }

    res.json({
      competition_name: competition.name,
      teams: teams.map((team) => ({
        name: team.name,
        points: team.points,
      })),
    });
  } catch (error) {
    console.error(
      "Erro detalhado ao listar equipas da competição:",
      error.stack
    );
    res
      .status(500)
      .json({ message: "Erro ao listar equipas", error: error.message });
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
          where: { teams_id: teamId },
          attributes: ["name"],
          include: [
            {
              model: Teams,
              as: "team",
              attributes: ["description"],
            },
          ],
        },
        {
          model: Challenges,
          as: "Challenge", // Alias padrão do belongsTo
          attributes: ["title", "description"],
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
        description: challenge.participant.team.description,
        name: challenge.participant.name,
        title: challenge.Challenge.title,
        description: challenge.Challenge.description,
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

//Listar as streak's dos participantes de uma equipa

exports.getTeamParticipantsStreaks = async (req, res) => {
  try {
    const teamId = req.params.id;

    // Verificar se a equipa existe
    const team = await Teams.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Equipe não encontrada" });
    }

    const streaks = await ParticipantsHasChallenges.findAll({
      where: {
        validated: 1,
        streak: { [Op.ne]: null },
        [Op.and]: literal(
          "TIMESTAMPDIFF(DAY, ParticipantsHasChallenges.starting_date, ParticipantsHasChallenges.end_date) <= 7"
        ),
      },
      include: [
        {
          model: Participants,
          as: "participant",
          where: { teams_id: teamId },
          attributes: ["name"],
          include: [
            {
              model: Teams,
              as: "team",
              attributes: ["id"],
              include: [
                {
                  model: Competitions,
                  as: "competition",
                  attributes: ["name"],
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: Challenges,
          as: "Challenge",
          attributes: ["description"],
          required: false,
        },
      ],
      order: [[{ model: Participants, as: "participant" }, "name", "ASC"]],
    });

    if (!streaks.length) {
      return res.status(404).json({
        message: "Nenhum participante com streak encontrado para esta equipe",
      });
    }

    // Converter os objetos Sequelize em objetos JavaScript puros antes do map
    const streaksData = streaks.map((s) => s.toJSON());

    res.json(
      streaksData.map((streak) => ({
        participant_name: streak.participant.name,
        streak: streak.streak,
        competition_name: streak.participant.team.competition.name,
        description: streak.Challenge.description,
      }))
    );
  } catch (error) {
    console.error(
      "Erro detalhado ao listar streaks dos participantes:",
      error.stack
    );
    res
      .status(500)
      .json({ message: "Erro ao listar streaks", error: error.message });
  }
};

// Listar equipas com filtro opcional de lotação < 5 participantes
exports.getTeams = async (req, res) => {
  try {
    const { capacity } = req.query; // Pega o query param 'capacity'

    // Condição base
    let havingCondition = null;
    if (capacity === "under_5") {
      havingCondition = Sequelize.literal("COUNT(`participants`.`id`) < 5");
    }

    const teams = await Teams.findAll({
      attributes: [
        "name",
        "capacity",
        [
          Sequelize.fn("COUNT", Sequelize.col("participants.id")),
          "participant_count",
        ],
      ],
      include: [
        {
          model: Participants,
          as: "participants",
          attributes: [],
        },
      ],
      group: ["Teams.id", "Teams.name", "Teams.capacity"],
      having: havingCondition, // Aplica o filtro apenas se capacity=under_5
      raw: true,
    });

    if (!teams.length && capacity === "under_5") {
      return res.status(404).json({
        message: "Nenhuma equipa encontrada com menos de 5 participantes",
      });
    }

    res.json(teams);
  } catch (error) {
    console.error("Erro ao listar equipas:", error);
    res
      .status(500)
      .json({ message: "Erro ao listar equipas", error: error.message });
  }
};

module.exports = exports;
