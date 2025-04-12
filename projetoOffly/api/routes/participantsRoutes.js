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
 *                 example: name / surname
 *               username:
 *                 type: string
 *                 example: username
 *               email:
 *                 type: string
 *                 example: example@email.com
 *               password:
 *                 type: string
 *               gender:
 *                 type: integer
 *                 example: 0 (male) or 1 (female)
 *     responses:
 *       201:
 *         description: Participante criado
 */
router.post("/", participantsController.createParticipant);

/**
 * @swagger
 * /participants/{id}:
 *   put:
 *     summary: Atualizar os dados de um participante
 *     description: Atualiza os campos fornecidos (nome, username, email e/ou palavra-passe) de um participante. Pelo menos um campo deve ser fornecido, e nenhum campo pode ser vazio.
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do participante a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do participante (não pode ser vazio)
 *                 example: João Novo
 *               username:
 *                 type: string
 *                 description: Username único do participante (não pode ser vazio ou duplicado)
 *                 example: joaonovo
 *               email:
 *                 type: string
 *                 description: Email do participante (deve ser um email válido e não duplicado)
 *                 example: joao.novo@example.com
 *               password:
 *                 type: string
 *                 description: palavra-passe do participante (mínimo 6 caracteres, com pelo menos uma maiúscula, uma minúscula, um número e um caractere especial)
 *                 example: Teste123!
 *             minProperties: 1
 *           examples:
 *             updatePassword:
 *               summary: Atualizar apenas a palavra-passe
 *               value:
 *                 password: Teste123!
 *             updateMultiple:
 *               summary: Atualizar múltiplos campos
 *               value:
 *                 name: João Novo
 *                 username: joaonovo
 *                 email: joao.novo@example.com
 *     responses:
 *       200:
 *         description: Participante atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Participante atualizado
 *                 participant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: João Novo
 *                     username:
 *                       type: string
 *                       example: joaonovo
 *                     email:
 *                       type: string
 *                       example: joao.novo@example.com
 *       400:
 *         description: Erro de validação (campos inválidos, vazios, duplicados, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               examples:
 *                 missingFields:
 *                   value:
 *                     message: Pelo menos um campo deve ser fornecido para atualização
 *                 invalidEmail:
 *                   value:
 *                     message: Formato de email inválido
 *                 duplicateUsername:
 *                   value:
 *                     message: Username já está em uso
 *                 invalidPassword:
 *                   value:
 *                     message: A palavra-passe deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.
 *       404:
 *         description: Participante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Participante não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao atualizar participante
 *                 error:
 *                   type: string
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
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["answer1", "answer2", "answer3", "answer4"]
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
 *         description: ID do participante
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
 *                 description: Título do desafio diário
 *               description:
 *                 type: string
 *                 description: Descrição do desafio diário
 *               level:
 *                 type: integer
 *                 description: Nível do desafio diário
 *             example:
 *               title: "Challenge example"
 *               description: "Challenge description"
 *               level: "Between 1 and 3"
 *     responses:
 *       201:
 *         description: Desafio diário criado
 *
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
