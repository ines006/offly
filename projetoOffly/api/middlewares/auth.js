const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Espera "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token validado com sucesso:", decoded); // <-- Adiciona isto
    req.user = decoded; // Adiciona os dados do participante ao request (id, email)
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
};

module.exports = authenticateToken;
