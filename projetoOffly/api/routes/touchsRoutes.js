const express = require("express");
const router = express.Router();
const touchController = require("../controllers/touchController");

router.post("/touchs", touchController.createTouch);
router.get("/receiver/:id", touchController.getTouchsByReceiver);
router.put("/touchs/:id/desativar", touchController.deactivateTouch);

module.exports = router;

