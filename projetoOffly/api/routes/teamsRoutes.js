const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Endpoints relacionados às equipas e os seus desafios
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Listar equipas (com filtro opcional de lotação < 5)
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Lista de equipas retornada com sucesso
 */
router.get("/", teamsController.getTeams);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Listar participantes de uma equipa
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipa
 *     responses:
 *       200:
 *         description: Lista de participantes da equipa
 */
router.get("/:id", teamsController.getTeamParticipants);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Criar nova equipa
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Equipa Azul
 *               maxSize:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Equipa criada com sucesso
 */
router.post("/", teamsController.createTeam);

/**
 * @swagger
 * /teams/{id}/daily-challenges:
 *   get:
 *     summary: Listar desafios diários da equipa
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipa
 *     responses:
 *       200:
 *         description: Lista de desafios diários
 */
router.get("/:id/daily-challenges", teamsController.getTeamChallenges);

/**
 * @swagger
 * /teams/{id}/weekly-challenges:
 *   get:
 *     summary: Listar streaks dos participantes em desafios semanais
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipa
 *     responses:
 *       200:
 *         description: Lista de streaks
 */
router.get("/:id/weekly-challenges", teamsController.getTeamParticipantsStreaks);

/**
 * @swagger
 * /teams/competition/{id}:
 *   get:
 *     summary: Listar equipas de uma competição (ordenadas por ranking, se aplicável)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da competição
 *     responses:
 *       200:
 *         description: Lista de equipas da competição
 */
router.get("/competition/:id", teamsController.getTeamsByCompetition);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Pesquisa equipas pelo nome
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         description: Nome da equipa para pesquisa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de equipas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   country:
 *                     type: string
 *       400:
 *         description: Parâmetro inválido
 */
router.get("/search", teamsController.searchTeamsByName);

module.exports = router;
