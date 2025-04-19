const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Participants = require("../models/participants");
const rateLimit = require("express-rate-limit");

// Configuração do rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de 3 tentativas falhas
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

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar campos obrigatórios
    if (!email || !password) {
      return res.status(422).json({ error: "Email and password are required" });
    }

    // Verificar limite de tentativas antes de processar
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
      // Incrementar tentativa falha
      await new Promise((resolve) => loginLimiter(req, res, resolve));
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verificar a palavra-passe com bcrypt
    const isMatch = await bcrypt.compare(password, participant.password_hash);
    if (!isMatch) {
      // Incrementar tentativa falha
      await new Promise((resolve) => loginLimiter(req, res, resolve));
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Login bem-sucedido: marcar para resetar o contador
    req.rateLimit = { reset: true };

    // Gerar token JWT
    const token = jwt.sign(
      { id: participant.id, email: participant.email },
      process.env.JWT_SECRET || "4DSFSDJIRTIOEHTOIDS_sDSDFSDFS",
      { expiresIn: "1h" }
    );

    // Resposta com token, expiresIn e user
    res.status(200).json({
      token,
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

// Middleware para aplicar o rate limiter
exports.applyLoginLimiter = (req, res, next) => {
  if (req.rateLimit && req.rateLimit.reset) {
    // Resetar o contador quando o login é bem-sucedido
    loginLimiter.resetKey(req.body.email || "unknown");
  }
  next();
};
