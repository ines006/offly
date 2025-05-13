const express = require("express");
const router = express.Router();
const participantsHasChallengesController = require("../controllers/participantsHasChallengesController");
const controller = require("../controllers/participantsHasChallengesController");

/**
 * @swagger
 * /api/participants-has-challenges:
 *   post:
 *     summary: Regista a carta escolhida por um participante
 *     tags: [ParticipantsHasChallenges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants_id:
 *                 type: integer
 *               challenges_id:
 *                 type: integer
 *               starting_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Seleção registada com sucesso
 *       400:
 *         description: Campos em falta
 *       500:
 *         description: Erro no servidor
 */

/**
 * @swagger
 * /api/participants-has-challenges/active/{participants_id}:
 *   get:
 *     summary: Obtém o desafio ativo de um participante
 *     tags: [ParticipantsHasChallenges]
 *     parameters:
 *       - in: path
 *         name: participants_id
 *         required: true
 *         description: ID do participante
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Desafio ativo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 starting_date:
 *                   type: string
 *                   format: date-time
 *                 challenge:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     titulo:
 *                       type: string
 *                     imagem:
 *                       type: string
 *                     carta:
 *                       type: string
 *       404:
 *         description: Nenhuma carta ativa encontrada
 *       500:
 *         description: Erro no servidor
 */

// Rota para criar uma seleção de desafio
router.post("/", participantsHasChallengesController.createChallengeSelection);

// Rota para obter o desafio ativo de um utilizador (baseado no ID do participante)
router.get("/active/:participants_id", participantsHasChallengesController.getActiveChallengeByUser);

router.put("/complete/:participants_id", controller.completeActiveChallenge);

router.get("/:participants_id/stickerbook", controller.getStickerBook);


module.exports = router;
