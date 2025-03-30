const { Participants, Teams, Competitions } = require("../models");

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

module.exports = exports;
