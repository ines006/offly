const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middlewares/auth");
const multer = require("multer");

// Configuração do multer para armazenamento em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Rota para análise de upload
/**
 * @swagger
 * /uploads/analyze:
 *   post:
 *     summary: Analyses daily screen time and awards points
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - image
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the participant submitting the image
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Screen time image
 *     responses:
 *       200:
 *         description: Image analysed, score and variation recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 points:
 *                   type: integer
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Not authorised
 *       500:
 *         description: Server error
 */
router.post(
  "/analyze",
  authMiddleware,
  upload.single("image"),
  uploadController.analyzeUpload
);

module.exports = router;
