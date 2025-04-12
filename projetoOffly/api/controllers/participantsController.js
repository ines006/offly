const {
  Participants,
  Teams,
  Answers,
  ParticipantsHasChallenges,
  Challenges,
} = require("../models");
const { Sequelize, Op } = require("sequelize");
const bcrypt = require("bcryptjs");

// Listar todos os participantes
exports.getAllParticipants = async (req, res) => {
  try {
    const participants = await Participants.findAll({
      attributes: { exclude: ["password_hash"] },
    });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: "Erro ao pesquisar participantes", error });
  }
};

// Procurar um participante por ID
exports.getParticipantById = async (req, res) => {
  try {
    const participant = await Participants.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash"] },
    });
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
    const { name, username, email, password, gender, level = 1 } = req.body;

    if (!name || !username || !email || !password || gender === undefined) {
      return res
        .status(422)
        .json({ message: "Todos os campos são obrigatórios" });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({ message: "Formato de email inválido" });
    }

    // Validar comprimento mínimo da palavra-passe
    if (password.length < 6) {
      return res
        .status(422)
        .json({ message: "A palavra-passe deve ter pelo menos 6 caracteres" });
    }

    // Validar que a palavra-passe contém maiúsculas, minúsculas e caracteres especiais
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "A palavra-passe deve conter pelo menos uma letra maiúscula, uma minúscula e um caractere especial",
      });
    }

    // Validar valores permitidos para gender
    if (gender !== 0 && gender !== 1) {
      return res.status(422).json({
        message: "O campo gender deve ser 0 (masculino) ou 1 (feminino)",
      });
    }

    // Verificar se o username já existe
    const existingUsername = await Participants.findOne({
      where: { username },
    });
    if (existingUsername) {
      return res.status(409).json({ message: "Username já está em uso" });
    }

    // Verificar se o email já existe
    const existingEmail = await Participants.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email já está em uso" });
    }

    // Hashear a palavra-passe com bcrypt
    const password_hash = await bcrypt.hash(password, 10);

    const participant = await Participants.create({
      name,
      username,
      email,
      password_hash,
      gender,
      level,
    });

    res.status(201).json({ id: participant.id, email: participant.email });
  } catch (error) {
    console.error("Erro ao criar participante:", error.stack);
    res
      .status(500)
      .json({ message: "Erro ao criar participante", error: error.message });
  }
};

// Atualizar os dados de um participante
exports.updateParticipant = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const { id } = req.params;

    // Verificar se o participante existe
    const participant = await Participants.findByPk(id);
    if (!participant) {
      return res.status(404).json({ message: "Participante não encontrado" });
    }

    // Verificar se pelo menos um campo foi fornecido
    if (!name && !username && !email && !password) {
      return res.status(422).json({
        message: "Pelo menos um campo deve ser fornecido para atualização",
      });
    }

    // Validar que campos fornecidos não sejam vazios
    if (name === "") {
      return res.status(422).json({ message: "O nome não pode ser vazio" });
    }
    if (username === "") {
      return res.status(422).json({ message: "O username não pode ser vazio" });
    }
    if (email === "") {
      return res.status(422).json({ message: "O email não pode ser vazio" });
    }
    if (password === "") {
      return res
        .status(422)
        .json({ message: "A palavra-passe não pode ser vazia" });
    }

    // Validar formato do email, se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(422).json({ message: "Formato de email inválido" });
      }

      // Verificar se o email já está em uso por outro participante
      const existingEmail = await Participants.findOne({
        where: { email, id: { [Sequelize.Op.ne]: id } },
      });
      if (existingEmail) {
        return res.status(409).json({ message: "Email já está em uso" });
      }
    }

    // Verificar unicidade do username, se fornecido
    if (username) {
      const existingUsername = await Participants.findOne({
        where: { username, id: { [Sequelize.Op.ne]: id } },
      });
      if (existingUsername) {
        return res.status(409).json({ message: "Username já está em uso" });
      }
    }

    // Validar a palavra-passe, se fornecida
    if (password) {
      // Verificar comprimento mínimo
      if (password.length < 6) {
        return res.status(422).json({
          message: "A palavra-passe deve ter pelo menos 6 caracteres",
        });
      }

      // Verificar maiúsculas, minúsculas, números e caracteres especiais
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
      if (!passwordRegex.test(password)) {
        return res.status(422).json({
          message:
            "A palavra-passe deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
        });
      }
    }

    // Criar objeto com os campos a serem atualizados
    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Atualizar participante
    const [updated] = await Participants.update(updateData, {
      where: { id },
    });

    if (updated) {
      // Buscar participante atualizado para retornar
      const updatedParticipant = await Participants.findByPk(id);
      return res.json({
        message: "Participante atualizado",
        participant: {
          id: updatedParticipant.id,
          name: updatedParticipant.name,
          username: updatedParticipant.username,
          email: updatedParticipant.email,
        },
      });
    }

    return res.status(404).json({ message: "Participante não encontrado" });
  } catch (error) {
    console.error("Erro ao atualizar participante:", error.stack);
    return res.status(500).json({
      message: "Erro ao atualizar participante",
      error: error.message,
    });
  }
};

