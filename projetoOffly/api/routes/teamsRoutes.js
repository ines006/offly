const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

router.get("/:id/teaminfo", teamsController.getTeamParticipants);
router.post("/", teamsController.createTeam);

module.exports = router;
