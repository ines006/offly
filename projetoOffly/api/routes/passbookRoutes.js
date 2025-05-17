const express = require("express");
const router = express.Router();
const controller = require("../controllers/passbookController");

// Obter participantes por id ou teams_id
router.get("/", controller.getParticipants);

// Obter desafios de um participante
router.get("/desafios_completos", controller.getParticipantsHasChallenges);

module.exports = router;