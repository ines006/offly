const { Participants, Teams, Answers } = require("../models");
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
    const { name, username, email, password_hash, gender, upload } = req.body;

    if (!name || !username || !email || !password_hash || !gender) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    const newParticipant = await Participants.create({
      name,
      username,
      email,
      password_hash,
      gender,
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
    const { name, username, email, password_hash } = req.body;

    const [updated] = await Participants.update(
      {
        name,
        username,
        email,
        password_hash,
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
        "name",
        "capacity",
        [
          Sequelize.fn("COUNT", Sequelize.col("participants.id_participants")),
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
      group: ["Teams.id_teams", "Teams.name", "Teams.capacity"],
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

// Listar respostas de um participante ao questionário inicial

exports.getParticipantAnswers = async (req, res) => {
  try {
    const participant = await Participants.findByPk(req.params.id, {
      include: [
        {
          model: Answers,
          attributes: ["answers"],
          as: "answer",
          required: false,
        },
      ],
    });

    if (!participant) {
      return res.status(404).json({ message: "Participante não encontrado" });
    }

    res.json({
      id_participants: participant.id_participants,
      answers: participant.answer ? participant.answer.answers : null,
    });
  } catch (error) {
    console.error("Erro ao buscar respostas do participante:", error);
    res.status(500).json({ message: "Erro ao buscar respostas", error });
  }
};

//  Adicionar respostas do questionário inicial
exports.addParticipantAnswers = async (req, res) => {
  try {
    const participant = await Participants.findByPk(req.params.id);

    if (!participant) {
      return res.status(404).json({ message: "Participante não encontrado" });
    }

    const { answers } = req.body; // Espera um array ou string JSON no corpo da requisição
    if (!answers) {
      return res.status(400).json({ message: "As respostas são obrigatórias" });
    }

    // Converte o array em string JSON, se necessário
    const answersString = Array.isArray(answers)
      ? JSON.stringify(answers)
      : answers;

    // Verifica se já existe uma resposta associada
    let answer;
    if (participant.answers_id_answers) {
      // Atualiza a resposta existente
      [answer] = await Answers.update(
        { answers: answersString },
        {
          where: { id_answers: participant.answers_id_answers },
          returning: true,
        }
      );
      answer = await Answers.findByPk(participant.answers_id_answers);
    } else {
      // Cria uma nova resposta
      answer = await Answers.create({ answers: answersString });
      // Associa ao participante
      await participant.update({ answers_id_answers: answer.id_answers });
    }

    res.status(201).json({
      id_participants: participant.id_participants,
      answers: answer.answers,
    });
  } catch (error) {
    console.error("Erro ao adicionar respostas do participante:", error);
    res.status(500).json({ message: "Erro ao adicionar respostas", error });
  }
};

module.exports = exports;
