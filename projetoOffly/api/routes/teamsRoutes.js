const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

// Listar equipas com filtro opcional de lotação < 5
router.get("/", teamsController.getTeams);
router.get("/:id", teamsController.getTeamParticipants);
router.post("/", teamsController.createTeam);
router.get("/:id/daily-challenges", teamsController.getTeamChallenges);
router.get(
  "/:id/participants-streaks",
  teamsController.getTeamParticipantsStreaks
);

module.exports = router;
