const express = require("express");
const router = express.Router();
const participantsController = require("../controllers/participantsController");
const {createParticipantValidation} = require("../validators/participantValidator");
const { validationResult } = require("express-validator");


//Verificar erros de validação
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

//Listar equipas com < 5 participantes
router.get("/teams-under-5", participantsController.getTeamsUnderFive);

//Manusear participantes -> adicionar, atualizar, eliminar, filtrar
router.get("/", participantsController.getAllParticipants);
router.get("/:id", participantsController.getParticipantById);
router.post("/", createParticipantValidation, validate, participantsController.createParticipant);
router.put("/:id", createParticipantValidation, validate, participantsController.updateParticipant);
router.delete("/:id", participantsController.deleteParticipant);

// Listar respostas de um participante ao questionário inicial
router.get("/:id/answers", participantsController.getParticipantAnswers);

// Adicionar respostas ao questionário inicial
router.post("/:id/answers", participantsController.addParticipantAnswers);


// Verificar desafio diário ativo
router.get("/:id/daily-challenge", participantsController.getDailyChallenge);

// Criar novo desafio diário
router.post("/:id/daily-challenge", participantsController.createDailyChallenge);

// Concluir desafio diário
router.put("/:id/daily-challenge/complete", participantsController.completeDailyChallenge);


module.exports = router;
