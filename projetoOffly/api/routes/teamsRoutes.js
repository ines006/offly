const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Endpoints related to teams and their challenges
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: List teams with optional filtering and pagination
 *     description: Returns a list of teams with their participant count, sorted by the number of participants in descending order. Supports filtering for teams with fewer than 5 participants and pagination (max 4 teams per page).
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: string
 *           enum: [under-5]
 *         description: Filter teams with fewer than 5 participants (optional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (4 teams per page)
 *     responses:
 *       200:
 *         description: List of teams retrieved successfully
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
 *         description: Invalid pagination parameter
 *         content:
 *           application/json:
 *             example:
 *               message: O parâmetro de página deve ser um número inteiro maior que 0
 *       404:
 *         description: No teams found
 *         content:
 *           application/json:
 *             examples:
 *               noTeams:
 *                 value:
 *                   message: Não foram encontradas equipas com menos de 5 participantes
 *               invalidPage:
 *                 value:
 *                   message: Não foram encontradas equipas para esta página
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Falha ao listar as equipas
 *               error: Detalhes do erro
 */
router.get("/", teamsController.getTeams);

/**
 * @swagger
 * /teams/search:
 *   get:
 *     summary: Search teams by name
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         description: Team name to search for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching teams
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
 *         description: Invalid parameter
 *         content:
 *           application/json:
 *             example:
 *               message: O parâmetro nome é obrigatório
 *      404:
 *         description: No teams found
 *         content:
 *           application/json:
 *             example:
 *               message: Não foram encontradas equipas com esse nome
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao procurar equipas
 */
router.get("/search", teamsController.searchTeamsByName);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get participants from a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: List of team participants
 *         content:
 *           application/json:
 *             example:
 *               teamId: 1
 *               participants:
 *                 - id: 1
 *                   name: Alice
 *                   email: alice@example.com
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             example:
 *               message: Equipa não encontrada
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao obter participantes da equipa

 */
router.get("/:id", teamsController.getTeamParticipants);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - capacity
 *               - visibility
 *               - competitions_id
 *               - team_passbooks_id
 *               - team_admin
 *             properties:
 *               name:
 *                 type: string
 *                 example: Blue Team
 *               description:
 *                 type: string
 *                 example: A team for experienced players
 *               capacity:
 *                 type: integer
 *                 example: 5
 *               visibility:
 *                 type: integer
 *                 example: 0
 *                 description: 0 = Public, 1 = Private
 *               competitions_id:
 *                 type: integer
 *                 example: 1
 *               team_passbooks_id:
 *                 type: integer
 *                 example: 2
 *               team_admin:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Team successfully created
 *         content:
 *           application/json:
 *             example:
 *               message: Equipa criada com sucesso
 *               teamId: 1
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             example:
 *               message: Os dados enviados estão incorretos ou incompletos
 *      
 *       409:
 *         description: Conflict - Duplicate team name or other data conflict
 *         content:
 *           application/json:
 *             example:
 *               message: Já existe uma equipa com esse nome
 *       422:
 *         description: Unprocessable Entity - Invalid or incomplete data
 *         content:
 *           application/json:
 *             example:
 *               message: Os dados fornecidos não são válidos
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao criar a equipa

 */
router.post("/", teamsController.createTeam);

/**
 * @swagger
 * /teams/{id}/daily-challenges:
 *   get:
 *     summary: Get daily challenges of a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: List of daily challenges
 *         content:
 *           application/json:
 *             example:
 *               challenges:
 *                 - id: 1
 *                   title: Push-up Challenge
 *                   completedBy: [1, 3]
 *       404:
 *         description: Team or challenges not found
 *         content:
 *           application/json:
 *             example:
 *               message: Equipa ou desafios não encontrados
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao listar desafios diários
 */
router.get("/:id/daily-challenges", teamsController.getTeamChallenges);

/**
 * @swagger
 * /teams/{id}/weekly-challenges:
 *   get:
 *     summary: Get weekly challenge streaks of team participants
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: List of streaks
 *         content:
 *           application/json:
 *             example:
 *               streaks:
 *                 - participantId: 1
 *                   name: Alice
 *                   streak: 4
 *       404:
 *         description: No streaks found
 *         content:
 *           application/json:
 *             example:
 *               message: Nenhum streak encontrado
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao listar streaks semanais
 */
router.get("/:id/weekly-challenges", teamsController.getTeamParticipantsStreaks);

/**
 * @swagger
 * /teams/competition/{id}:
 *   get:
 *     summary: Get all teams from a competition (sorted by ranking if applicable)
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: List of competition teams
 *         content:
 *           application/json:
 *             example:
 *               competitionId: 1
 *               teams:
 *                 - id: 1
 *                   name: Blue Team
 *                   ranking: 2
 *       404:
 *         description: No teams found for competition
 *         content:
 *           application/json:
 *             example:
 *               message: Não foram encontradas equipas para esta competição
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Erro ao listar equipas da competição
 */
router.get("/competition/:id", teamsController.getTeamsByCompetition);

module.exports = router;
