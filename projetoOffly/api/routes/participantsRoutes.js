const express = require("express");
const router = express.Router();
const participantsController = require("../controllers/participantsController");

//Listar equipas com < 5 participantes
router.get("/teams-under-5", participantsController.getTeamsUnderFive);

//Manusear participantes -> adicionar, atualizar, eliminar, filtrar
router.get("/", participantsController.getAllParticipants);
router.get("/:id", participantsController.getParticipantById);
router.post("/", participantsController.createParticipant);
router.put("/:id", participantsController.updateParticipant);
router.delete("/:id", participantsController.deleteParticipant);

module.exports = router;