// Eliminar um participante
exports.deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o participante existe
    const participant = await Participants.findByPk(id);
    if (!participant) {
      return res.status(404).json({ message: "Participante não encontrado" });
    }

    // Deletar participante
    await Participants.destroy({
      where: { id },
    });

    return res.json({ message: "Participante eliminado" });
  } catch (error) {
    console.error("Erro ao eliminar participante:", error.stack);
    return res
      .status(500)
      .json({ message: "Erro ao eliminar participante", error: error.message });
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
    console.error("Erro ao buscar respostas do participante:", error.stack);
    res
      .status(500)
      .json({ message: "Erro ao buscar respostas", error: error.message });
  }
};

// Adicionar ou atualizar respostas do questionário inicial
exports.addParticipantAnswers = async (req, res) => {
  try {
    const participant = await Participants.findByPk(req.params.id);

    if (!participant) {
      return res.status(404).json({ message: "Participante não encontrado" });
    }

    const { answers } = req.body; // Espera um array no corpo da requisição
    if (!answers) {
      return res.status(422).json({ message: "As respostas são obrigatórias" });
    }

    // Verifica se answers é um array, não contém strings vazias e tem exatamente 4 respostas
    if (
      !Array.isArray(answers) ||
      answers.some((answer) => answer === "") ||
      answers.length !== 4
    ) {
      return res.status(422).json({
        message: "Cada uma das 4 questões deverá ter uma resposta associada",
      });
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
    console.error("Erro ao adicionar respostas do participante:", error.stack);
    res
      .status(500)
      .json({ message: "Erro ao adicionar respostas", error: error.message });
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
      return res.status(422).json({
        error: "O desafio deverá ter um título, descrição e nível associados.",
      });
    }

    // Validar o nível
    if (!Number.isInteger(level) || level < 1 || level > 3) {
      return res.status(422).json({
        error: "O nível do desafio deve ser um número inteiro entre 1 e 3.",
      });
    }

    // Verificar se o título do desafio já existe
    const existingChallenge = await Challenges.findOne({
      where: { title: title.toLowerCase() },
    });
    if (existingChallenge) {
      return res.status(409).json({
        error: "Já existe um desafio com esse título",
      });
    }

    // Criar novo desafio e garantir que retorna um ID
    const newChallenge = await Challenges.create({
      title: title.toLowerCase(),
      description,
      challenge_types_id_challenge_types: 1,
    });

    if (!newChallenge || !newChallenge.id) {
      return res.status(500).json({ error: "Falha ao criar o desafio." });
    }

    // Associar ao participante garantindo valores padrão
    await ParticipantsHasChallenges.create({
      participants_id: id,
      challenges_id: newChallenge.id,
      starting_date: new Date(),
      end_date: new Date(new Date().setHours(24, 59, 59)), // Termina às 23h59 do mesmo dia
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
