const { Sequelize } = require("sequelize"); // Importa o Sequelize principal
const {
  Participants,
  Teams,
  Competitions,
  Challenges,
  ParticipantsHasChallenges,
} = require("../models");
const { Op, literal } = require("sequelize");

// Listar informações de uma equipa "x"

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
      return res.status(404).json({ message: "Team not found" });
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
    console.error("Error listing participants:", error.stack);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//Criação de equipa
exports.createTeam = async (req, res) => {
  try {
    // Verificar autenticação
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Verificar se o usuário já pertence a uma equipe
    const participant = await Participants.findByPk(req.user.id);
    if (participant && participant.teams_id) {
      return res.status(403).json({
        message: "You are already a member of a team",
      });
    }

    const {
      name,
      description,
      capacity,
      visibility,
      competitions_id,
      team_passbooks_id,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // Normalizar o nome para minúsculas
    const normalizedName = name.toLowerCase();

    // Validar limite de caracteres para name
    if (normalizedName.length < 3 || normalizedName.length > 40) {
      return res
        .status(422)
        .json({ message: "Team name must be between 3 and 40 characters" });
    }

    // Validar limite de caracteres para description
    if (description && (description.length < 3 || description.length > 60)) {
      return res
        .status(422)
        .json({ message: "Description must be between 3 and 60 characters" });
    }

    // Validar capacity
    if (
      capacity === undefined ||
      !Number.isInteger(capacity) ||
      capacity < 3 ||
      capacity > 5
    ) {
      return res
        .status(422)
        .json({ message: "Team capacity must be an integer between 3 and 5" });
    }

    // Validar visibility
    if (visibility !== 0 && visibility !== 1) {
      return res
        .status(422)
        .json({ message: "Visibility must be 0 (public) or 1 (private)" });
    }

    // Verificar se o nome da equipe já existe (case-insensitive)
    const existingTeam = await Teams.findOne({
      where: { name: normalizedName },
    });
    if (existingTeam) {
      return res
        .status(409)
        .json({ message: "A team with this name already exists" });
    }

    if (competitions_id) {
      const competition = await Competitions.findByPk(competitions_id);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
    }

    // Criar a nova equipa com o utilizador como admin
    const newTeam = await Teams.create({
      name: normalizedName,
      description,
      points: 100,
      capacity,
      visibility,
      competitions_id,
      team_passbooks_id,
      team_admin: req.user.id, // Definir o utilizador como admin
    });

    // Associar o participante à equipa como membro e administrador
    const [updatedRows] = await Participants.update(
      {
        teams_id: newTeam.id,
        teams_team_admin: newTeam.id, // Definir o utilizador como admin da equipa
      },
      { where: { id: req.user.id } }
    );

    if (updatedRows === 0) {
      // Reverter a criação da equipa se a associação falhar
      await Teams.destroy({ where: { id: newTeam.id } });
      return res.status(500).json({
        message: "Failed to associate user with the team",
      });
    }

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
    console.error("Error creating team:", error.stack);
    res
      .status(500)
      .json({ message: "Error creating team", error: error.message });
  }
};

// Listar equipas de uma competição com ordenação opcional por ranking
exports.getTeamsByCompetition = async (req, res) => {
  try {
    const competitionId = req.params.id; // ID da competição
    const { sort } = req.query; // Pega o query param 'sort'

    // Pesquisar pelo nome da competição
    const competition = await Competitions.findByPk(competitionId, {
      attributes: ["name"],
    });
    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
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
        .json({ message: "No teams found for this competition" });
    }

    res.json({
      competition_name: competition.name,
      teams: teams.map((team) => ({
        name: team.name,
        points: team.points,
      })),
    });
  } catch (error) {
    console.error("Error listing teams:", error.stack);
    res
      .status(500)
      .json({ message: "Error listing teams", error: error.message });
  }
};

