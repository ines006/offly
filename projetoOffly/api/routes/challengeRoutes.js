const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challengeController");

/**
 * @swagger
 * tags:
 *   name: Challenges
 *   description: Endpoints related to user challenges
 */

/**
 * @swagger
 * /api/desafios:
 *   get:
 *     summary: Get random unvalidated challenges for a user
 *     description: Returns up to 3 random challenges that the specified user has not yet validated.
 *     tags: [Challenges]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve challenges for
 *     responses:
 *       200:
 *         description: A list of up to 3 challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Beber 2L de água"
 *                   description:
 *                     type: string
 *                     example: "Tenta beber pelo menos 2 litros de água hoje"
 *                   img:
 *                     type: string
 *                     example: "https://example.com/images/water.jpg"
 *       400:
 *         description: Missing userId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing userId parameter
 *       500:
 *         description: Internal server error
 */
router.get("/desafios", challengeController.getRandomChallenges);

module.exports = router;
