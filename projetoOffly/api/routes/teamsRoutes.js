const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

router.get("/:id/teaminfo", teamsController.getTeamParticipants);
router.post("/", teamsController.createTeam);
router.get("/:id/daily-challenges", teamsController.getTeamChallenges);
router.get(
  "/:id/participants-streaks",
  teamsController.getTeamParticipantsStreaks
);

module.exports = router;
