const { Participants, Teams } = require("../models");
const { Sequelize } = require("sequelize");

// Listar todos os participantes
exports.getAllParticipants = async (req, res) => {
  try {
    const participants = await Participants.findAll();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: "Erro ao pesquisar participantes", error });
  }
};

// Procurar um participante por ID
exports.getParticipantById = async (req, res) => {
  try {
    const participant = await Participants.findByPk(req.params.id);
    participant
      ? res.json(participant)
      : res.status(404).json({ message: "Participante não encontrado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao pesquisar o participante", error });
  }
};

// Criar um novo participante
exports.createParticipant = async (req, res) => {
  try {
    const {
      participant_name,
      participant_username,
      email,
      password_hash,
      participant_gender,
      upload,
    } = req.body;

    if (
      !participant_name ||
      !participant_username ||
      !email ||
      !password_hash ||
      !participant_gender
    ) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    const newParticipant = await Participants.create({
      participant_name,
      participant_username,
      email,
      password_hash,
      participant_gender,
      upload,
    });
    res.status(201).json(newParticipant);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar participante", error });
  }
};

// Atualizar os dados de um participante
exports.updateParticipant = async (req, res) => {
  try {
    const {
      participant_name,
      participant_username,
      email,
      password_hash,
      participant_gender,
      upload,
    } = req.body;

    const [updated] = await Participants.update(
      {
        participant_name,
        participant_username,
        email,
        password_hash,
        participant_gender,
        upload,
      },
      { where: { id_participants: req.params.id } }
    );

    updated
      ? res.json({ message: "Participante atualizado" })
      : res.status(404).json({ message: "Participante não encontrado" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar participante", error });
  }
};

// Eliminar um participante
exports.deleteParticipant = async (req, res) => {
  try {
    const deleted = await Participants.destroy({
      where: { id_participants: req.params.id },
    });

    deleted
      ? res.json({ message: "Participante eliminado" })
      : res.status(404).json({ message: "Participante não encontrado" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao eliminar participante", error });
  }
};

// Listar equipas com menos de 5 participantes
exports.getTeamsUnderFive = async (req, res) => {
  try {
    const teams = await Teams.findAll({
      attributes: [
        "team_name",
        "capacity",
        [
          Sequelize.fn("COUNT", Sequelize.col("participants.id_participants")),
          "participant_count",
        ],
      ],
      include: [
        {
          model: Participants,
          attributes: [],
        },
      ],
      group: ["Teams.id_teams", "Teams.team_name", "Teams.capacity"],
      having: Sequelize.literal("COUNT(`participants`.`id_participants`) < 5"),
      raw: true,
    });

    res.json(teams);
  } catch (error) {
    console.error(
      "Erro ao listar equipas com menos de 5 participantes:",
      error
    );
    res.status(500).json({ message: "Erro ao listar equipas", error });
  }
};

module.exports = exports;
