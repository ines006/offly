const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); 

const validateChallenge = require("../controllers/proveChallengeController");

router.post("/validate-challenge", upload.single("image"), validateChallenge.validateChallengeUpload);

router.put("/complete/:participants_id", controller.completeActiveChallenge);

router.get("/completed-today/:participants_id", controller.getChallengeOfToday);

router.get("/active-with-image/:participants_id",controller.getActiveChallengeWithUserImage);


module.exports = router;
