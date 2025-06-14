const express = require("express");
const router = express.Router();
const ShakeController = require("../controllers/shakeController");

// Gerar desafios (quando faz shake)
router.post("/generate-challenges", ShakeController.generateShakeChallenges);

// Guardar desafio escolhido
router.post("/save-challenge", ShakeController.saveSelectedChallenge);

module.exports = router;

