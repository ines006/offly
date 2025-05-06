require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Participants = require("../models/participants");
const rateLimit = require("express-rate-limit");

// Array em memória para armazenar refresh tokens (idealmente usar Redis para produção)
let refreshTokens = [];

// Configuração do rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 5 tentativas
  keyGenerator: (req) => req.body.email || "unknown", // Usar o email como chave
  handler: (req, res) => {
    const remainingTime =
      Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000 / 60) || 15;
    res.status(429).json({
      error: `Too many failed login attempts. Please try again in ${remainingTime} minutes`,
    });
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ error: "Email and password are required" });
    }

    // Verificar limite de tentativas
    const rateLimitInfo = await new Promise((resolve) => {
      loginLimiter(req, res, () => resolve(req.rateLimit));
    });

    if (rateLimitInfo && rateLimitInfo.remaining === 0 && !res.headersSent) {
      const remainingTime =
        Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000 / 60) || 15;
      return res.status(429).json({
        error: `Too many failed login attempts. Please try again in ${remainingTime} minutes`,
      });
    }

    // Procurar o participante pelo email
    const participant = await Participants.findOne({ where: { email } });
    if (!participant) {
      await new Promise((resolve) => loginLimiter(req, res, resolve));
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, participant.password_hash);
    if (!isMatch) {
      await new Promise((resolve) => loginLimiter(req, res, resolve));
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Login bem-sucedido: resetar rate limiter
    req.rateLimit = { reset: true };

    // Payload do JWT
    const payload = { id: participant.id, email: participant.email };

    // Gerar access token
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    // Gerar refresh token
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Armazenar refresh token em memória
    refreshTokens.push(refreshToken);

    // Responder
    res.status(200).json({
      token,
      refreshToken,
      expiresIn: 3600,
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

// Middleware para resetar rate limiter após login bem-sucedido
exports.applyLoginLimiter = (req, res, next) => {
  if (req.rateLimit && req.rateLimit.reset) {
    loginLimiter.resetKey(req.body.email || "unknown");
  }
  next();
};

// Rota de refresh token
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  // Verificar se o refresh token está armazenado
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    // Validar refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Gerar novo access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: newAccessToken, expiresIn: 3600 });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

// Limpeza de refresh tokens expirados
const clearExpiredTokens = () => {
  const currentTime = Date.now();
  refreshTokens = refreshTokens.filter((token) => {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      return decoded.exp * 1000 > currentTime;
    } catch (err) {
      return false;
    }
  });
};

// Limpar tokens expirados a cada hora
setInterval(clearExpiredTokens, 1000 * 60 * 60);

// Endpoint para logout
exports.logout = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token missing" });
  }

  // Verificar se o refresh token existe e removê-lo
  const tokenIndex = refreshTokens.indexOf(refreshToken);
  if (tokenIndex === -1) {
    return res.status(400).json({ message: "Invalid refresh token" });
  }

  // Remover o refresh token do array
  refreshTokens.splice(tokenIndex, 1);

  console.log("🔓 Refresh token removido com sucesso");

  res.status(200).json({ message: "Logout successful" });
};
