const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Participants = require("../models/participants");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos obrigatórios
    if (!email || !password) {
      return res.status(422).json({ error: "Email and password are required" });
    }

    // Procurar o participante pelo email
    const participant = await Participants.findOne({ where: { email } });
    if (!participant) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verificar a palavra-passe com bcrypt
    const isMatch = await bcrypt.compare(password, participant.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: participant.id, email: participant.email },
      "4DSFSDJIRTIOEHTOIDS_sDSDFSDFS", // Eventualmente precisamos de colocar no .env
      { expiresIn: "1h" }
    );

    // Resposta com token, expiresIn e user
    res.status(200).json({
      token,
      expiresIn: 3600,
      user: {
        id: String(participant.id), // Converter ID para string
        email: participant.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.stack);
    res.status(500).json({ error: "Failed to login due to a server error" });
  }
};
