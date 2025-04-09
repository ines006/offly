const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

// Listar equipas com filtro opcional de lotação < 5
router.get("/", teamsController.getTeams);

// Pesquisar equipas por nome
router.get("/search", teamsController.searchTeamsByName);

// Listar informações de uma equipa
router.get("/:id", teamsController.getTeamParticipants);

// Criar uma nova equipa
router.post("/", teamsController.createTeam);

// Listar desafios diários de uma equipa
router.get("/:id/daily-challenges", teamsController.getTeamChallenges);

// Listar streaks dos participantes de uma equipa em desafios semanais
router.get(
  "/:id/weekly-challenges",
  teamsController.getTeamParticipantsStreaks
);

// Rota para listar equipas de uma competição, com opção de ordenar por ranking
router.get("/competition/:id", teamsController.getTeamsByCompetition);

module.exports = router;
