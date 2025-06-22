const express = require("express");
const router = express.Router();
const controller = require("../controllers/passbookController");

// Obter desafios de um participante
router.get("/", controller.getPassbookData);

router.get("/week", controller.getValidatedChallengeImages);



module.exports = router;