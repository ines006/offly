const express = require("express");
const router = express.Router();
const controller = require("../controllers/teamPassbooksController");

router.post("/", controller.createTeamPassbook);

module.exports = router;