//Desafios diários validados dos participantes de uma equipa
exports.getTeamChallenges = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { date } = req.query; // Pegar a data como query param (ex.: ?date=2025-04-01)

    // Validação: data é obrigatória
    if (!date) {
      return res
        .status(422)
        .json({ message: "The date is required (use ?date=YYYY-MM-DD)" });
    }

    // Verificar se a equipa existe
    const team = await Teams.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
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
        message: "No challenges found for this team on the specified dat",
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
    console.error("Error listing challenges:", error.stack);
    res
      .status(500)
      .json({ message: "Error listing challenges", error: error.message });
  }
};

// Listar streaks dos participantes de uma equipa em desafios semanais
exports.getTeamParticipantsStreaks = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { week } = req.query; // Ex.: ?week=2025-03-31 (segunda-feira da semana)

    // Validação: semana é obrigatória
    if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
      return res.status(422).json({
        message:
          "The week is required and must be in YYYY-MM-DD format (e.g., 2025-03-31)",
      });
    }

    // Verificar se a data é uma segunda-feira
    const startDate = new Date(week);
    if (startDate.getDay() !== 1) {
      // 1 = segunda-feira
      return res.status(422).json({ message: "The date must be a Monday" });
    }

    // Verificar se a equipa existe
    const team = await Teams.findByPk(teamId, {
      include: [
        {
          model: Competitions,
          as: "competition",
          attributes: ["name"],
          required: true,
        },
      ],
    });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Determinar o intervalo da semana (segunda a domingo)
    const startDateStr = startDate.toISOString().split("T")[0]; // Ex.: 2025-03-31

    // Calcular endDateStr como startDate + 7 dias (para corresponder ao end_date na base de dados)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7); // 7 dias a partir de startDate (inclusive)
    const endDateStr = endDate.toISOString().split("T")[0]; // Ex.: 2025-04-07

    // Buscar desafios semanais para a equipa na semana especificada
    const weeklyChallenges = await ParticipantsHasChallenges.findAll({
      where: {
        starting_date: {
          [Op.between]: [
            `${startDateStr} 00:00:00`,
            `${startDateStr} 23:59:59`,
          ], // Começa no dia especificado
        },
        end_date: {
          [Op.between]: [`${endDateStr} 00:00:00`, `${endDateStr} 23:59:59`], // Termina 7 dias depois
        },
        [Op.and]: literal("TIMESTAMPDIFF(DAY, starting_date, end_date) = 7"),
      },
      include: [
        {
          model: Participants,
          as: "participant",
          where: { teams_id: teamId },
          attributes: ["id", "name"],
        },
        {
          model: Challenges,
          as: "Challenge",
          attributes: ["description"],
          required: false,
        },
      ],
    });

    if (!weeklyChallenges.length) {
      // Log adicional para verificar todos os desafios da equipa (sem filtro de data)
      const allChallenges = await ParticipantsHasChallenges.findAll({
        include: [
          {
            model: Participants,
            as: "participant",
            where: { teams_id: teamId },
            attributes: ["id", "name"],
          },
        ],
      });

      return res.status(404).json({
        message:
          "No weekly challenges found for this team in the specified week",
      });
    }

    // Mapear os desafios para a resposta, parseando o streak
    const streaks = weeklyChallenges.map((challenge) => {
      // Parsear o streak (assumindo que é uma string JSON)
      let streak;
      try {
        streak =
          typeof challenge.streak === "string"
            ? JSON.parse(challenge.streak)
            : challenge.streak;
        if (typeof streak === "string") {
          streak = JSON.parse(streak);
        }
      } catch (error) {
        console.error("Erro ao parsear o streak:", error.message);
        streak = ["0", "0", "0", "0", "0", "0", "0"];
      }

      // Verificar se o streak é um array válido com 7 elementos
      if (!Array.isArray(streak) || streak.length !== 7) {
        console.warn("Streak inválido, usando padrão:", streak);
        streak = ["0", "0", "0", "0", "0", "0", "0"];
      }

      return {
        participant_name: challenge.participant.name,
        streak,
        competition_name: team.competition.name,
        challenge_description:
          challenge.Challenge?.description || "Sem descrição",
      };
    });

    res.json(streaks);
  } catch (error) {
    console.error("Error listing streaks:", error.stack);
    res
      .status(500)
      .json({ message: "Error listing streaks", error: error.message });
  }
};

