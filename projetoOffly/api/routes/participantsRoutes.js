/**
 * @swagger
 * tags:
 *   name: Participants
 *   description: Endpoints to manage participants and their interactions with challenges and answers
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
 *     summary: Get all participants
 *     tags: [Participants]
 *     responses:
 *       200:
 *         description: List of participants
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: João Silva
 *                 email: joao@example.com
 *                 username: joaosilva
 *       500:
 *         description: Failed to retrieve participants
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao obter participantes
 *               error: Erro interno no servidor
 */
router.get("/", participantsController.getAllParticipants);

/**
 * @swagger
 * /participants/{id}:
 *   get:
 *     summary: Get participant by ID
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participant found
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: João Silva
 *               email: joao@example.com
 *               username: joaosilva
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             example:
 *               message: Participante não encontrado
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao obter participante
 *               error: Erro interno no servidor
 */
router.get("/:id", participantsController.getParticipantById);

/**
 * @swagger
 * /participants:
 *   post:
 *     summary: Create a new participant
 *     tags: [Participants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *               - password
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               username:
 *                 type: string
 *                 example: joaosilva
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 example: Teste123!
 *               gender:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: Participant created
 *         content:
 *           application/json:
 *             example:
 *               message: Participante criado com sucesso
 *               participant:
 *                 id: 2
 *                 name: João Silva
 *                 username: joaosilva
 *                 email: joao@example.com
 *       400:
 *         description: Invalid or missing fields
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: Campos obrigatórios em falta
 *               invalidEmail:
 *                 value:
 *                   message: Formato de email inválido
 *               duplicateUsername:
 *                 value:
 *                   message: Nome de utilizador já está em uso
 *               weakPassword:
 *                 value:
 *                   message: A palavra-passe deve conter letras maiúsculas, minúsculas, número e caractere especial
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao criar participante
 *               error: Erro interno no servidor
 */
router.post("/", participantsController.createParticipant);

/**
 * @swagger
 * /participants/{id}:
 *   put:
 *     summary: Update participant details
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
 *           examples:
 *             updatePassword:
 *               summary: Atualizar apenas palavra-passe
 *               value:
 *                 password: NovaPass123!
 *             updateMultiple:
 *               summary: Atualizar múltiplos campos
 *               value:
 *                 name: João Atualizado
 *                 username: joaoatualizado
 *                 email: joao.atualizado@example.com
 *     responses:
 *       200:
 *         description: Participant updated
 *         content:
 *           application/json:
 *             example:
 *               message: Participante atualizado com sucesso
 *               participant:
 *                 id: 1
 *                 name: João Atualizado
 *                 username: joaoatualizado
 *                 email: joao.atualizado@example.com
 *       400:
 *         description: Invalid or missing fields
 *         content:
 *           application/json:
 *             examples:
 *               missingFields:
 *                 value:
 *                   message: Pelo menos um campo deve ser fornecido para atualização
 *               invalidEmail:
 *                 value:
 *                   message: Formato de email inválido
 *               duplicateUsername:
 *                 value:
 *                   message: Nome de utilizador já está em uso
 *               invalidPassword:
 *                 value:
 *                   message: A palavra-passe deve conter letras maiúsculas, minúsculas, número e caractere especial
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             example:
 *               message: Participante não encontrado
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao atualizar participante
 *               error: Erro interno no servidor
 */
router.put("/:id", participantsController.updateParticipant);

/**
 * @swagger
 * /participants/{id}:
 *   delete:
 *     summary: Delete a participant
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participant deleted
 *         content:
 *           application/json:
 *             example:
 *               message: Participante eliminado com sucesso
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             example:
 *               message: Participante não encontrado
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao eliminar participante
 *               error: Erro interno no servidor
 */
router.delete("/:id", participantsController.deleteParticipant);

/**
 * @swagger
 * /participants/{id}/answers:
 *   get:
 *     summary: Get participant's answers
 *     tags: [Participants]
 *     responses:
 *       200:
 *         description: Answers retrieved
 *         content:
 *           application/json:
 *             example:
 *               answers: ["resposta1", "resposta2"]
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             example:
 *               message: Participante não encontrado
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao obter respostas
 *               error: Erro interno no servidor
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
 *     summary: Submit/update participant's answers
 *     tags: [Participants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             answers: ["resposta1", "resposta2"]
 *     responses:
 *       200:
 *         description: Answers saved
 *         content:
 *           application/json:
 *             example:
 *               message: Respostas guardadas com sucesso
 *       400:
 *         description: Missing or invalid answers
 *         content:
 *           application/json:
 *             example:
 *               message: O campo 'answers' é obrigatório
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             example:
 *               message: Participante não encontrado
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao guardar respostas
 *               error: Erro interno no servidor
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
 *     summary: Check current daily challenge for participant
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Participant ID
 *     responses:
 *       200:
 *         description: Daily challenge retrieved
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               title: Desafio de hoje
 *               description: Caminhar 10 minutos
 *               level: 1
 *               completed: false
 *       404:
 *         description: Challenge or participant not found
 *         content:
 *           application/json:
 *             example:
 *               message: Desafio diário ou participante não encontrado
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao obter desafio diário
 *               error: Erro interno no servidor
 */
router.get("/:id/daily-challenge", participantsController.getDailyChallenge);

/**
 * @swagger
 * /participants/{id}/daily-challenge:
 *   post:
 *     summary: Create a new daily challenge for a participant
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Participant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - level
 *             properties:
 *               title:
 *                 type: string
 *                 example: Novo desafio
 *               description:
 *                 type: string
 *                 example: Meditar 5 minutos
 *               level:
 *                 type: integer
 *                 example: 2
 *                 description: Nível de dificuldade (1 a 3)
 *     responses:
 *       201:
 *         description: Daily challenge created
 *         content:
 *           application/json:
 *             example:
 *               message: Desafio diário criado com sucesso
 *               challenge:
 *                 id: 3
 *                 title: Novo desafio
 *                 description: Meditar 5 minutos
 *                 level: 2
 *       400:
 *         description: Missing or invalid fields
 *         content:
 *           application/json:
 *             example:
 *               message: Todos os campos (title, description e level) são obrigatórios
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             example:
 *               message: Participante não encontrado
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao criar desafio diário
 *               error: Erro interno no servidor
 */
router.post("/:id/daily-challenge", participantsController.createDailyChallenge);

/**
 * @swagger
 * /participants/{id}/daily-challenge/complete:
 *   put:
 *     summary: Mark the participant's daily challenge as completed
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Participant ID
 *     responses:
 *       200:
 *         description: Challenge marked as completed
 *         content:
 *           application/json:
 *             example:
 *               message: Desafio diário marcado como concluído
 *       404:
 *         description: Participant or challenge not found
 *         content:
 *           application/json:
 *             example:
 *               message: Participante ou desafio não encontrado
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao marcar desafio como concluído
 *               error: Erro interno no servidor
 */
router.put(
  "/:id/daily-challenge/complete",
  participantsController.completeDailyChallenge
);


module.exports = router;
