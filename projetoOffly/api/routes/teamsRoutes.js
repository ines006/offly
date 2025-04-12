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
 *     summary: Listar equipes com filtro opcional e paginação
 *     description: Retorna uma lista de equipes com o número de participantes, ordenadas por número de participantes em ordem decrescente. Suporta filtro para equipes com menos de 5 participantes e paginação com no máximo 4 equipes por página.
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: string
 *           enum: [under-5]
 *         description: Filtrar equipes com menos de 5 participantes (opcional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página para paginação (máximo 4 equipes por página)
 *     responses:
 *       200:
 *         description: Lista de equipes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Fortes
 *                       capacity:
 *                         type: integer
 *                         example: 5
 *                       participant_count:
 *                         type: integer
 *                         example: 4
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     totalTeams:
 *                       type: integer
 *                       example: 10
 *                     limit:
 *                       type: integer
 *                       example: 4
 *       400:
 *         description: Parâmetro de paginação inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: O parâmetro page deve ser um número inteiro maior que 0
 *       404:
 *         description: Nenhuma equipe encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               examples:
 *                 noTeams:
 *                   value:
 *                     message: Nenhuma equipa encontrada com menos de 5 participantes
 *                 invalidPage:
 *                   value:
 *                     message: Nenhuma equipa encontrada para esta página
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao listar equipas
 *                 error:
 *                   type: string
 */
router.get("/", teamsController.getTeams);

/**
 * @swagger
 * /teams/search:
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
 *                 example: Blue Team
 *               description:
 *                 type: string
 *                 example: Something to describe the team
 *               capacity:
 *                 type: integer
 *                 example: Between 3 and 5 (participants)
 *               visibility:
 *                 type: integer
 *                 example: 0 (Public Team) or 1 (Private Team)
 *               competitions_id:
 *                 type: integer
 *                 example: 1 (Competition ID)
 *               team_passbooks_id:
 *                 type: integer
 *                 example: 1 (Passbook ID)
 *               team_admin:
 *                 type: integer
 *                 example: 1 (Admin ID)
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
router.get(
  "/:id/weekly-challenges",
  teamsController.getTeamParticipantsStreaks
);

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

module.exports = router;
