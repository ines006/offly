const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); 


const validateChallenge = require("../controllers/proveChallengeController");

router.post("/validate-challenge", upload.single("image"), validateChallenge.validateChallengeUpload);


module.exports = router;
