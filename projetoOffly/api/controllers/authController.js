require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Participants = require("../models/participants");

// Array em memória para armazenar refresh tokens
let refreshTokens = [];

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ error: "Email and password are required" });
    }

    // Buscar o participante no banco de dados
    const participant = await Participants.findOne({ where: { email } });
    if (!participant) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Comparar a senha com o hash armazenado
    const isMatch = await bcrypt.compare(password, participant.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Gerar payload para o JWT
    const payload = { id: participant.id, email: participant.email };

    // Gerar access token
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    // Gerar refresh token
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    // Armazenar o refresh token em memória
    refreshTokens.push(refreshToken); // Idealmente, use Redis ou outro cache para melhor escalabilidade

    res.status(200).json({
      token,
      refreshToken,
      expiresIn: 3600, // 1h
      user: {
        id: String(participant.id),
        email: participant.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.stack);
    res.status(500).json({ error: "Failed to login due to a server error" });
  }
};

exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  // Verificar se o refresh token está presente na lista
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    // Verificar a validade do refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Gerar um novo access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Responder com o novo access token
    res.json({ token: newAccessToken, expiresIn: 3600 });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Função para limpar refresh tokens expirados (idealmente deve ser feita periodicamente)
const clearExpiredTokens = () => {
  const currentTime = Date.now();
  refreshTokens = refreshTokens.filter(token => {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      return decoded.exp * 1000 > currentTime; // Filtra tokens expirados
    } catch (err) {
      return false; // Se não for válido, o token será removido
    }
  });
};

// A cada intervalo de tempo, podemos limpar tokens expirados
setInterval(clearExpiredTokens, 1000 * 60 * 60); // Limpa a cada hora
