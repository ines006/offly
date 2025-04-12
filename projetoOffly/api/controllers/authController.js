// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Participants = require("../models/participants");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email e palavra-passe são obrigatórios" });
    }

    // Buscar o participante pelo email
    const participant = await Participants.findOne({ where: { email } });
    if (!participant) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Verificar a palavra-passe com bcrypt
    const isMatch = await bcrypt.compare(password, participant.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: participant.id, email: participant.email },
      "4DSFSDJIRTIOEHTOIDS_sDSDFSDFS", //eventualmente colocar no .env para ser mais seguro
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Erro ao fazer login:", error.stack);
    res
      .status(500)
      .json({ message: "Erro ao fazer login", error: error.message });
  }
};
