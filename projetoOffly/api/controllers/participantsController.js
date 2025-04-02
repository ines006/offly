const {
  Participants,
  Teams,
  Answers,
  ParticipantsHasChallenges,
  Challenges,
} = require("../models");
const { Sequelize, Op } = require("sequelize");

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
    const { name, username, level, email, password_hash, gender, upload } =
      req.body;

    if (!name || !username || !level || !email || !password_hash || !gender) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    const newParticipant = await Participants.create({
      name,
      username,
      level,
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
      { where: { id: req.params.id } }
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
      where: { id: req.params.id },
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
      having: Sequelize.literal("COUNT(`participants`.`id`) < 5"),
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
      id: participant.id,
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
    if (participant.answers_id) {
      // Atualiza a resposta existente
      [answer] = await Answers.update(
        { answers: answersString },
        {
          where: { id: participant.answers_id },
          returning: true,
        }
      );
      answer = await Answers.findByPk(participant.answers_id);
    } else {
      // Cria uma nova resposta
      answer = await Answers.create({ answers: answersString });
      // Associa ao participante
      await participant.update({ answers_id: answer.id });
    }

    res.status(201).json({
      id: participant.id,
      answers: answer.answers,
    });
  } catch (error) {
    console.error("Erro ao adicionar respostas do participante:", error);
    res.status(500).json({ message: "Erro ao adicionar respostas", error });
  }
};

// GET → Verificar se o participante tem desafio ativo hoje
exports.getDailyChallenge = async (req, res) => {
  try {
    const { id } = req.params; // ID do participante

    const challenge = await ParticipantsHasChallenges.findOne({
      where: {
        participants_id: id,
        validated: 0,
        starting_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Challenges,
          as: "Challenge", // Certifique-se de que este alias corresponde ao modelo
          attributes: ["title", "description"],
        },
      ],
    });

    if (challenge) {
      return res.json({ active: true, challenge });
    } else {
      return res.json({
        active: false,
        message: "Nenhum desafio ativo encontrado.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao buscar desafio diário", details: error.message });
  }
};

// POST → Criar um novo desafio e associá-lo ao participante
exports.createDailyChallenge = async (req, res) => {
  try {
    const { id } = req.params; // ID do participante
    const { title, description, level } = req.body;

    if (!title || !description || !level) {
      return res.status(400).json({
        error: "Os campos 'title', 'description' e 'level' são obrigatórios.",
      });
    }

    // Criar novo desafio e garantir que retorna um ID
    const newChallenge = await Challenges.create({
      title,
      description,
      challenge_types_id_challenge_types: 1,
    });

    if (!newChallenge || !newChallenge.id) {
      return res.status(500).json({ error: "Falha ao criar o desafio." });
    }

    // Associar ao participante garantindo valores padrão
    await ParticipantsHasChallenges.create({
      participants_id: id,
      challenges_id: newChallenge.id, // Agora garantindo que estamos pegando o ID corretamente
      starting_date: new Date(),
      end_date: new Date(new Date().setHours(23, 59, 59)), // Termina às 23h59 do mesmo dia
      validated: 0,
      streak: 0,
      challenge_levels_id_challenge_levels: level,
      completed_date: null,
      user_img: "",
    });

    return res.status(201).json({
      message: "Desafio criado e associado ao participante!",
      challenge: newChallenge,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao criar desafio", details: error.message });
  }
};

// PUT → Marcar desafio como concluído
exports.completeDailyChallenge = async (req, res) => {
  try {
    const { id } = req.params; // ID do participante
    const { challengeId, userImg } = req.body;

    const updated = await ParticipantsHasChallenges.update(
      { validated: 1, completed_date: new Date(), user_img: userImg },
      {
        where: {
          participants_id: id,
          challenges_id: challengeId,
        },
      }
    );

    if (updated[0] > 0) {
      return res.json({ message: "Desafio concluído com sucesso!" });
    } else {
      return res
        .status(404)
        .json({ message: "Nenhum desafio encontrado para atualizar" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erro ao concluir desafio", details: error.message });
  }
};

module.exports = exports;
