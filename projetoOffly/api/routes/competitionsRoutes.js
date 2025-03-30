const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

router.get("/:id/ranking", teamsController.getCompetitionRanking);

module.exports = router;
