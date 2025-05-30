const express = require("express");
const router = express.Router();
const controller = require("../controllers/passbookController");

// Obter desafios de um participante
router.get("/", controller.getPassbookData);

module.exports = router;