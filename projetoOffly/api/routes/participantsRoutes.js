/**
 * @swagger
 * tags:
 *   name: Participants
 *   description: Endpoints para gerir participantes e interações com desafios e respostas
 */

const express = require("express");
const router = express.Router();
const participantsController = require("../controllers/participantsController");
const authenticateToken = require("../middlewares/auth");
const authorizeSelf = require("../middlewares/authorize");

/**
 * @swagger
 * /participants:
 *   get:
 *     summary: Listar todos os participantes
 *     tags: [Participants]
 *     responses:
 *       200:
 *         description: Lista de participantes
 */
router.get("/", participantsController.getAllParticipants);

/**
 * @swagger
 * /participants/{id}:
 *   get:
 *     summary: Buscar participante por ID
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do participante
 *     responses:
 *       200:
 *         description: Participante encontrado
 *       404:
 *         description: Participante não encontrado
 */
router.get("/:id", participantsController.getParticipantById);

/**
 * @swagger
 * /participants:
 *   post:
 *     summary: Criar novo participante
 *     tags: [Participants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Participante criado
 */
router.post("/", participantsController.createParticipant);

/**
 * @swagger
 * /participants/{id}:
 *   put:
 *     summary: Atualizar participante
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participante atualizado
 */
router.put("/:id", participantsController.updateParticipant);

/**
 * @swagger
 * /participants/{id}:
 *   delete:
 *     summary: Remover participante
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participante removido
 */
router.delete("/:id", participantsController.deleteParticipant);

/**
 * @swagger
 * /participants/{id}/answers:
 *   get:
 *     summary: Listar respostas do questionário inicial de um participante
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Respostas listadas
 */
router.get(
  "/:id/answers",
  authenticateToken,
  authorizeSelf,
  participantsController.getParticipantAnswers
);

/**
 * @swagger
 * /participants/{id}/answers:
 *   post:
 *     summary: Adicionar ou atualizar respostas do questionário inicial
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 questionId:
 *                   type: integer
 *                 answer:
 *                   type: string
 *     responses:
 *       200:
 *         description: Respostas salvas
 */
router.post(
  "/:id/answers",
  authenticateToken,
  authorizeSelf,
  participantsController.addParticipantAnswers
);

/**
 * @swagger
 * /participants/{id}/daily-challenge:
 *   get:
 *     summary: Verificar desafio diário ativo
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Desafio diário retornado
 */
router.get("/:id/daily-challenge", participantsController.getDailyChallenge);

/**
 * @swagger
 * /participants/{id}/daily-challenge:
 *   post:
 *     summary: Criar novo desafio diário
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Desafio diário criado
 */
router.post(
  "/:id/daily-challenge",
  participantsController.createDailyChallenge
);

/**
 * @swagger
 * /participants/{id}/daily-challenge/complete:
 *   put:
 *     summary: Concluir desafio diário
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Desafio concluído
 */
router.put(
  "/:id/daily-challenge/complete",
  participantsController.completeDailyChallenge
);

module.exports = router;
