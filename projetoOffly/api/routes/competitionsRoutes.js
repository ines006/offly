const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

// Rota para listar equipas de uma competição, com opção de ordenar por ranking
router.get("/:id/teams", teamsController.getCompetitionRanking);

module.exports = router;
