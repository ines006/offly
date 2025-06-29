const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/shakeSemanalController");

// Rota para gerar e atribuir desafio semanal
router.post("/discover-weekly", (req, res, next) => {
  console.log("🛬 Rota /discover-weekly foi atingida");
  next();
}, challengeController.discoverWeeklyChallenge);

module.exports = router;