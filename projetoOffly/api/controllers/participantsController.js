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
    res
      .status(500)
      .json({ message: "Error when searching for participants", error });
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
      : res.status(404).json({ message: "Participant not found" });
  } catch (error) {
    res.status(500).json({ message: "Failure to obtain participant", error });
  }
};

// Criar um novo participante
exports.createParticipant = async (req, res) => {
  try {

    const { name, username, email, password, gender, level = 1, image } = req.body;

    if (!name || !username || !email || !password || gender === undefined) {
      return res.status(422).json({ message: "All fields are required" });
    }

    // Validar URL da imagem
    if (image && typeof image !== "string") {
      return res.status(422).json({ message: "Image must be a string" });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({ message: "Invalid email format" });
    }

    // Validar comprimento mínimo da palavra-passe
    if (password.length < 8) {
      return res
        .status(422)
        .json({ message: "The password must be at least 8 characters long" });
    }

    // Validar que a palavra-passe contém maiúsculas, minúsculas e caracteres especiais
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "The password must contain at least one uppercase letter, one lowercase letter, a number and a special character",
      });
    }

    // Validar valores permitidos para gender
    if (gender !== 0 && gender !== 1) {
      return res.status(422).json({
        message: "The gender field must be 0 (male) or 1 (female)",
      });
    }

    // Verificar se o username já existe
    const existingUsername = await Participants.findOne({
      where: { username },
    });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already in use" });
    }

    // Verificar se o email já existe
    const existingEmail = await Participants.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
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
      image,
    });

    res.status(201).json({ id: participant.id, email: participant.email });
  } catch (error) {
    console.error("Error creating participant:", error.stack);
    res
      .status(500)
      .json({ message: "Error creating participant", error: error.message });
  }
};

