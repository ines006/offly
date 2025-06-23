const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/shakeSemanalController");

// Rota para gerar e atribuir desafio semanal
router.post("/discoverWeeklyChallenge", challengeController.discoverWeeklyChallenge);

module.exports = router;