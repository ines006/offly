const authorizeSelf = (req, res, next) => {
  const participantId = parseInt(req.params.id, 10); // ID do participante na URL
  const user = req.user; // Dados do participante autenticado (do token)

  // Verifica se o participante autenticado é o mesmo da URL
  if (user.id === participantId) {
    next();
  } else {
    return res.status(403).json({ message: "Acesso não autorizado" });
  }
};

module.exports = authorizeSelf;