// Atualizar os dados de um participante
exports.updateParticipant = async (req, res) => {
  try {
    const { name, username, email, password, upload } = req.body;
    const { id } = req.params;

    // Verificar se o utilizador está autenticado
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Verificar se o utilizador autenticado é o mesmo que está sendo atualizado
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({
        message: "You are not authorized to update this participant's data",
      });
    }

    // Verificar se o participante existe
    const participant = await Participants.findByPk(id);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Verificar se pelo menos um campo foi fornecido
    if (!name && !username && !email && !password && upload === undefined) {
      return res.status(422).json({
        message: "At least one field must be provided for update",
      });
    }

    // Validar que campos fornecidos não sejam vazios
    if (name === "") {
      return res.status(422).json({ message: "Name cannot be empty" });
    }
    if (username === "") {
      return res.status(422).json({ message: "Username cannot be empty" });
    }
    if (email === "") {
      return res.status(422).json({ message: "Email cannot be empty" });
    }
    if (password === "") {
      return res.status(422).json({ message: "Password cannot be empty" });
    }
    if (upload === "") {
      return res.status(422).json({ message: "Upload cannot be empty" });
    }

    // Validar formato do email, se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(422).json({ message: "Invalid email format" });
      }

      // Verificar se o email já está em uso por outro participante
      const existingEmail = await Participants.findOne({
        where: { email, id: { [Sequelize.Op.ne]: id } },
      });
      if (existingEmail) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    // Verificar unicidade do username, se fornecido
    if (username) {
      const existingUsername = await Participants.findOne({
        where: { username, id: { [Sequelize.Op.ne]: id } },
      });
      if (existingUsername) {
        return res.status(409).json({ message: "Username already in use" });
      }
    }

    // Validar a palavra-passe, se fornecida
    if (password) {
      // Verificar comprimento mínimo
      if (password.length < 6) {
        return res.status(422).json({
          message: "The password must be at least 6 characters long",
        });
      }

      // Verificar maiúsculas, minúsculas, números e caracteres especiais
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
      if (!passwordRegex.test(password)) {
        return res.status(422).json({
          message:
            "The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        });
      }
    }

    // Validar upload, se é um número válido -> 0 ou 1
    if (upload !== undefined) {
      const parsedUpload = Number(upload);

      if (isNaN(parsedUpload) || (parsedUpload !== 0 && parsedUpload !== 1)) {
        return res.status(422).json({
          message: "The 'upload' field must be a valid number: 0 or 1",
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
    if (upload !== undefined) updateData.upload = Number(upload);



    // Atualizar participante
    const [updated] = await Participants.update(updateData, {
      where: { id },
    });

    if (updated) {
      // Buscar participante atualizado para retornar
      const updatedParticipant = await Participants.findByPk(id);
      return res.json({
        message: "Participant updated successfully",
        participant: {
          id: updatedParticipant.id,
          name: updatedParticipant.name,
          username: updatedParticipant.username,
          email: updatedParticipant.email,
          upload: updatedParticipant.upload,
        },
      });
    }

    return res.status(404).json({ message: "Participant not found" });
  } catch (error) {
    console.error("Error updating participant:", error.stack);
    return res.status(500).json({
      message: "Error updating participant",
      error: error.message,
    });
  }
};

// Eliminar um participante
exports.deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o utilizador está autenticado
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Verificar se o utilizador autenticado é o mesmo que está sendo atualizado
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({
        message: "You are not authorized to update this participant's data",
      });
    }
    // Verificar se o participante existe
    const participant = await Participants.findByPk(id);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Eliminar participante
    await Participants.destroy({
      where: { id },
    });

    return res.json({ message: "Participant deleted successfully" });
  } catch (error) {
    console.error("Error deleting participant:", error.stack);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
      return res.status(404).json({ message: "Participant not found" });
    }

    res.json({
      id: participant.id,
      answers: participant.answer ? participant.answer.answers : null,
    });
  } catch (error) {
    console.error("Error fetching answers:", error.stack);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Adicionar ou atualizar respostas do questionário inicial
exports.addParticipantAnswers = async (req, res) => {
  try {
    const participant = await Participants.findByPk(req.params.id);

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const { answers } = req.body; // Espera um array no corpo da requisição
    if (!answers) {
      return res.status(422).json({ message: "Answers are required" });
    }

    // Verifica se answers é um array, não contém strings vazias e tem exatamente 4 respostas
    if (
      !Array.isArray(answers) ||
      answers.some((answer) => answer === "") ||
      answers.length !== 4
    ) {
      return res.status(422).json({
        message: "Each of the 4 questions must have an associated answer",
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
    console.error("Error adding answers:", error.stack);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// GET → Verificar se o participante tem desafio ativo hoje
exports.getDailyChallenge = async (req, res) => {
  try {
    const { id } = req.params; // ID do participante

    // Verificar se o utilizador está autenticado
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Verificar se o utilizador autenticado é o mesmo que está sendo atualizado
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({
        message: "You are not authorized to update this participant's data",
      });
    }

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
        message: "No active challenges found.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Error fetching daily challenge",
      details: error.message,
    });
  }
};

// POST → Criar/Escolher um novo desafio e associá-lo ao participante
exports.createDailyChallenge = async (req, res) => {
  try {
    const { id } = req.params; // ID do participante
    const { title, description, level } = req.body;

    // Verificar se o utilizador está autenticado
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Verificar se o utilizador autenticado é o mesmo que está sendo atualizado
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({
        message: "You are not authorized to update this participant's data",
      });
    }

    if (!title || !description || !level) {
      return res.status(422).json({
        error:
          "The challenge must have a title, description, and level associated.",
      });
    }

    // Validar o nível
    if (!Number.isInteger(level) || level < 1 || level > 3) {
      return res.status(422).json({
        error: "The challenge level must be an integer between 1 and 3.",
      });
    }

    // Verificar se o título do desafio já existe
    const existingChallenge = await Challenges.findOne({
      where: { title: title.toLowerCase() },
    });
    if (existingChallenge) {
      return res.status(409).json({
        error: "A challenge with this title already exists",
      });
    }

    // Criar novo desafio e garantir que retorna um ID
    const newChallenge = await Challenges.create({
      title: title.toLowerCase(),
      description,
      challenge_types_id_challenge_types: 1,
    });

    if (!newChallenge || !newChallenge.id) {
      return res.status(500).json({ error: "Failed to create the challenge." });
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
      message: "Challenge created and associated with the participant!",
      challenge: newChallenge,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error creating challenge", details: error.message });
  }
};

// PUT → Marcar desafio como concluído
exports.completeDailyChallenge = async (req, res) => {
  try {
    const { id } = req.params; // ID do participante
    const { challengeId, userImg } = req.body;

    // Verificar se o utilizador está autenticado
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Verificar se o utilizador autenticado é o mesmo que está sendo atualizado
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({
        message: "You are not authorized to update this participant's data",
      });
    }

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
      return res.json({ message: "Challenge completed successfully!" });
    } else {
      return res.status(404).json({ message: "No challenge found to update" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error completing challenge", details: error.message });
  }
};

module.exports = exports;
