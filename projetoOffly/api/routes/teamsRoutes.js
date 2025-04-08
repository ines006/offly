const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

// Listar equipas com filtro opcional de lotação < 5
router.get("/", teamsController.getTeams);
router.get("/:id", teamsController.getTeamParticipants);
router.post("/", teamsController.createTeam);
router.get("/:id/daily-challenges", teamsController.getTeamChallenges);
// Listar streaks dos participantes de uma equipa em desafios semanais
router.get(
  "/:id/weekly-challenges",
  teamsController.getTeamParticipantsStreaks
);

// Rota para listar equipas de uma competição, com opção de ordenar por ranking
router.get("/competition/:id", teamsController.getTeamsByCompetition);

module.exports = router;