// Listar equipas com filtro opcional de lotação < 5 participantes e paginação
exports.getTeams = async (req, res) => {
  try {
    const { capacity, page = 1 } = req.query; // page padrão é 1
    const limit = 4; // Máximo 4 equipes por página
    const offset = (parseInt(page) - 1) * limit; // Calcular offset

    // Validar page
    if (isNaN(page) || parseInt(page) < 1) {
      return res.status(422).json({
        message: "Parameter must be greater than or equal to 1.",
      });
    }

    // Condição base para filtro de capacity
    let havingCondition = null;
    if (capacity === "under-5") {
      havingCondition = Sequelize.literal("COUNT(`participants`.`id`) < 5");
    }

    // Contar total de equipes (para metadados da paginação)
    const totalTeamsResult = await Teams.findAll({
      attributes: [
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.fn("DISTINCT", Sequelize.col("Teams.id"))
          ),
          "total",
        ],
      ],
      include: [
        {
          model: Participants,
          as: "participants",
          attributes: [],
          required: false, // LEFT JOIN
        },
      ],
      group: ["Teams.id"],
      having: havingCondition,
      raw: true,
      subQuery: false, // Evitar subquery
    });

    const totalTeams = totalTeamsResult.length;
    const totalPages = Math.ceil(totalTeams / limit);

    // Buscar equipes com paginação
    const teams = await Teams.findAll({
      attributes: [
        "name",
        "capacity",
        [
          Sequelize.fn("COUNT", Sequelize.col("participants.id")), // Usar alias participants
          "participant_count",
        ],
      ],
      include: [
        {
          model: Participants,
          as: "participants",
          attributes: [],
          required: false, // LEFT JOIN
        },
      ],
      group: ["Teams.id", "Teams.name", "Teams.capacity"],
      having: havingCondition,
      order: [[Sequelize.literal("participant_count"), "DESC"]],
      limit: limit,
      offset: offset,
      raw: true,
      subQuery: false,
      logging: console.log,
    });

    if (!teams.length && capacity === "under-5") {
      return res.status(404).json({
        message: "No teams found with fewer than 5 participants",
      });
    }

    if (!teams.length && page > 1) {
      return res.status(404).json({
        message: "No teams found for this page",
      });
    }

    res.json({
      teams,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalTeams: totalTeams,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error listing teams:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Pesquisar equipas por nome na barra de pesquisa
exports.searchTeamsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res
        .status(422)
        .json({ message: "The 'name' parameter is required" });
    }

    const teams = await Teams.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`, // Usa LIKE em vez de ILIKE
        },
      },
      attributes: [
        "id",
        "name",
        "description",
        "points",
        "capacity",
        "visibility",
        "competitions_id",
        "team_passbooks_id",
        "team_admin",
      ],
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

    if (!teams.length) {
      return res.status(404).json({ message: "No teams found with this name" });
    }

    res.json(
      teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        points: team.points,
        capacity: team.capacity,
        visibility: team.visibility,
        competitions_id: team.competitions_id,
        competition_name: team.competition ? team.competition.name : null,
        team_passbooks_id: team.team_passbooks_id,
        team_admin: team.team_admin,
        participants: team.participants.map((p) => ({
          id: p.id,
          name: p.name,
        })),
      }))
    );
  } catch (error) {
    console.error("Error searching teams", error.stack);
    res
      .status(500)
      .json({ message: "Error searching teams", error: error.message });
  }
};

module.exports = exports;
