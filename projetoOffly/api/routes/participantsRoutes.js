const express = require("express");
const router = express.Router();
const participantsController = require("../controllers/participantsController");
const authenticateToken = require("../middlewares/auth");
const authorizeSelf = require("../middlewares/authorize");

//Manusear participantes -> adicionar, atualizar, eliminar, filtrar
router.get("/", participantsController.getAllParticipants);
router.get("/:id", participantsController.getParticipantById);
router.post("/", participantsController.createParticipant);
router.put("/:id", participantsController.updateParticipant);
router.delete("/:id", participantsController.deleteParticipant);

// Listar respostas de um participante ao questionário inicial
router.get(
  "/:id/answers",
  authenticateToken,
  authorizeSelf,
  participantsController.getParticipantAnswers
);

// Adicionar ou atualizar respostas do questionário inicial
router.post(
  "/:id/answers",
  authenticateToken,
  authorizeSelf,
  participantsController.addParticipantAnswers
);

// Verificar desafio diário ativo
router.get("/:id/daily-challenge", participantsController.getDailyChallenge);
// Criar novo desafio diário
router.post(
  "/:id/daily-challenge",
  participantsController.createDailyChallenge
);
// Concluir desafio diário
router.put(
  "/:id/daily-challenge/complete",
  participantsController.completeDailyChallenge
);

module.exports = router;
