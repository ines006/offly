const express = require("express");
const router = express.Router();
const participantsController = require("../controllers/participantsController");
const authenticateToken = require("../middlewares/auth");
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
 *     description: Retrieves a paginated list of teams, including their name, capacity, and participant count. Optionally filters teams with fewer than 5 participants using the capacity query parameter. Supports pagination with a fixed limit of 4 teams per page.
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: string
 *           enum: [under-5]
 *         required: false
 *         description: Filter teams with fewer than 5 participants
 *         example: under-5
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: The page number for pagination (default is 1)
 *         example: 1
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
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
 *                         description: The name of the team
 *                         example: "eagles"
 *                       capacity:
 *                         type: integer
 *                         description: The maximum number of participants allowed
 *                         example: 5
 *                       participant_count:
 *                         type: string
 *                         description: The number of participants in the team (returned as a string but represents an integer)
 *                         example: "3"
 *                   description: List of teams with their details
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       description: The total number of pages
 *                       example: 3
 *                     totalTeams:
 *                       type: integer
 *                       description: The total number of teams
 *                       example: 10
 *                     limit:
 *                       type: integer
 *                       description: The number of teams per page
 *                       example: 4
 *                   description: Pagination metadata
 *             examples:
 *               withTeams:
 *                 summary: Teams with pagination
 *                 value:
 *                   teams:
 *                     - name: "eagles"
 *                       capacity: 5
 *                       participant_count: "4"
 *                     - name: "falcons"
 *                       capacity: 5
 *                       participant_count: "3"
 *                     - name: "hawks"
 *                       capacity: 4
 *                       participant_count: "2"
 *                     - name: "owls"
 *                       capacity: 5
 *                       participant_count: "1"
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 3
 *                     totalTeams: 10
 *                     limit: 4
 *               under5Filter:
 *                 summary: Teams with fewer than 5 participants
 *                 value:
 *                   teams:
 *                     - name: "hawks"
 *                       capacity: 4
 *                       participant_count: "2"
 *                     - name: "owls"
 *                       capacity: 5
 *                       participant_count: "1"
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 1
 *                     totalTeams: 2
 *                     limit: 4
 *               emptyPage:
 *                 summary: Empty page (valid page number)
 *                 value:
 *                   teams: []
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 0
 *                     totalTeams: 0
 *                     limit: 4
 *       404:
 *         description: No teams found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating no teams were found
 *             examples:
 *               noTeamsUnder5:
 *                 summary: No teams with fewer than 5 participants
 *                 value:
 *                   message: No teams found with fewer than 5 participants
 *               invalidPage:
 *                 summary: No teams for the requested page
 *                 value:
 *                   message: No teams found for this page
 *       422:
 *         description: Invalid page parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating invalid page parameter
 *                   example: The page parameter must be an integer greater than 0
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: General error message
 *                   example: Error listing teams
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.get("/", teamsController.getTeams);

/**
 * @swagger
 * /teams/search:
 *   get:
 *     summary: Search teams by name
 *     description: Searches for teams whose names contain the specified query string. The search is case-sensitive and returns team details, including participants and associated competition name. The 'name' query parameter is required.
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name (or partial name) to search for teams
 *         example: Eagles
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the team
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The name of the team
 *                     example: Eagles
 *                   description:
 *                     type: string
 *                     description: The description of the team
 *                     example: A competitive team
 *                   image:
 *                     type: string
 *                     description: Team image URL (optional — auto-generated if not submitted)
 *                     example: "https://meusite.com/imagens/random.png"
 *                   points:
 *                     type: integer
 *                     description: The team's points
 *                     example: 150
 *                   capacity:
 *                     type: integer
 *                     description: The maximum number of participants allowed
 *                     example: 5
 *                   visibility:
 *                     type: string
 *                     description: The visibility status of the team (e.g., public, private)
 *                     example: public
 *                   competitions_id:
 *                     type: integer
 *                     description: The ID of the associated competition
 *                     example: 1
 *                   competition_name:
 *                     type: string
 *                     nullable: true
 *                     description: The name of the associated competition, or null if none
 *                     example: Spring Tournament
 *                   team_passbooks_id:
 *                     type: integer
 *                     description: The ID of the team's passbook
 *                     example: 101
 *                   team_admin:
 *                     type: integer
 *                     description: The ID of the team admin
 *                     example: 1
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the participant
 *                           example: 1
 *                         name:
 *                           type: string
 *                           description: The name of the participant
 *                           example: John Doe
 *                     description: List of participants in the team
 *             examples:
 *               teamsFound:
 *                 summary: Teams matching the search query
 *                 value:
 *                   - id: 1
 *                     name: Eagles
 *                     description: A competitive team
 *                     points: 150
 *                     capacity: 5
 *                     visibility: public
 *                     competitions_id: 1
 *                     competition_name: Spring Tournament
 *                     team_passbooks_id: 101
 *                     team_admin: 1
 *                     participants:
 *                       - id: 1
 *                         name: John Doe
 *                       - id: 2
 *                         name: Jane Smith
 *                   - id: 2
 *                     name: Golden Eagles
 *                     description: An elite squad
 *                     points: 120
 *                     capacity: 4
 *                     visibility: private
 *                     competitions_id: null
 *                     competition_name: null
 *                     team_passbooks_id: 102
 *                     team_admin: 3
 *                     participants: []
 *       404:
 *         description: No teams found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating no teams were found
 *                   example: No teams found with this name
 *       422:
 *         description: Missing name parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the name parameter is required
 *                   example: The 'name' parameter is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: General error message
 *                   example: Error searching teams
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.get("/search", teamsController.searchTeamsByName);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get details of a team and its participants
 *     description: Retrieves information about a team, including its name, points, capacity, associated competition (if any), and list of participants.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the team to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Team details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   nullable: true
 *                   description: The name of the competition (overrides team name if competition exists)
 *                   example: "Spring Tournament"
 *                 image:
 *                   type: string
 *                   description: Team image URL (optional — auto-generated if not submitted)
 *                   example: "https://meusite.com/imagens/random.png"
 *                 points:
 *                   type: integer
 *                   description: The team's total points
 *                   example: 150
 *                 capacity:
 *                   type: integer
 *                   description: The maximum number of participants allowed in the team
 *                   example: 10
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The participant's ID
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The participant's name
 *                         example: "João Silva"
 *                   description: List of participants in the team
 *             examples:
 *               withCompetitionAndParticipants:
 *                 summary: Team with competition and participants
 *                 value:
 *                   name: "Spring Tournament"
 *                   points: 150
 *                   capacity: 10
 *                   participants:
 *                     - id: 1
 *                       name: "João Silva"
 *                     - id: 2
 *                       name: "Maria Santos"
 *               noCompetition:
 *                 summary: Team without competition
 *                 value:
 *                   name: null
 *                   points: 50
 *                   capacity: 5
 *                   participants:
 *                     - id: 3
 *                       name: "Carlos Pereira"
 *               noParticipants:
 *                 summary: Team with competition but no participants
 *                 value:
 *                   name: "Winter League"
 *                   points: 0
 *                   capacity: 8
 *                   participants: []
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the team does not exist
 *                   example: Team not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: General error message
 *                   example: Error listing participants
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.get("/:id", teamsController.getTeamParticipants);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team
 *     description: Creates a new team with the specified details. The user must be authenticated and not currently a member of any team. The authenticated user is set as the team admin. Team names are case-insensitive and stored in lowercase.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *               - visibility
 *             properties:
 *               name:
 *                 type: string
 *                 description: The unique name of the team (3 to 40 characters, case-insensitive)
 *                 example: "Eagles"
 *               description:
 *                 type: string
 *                 description: A brief description of the team (3 to 60 characters, optional)
 *                 example: "A competitive team for the Spring Tournament"
 *               capacity:
 *                 type: integer
 *                 description: The maximum number of participants (3 to 5)
 *                 example: 4
 *               visibility:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Team visibility (0 for public, 1 for private)
 *                 example: 1
 *               competitions_id:
 *                 type: integer
 *                 description: The ID of the associated competition (optional)
 *                 example: 1
 *               team_passbooks_id:
 *                 type: integer
 *                 description: The ID of the team's passbook (optional)
 *                 example: 1
 *               team_admin:
 *                 type: integer
 *                 description: The ID of the team admin (set to the authenticated user's ID)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the created team
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: The team name (lowercase)
 *                   example: "eagles"
 *                 description:
 *                   type: string
 *                   description: The team description
 *                   example: "A competitive team for the Spring Tournament"
*                  image:
 *                   type: string
 *                   description: Team image URL (optional — auto-generated if not submitted)
 *                   example: "https://meusite.com/imagens/random.png"
 *                 points:
 *                   type: integer
 *                   description: The team's initial points
 *                   example: 100
 *                 capacity:
 *                   type: integer
 *                   description: The team's capacity
 *                   example: 4
 *                 visibility:
 *                   type: integer
 *                   description: The team's visibility (0 or 1)
 *                   example: 1
 *                 competitions_id:
 *                   type: integer
 *                   nullable: true
 *                   description: The ID of the associated competition
 *                   example: 1
 *                 team_passbooks_id:
 *                   type: integer
 *                   nullable: true
 *                   description: The ID of the team's passbook
 *                   example: 1
 *                 team_admin:
 *                   type: integer
 *                   description: The ID of the team admin
 *                   example: 1
 *       400:
 *         description: Missing team name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating missing team name
 *                   example: Team name is required
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating missing authentication
 *                   example: Authentication required
 *       403:
 *         description: User already in a team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user is already in a team
 *                   example: You are already a member of a team
 *       404:
 *         description: Competition not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the competition does not exist
 *                   example: Competition not found
 *       409:
 *         description: Team name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the team name is taken
 *                   example: A team with this name already exists
 *       422:
 *         description: Invalid input fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the validation issue
 *             examples:
 *               invalidName:
 *                 summary: Invalid team name length
 *                 value:
 *                   message: Team name must be between 3 and 40 characters
 *               invalidDescription:
 *                 summary: Invalid description length
 *                 value:
 *                   message: Description must be between 3 and 60 characters
 *               invalidCapacity:
 *                 summary: Invalid capacity
 *                 value:
 *                   message: Team capacity must be an integer between 3 and 5
 *               invalidVisibility:
 *                 summary: Invalid visibility
 *                 value:
 *                   message: Visibility must be 0 (public) or 1 (private)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: General error message
 *                   example: Error creating team
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post("/", authenticateToken, teamsController.createTeam);

/**
 * @swagger
 * /teams/{id}/daily-challenges:
 *   get:
 *     summary: List validated daily challenges for a team's participants
 *     description: Retrieves all validated daily challenges for participants of a specified team on a given date. The date must be provided in the format `YYYY-MM-DD` as a query parameter. Challenges are filtered to have a duration of up to 24 hours, started before or on the date plus 24 hours, ended on or after the date, and completed within the specified date. Returns participant names, team description, challenge details, and timestamps.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the team
 *         example: 1
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The date to filter challenges (format YYYY-MM-DD)
 *         example: 2025-04-01
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   team_description:
 *                     type: string
 *                     description: The description of the team
 *                     example: A competitive team for the Spring Tournament
 *                   name:
 *                     type: string
 *                     description: The name of the participant
 *                     example: John Doe
 *                   title:
 *                     type: string
 *                     description: The title of the challenge
 *                     example: Daily Challenge
 *                   description:
 *                     type: string
 *                     description: The description of the challenge
 *                     example: Complete a 5km run
 *                   starting_date:
 *                     type: string
 *                     format: date-time
 *                     description: The start date and time of the challenge
 *                     example: 2025-04-01T08:00:00.000Z
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                     description: The end date and time of the challenge
 *                     example: 2025-04-01T20:00:00.000Z
 *                   completed_date:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time when the challenge was completed
 *                     example: 2025-04-01T15:30:00.000Z
 *                   validated:
 *                     type: boolean
 *                     description: Indicates if the challenge was validated (always true in this response)
 *                     example: true
 *             examples:
 *               challengesFound:
 *                 summary: Validated challenges for the team
 *                 value:
 *                   - team_description: A competitive team for the Spring Tournament
 *                     name: John Doe
 *                     title: Daily Challenge
 *                     description: Complete a 5km run
 *                     starting_date: 2025-04-01T08:00:00.000Z
 *                     end_date: 2025-04-01T20:00:00.000Z
 *                     completed_date: 2025-04-01T15:30:00.000Z
 *                     validated: true
 *                   - team_description: A competitive team for the Spring Tournament
 *                     name: Jane Smith
 *                     title: Morning Quiz
 *                     description: Answer 10 questions correctly
 *                     starting_date: 2025-04-01T09:00:00.000Z
 *                     end_date: 2025-04-01T11:00:00.000Z
 *                     completed_date: 2025-04-01T10:30:00.000Z
 *                     validated: true
 *       404:
 *         description: Team or challenges not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the resource was not found
 *             examples:
 *               teamNotFound:
 *                 summary: Team not found
 *                 value:
 *                   message: Team not found
 *               noChallenges:
 *                 summary: No challenges found for the team on the date
 *                 value:
 *                   message: No challenges found for this team on the specified date
 *       422:
 *         description: Missing or invalid date parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the date is required
 *                   example: The date is required (use ?date=YYYY-MM-DD)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: General error message
 *                   example: Error listing challenges
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.get("/:id/daily-challenges", teamsController.getTeamChallenges);

/**
 * @swagger
 * /teams/{id}/weekly-challenges:
 *   get:
 *     summary: List weekly challenge streaks for a team's participants
 *     description: Retrieves the streaks of weekly challenges for participants of a specified team during a given week. The week is identified by its starting Monday in the format `YYYY-MM-DD` (e.g., 2025-03-31). Challenges must start on the specified Monday and end 7 days later. Returns participant names, competition name, challenge description, and a streak array indicating daily completion (7 elements, "1" for completed, "0" for not completed). No authentication is required.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the team
 *         example: 1
 *       - in: query
 *         name: week
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The Monday of the week to filter challenges (format YYYY-MM-DD)
 *         example: 2025-03-31
 *     responses:
 *       200:
 *         description: Streaks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   participant_name:
 *                     type: string
 *                     description: The name of the participant
 *                     example: John Doe
 *                   streak:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: ["0", "1"]
 *                     minItems: 7
 *                     maxItems: 7
 *                     description: Array of 7 elements representing daily challenge completion ("1" for completed, "0" for not completed)
 *                     example: ["1", "1", "0", "1", "0", "1", "1"]
 *                   competition_name:
 *                     type: string
 *                     description: The name of the competition
 *                     example: Spring Tournament
 *                   challenge_description:
 *                     type: string
 *                     description: The description of the challenge, or "No description" if unavailable
 *                     example: Complete weekly tasks
 *             examples:
 *               streaksFound:
 *                 summary: Weekly streaks for the team
 *                 value:
 *                   - participant_name: John Doe
 *                     streak: ["1", "1", "0", "1", "0", "1", "1"]
 *                     competition_name: Spring Tournament
 *                     challenge_description: Complete weekly tasks
 *                   - participant_name: Jane Smith
 *                     streak: ["0", "1", "1", "1", "1", "0", "0"]
 *                     competition_name: Spring Tournament
 *                     challenge_description: Weekly quiz series
 *       404:
 *         description: Team or challenges not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the resource was not found
 *             examples:
 *               teamNotFound:
 *                 summary: Team not found
 *                 value:
 *                   message: Team not found
 *               noChallenges:
 *                 summary: No weekly challenges found for the team
 *                 value:
 *                   message: No weekly challenges found for this team in the specified week
 *       422:
 *         description: Invalid week parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating invalid week parameter
 *             examples:
 *               missingOrInvalidWeek:
 *                 summary: Missing or invalid week format
 *                 value:
 *                   message: The week is required and must be in YYYY-MM-DD format (e.g., 2025-03-31)
 *               notMonday:
 *                 summary: Date is not a Monday
 *                 value:
 *                   message: The date must be a Monday
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: General error message
 *                   example: Error listing streaks
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.get(
  "/:id/weekly-challenges",
  teamsController.getTeamParticipantsStreaks
);

/**
 * @swagger
 * /teams/competition/{id}:
 *   get:
 *     summary: List teams for a specific competition
 *     description: Retrieves all teams associated with a competition identified by its ID. Optionally sorts teams by ranking (points in descending order) using the `sort` query parameter. Returns the competition name and a list of teams with their names and points.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the competition
 *         example: 1
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [ranking]
 *         required: false
 *         description: Sort teams by ranking (points in descending order)
 *         example: ranking
 *     responses:
 *       200:
 *         description: Teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 competition_name:
 *                   type: string
 *                   description: The name of the competition
 *                   example: Spring Tournament
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the team
 *                         example: eagles
 *                       points:
 *                         type: integer
 *                         description: The team's points
 *                         example: 150
 *                   description: List of teams in the competition, sorted by points if `sort=ranking`, otherwise in database-dependent order
 *             examples:
 *               sortedByRanking:
 *                 summary: Teams sorted by ranking
 *                 value:
 *                   competition_name: Spring Tournament
 *                   teams:
 *                     - name: eagles
 *                       points: 150
 *                     - name: falcons
 *                       points: 100
 *                     - name: hawks
 *                       points: 50
 *               unsorted:
 *                 summary: Teams without specific sorting
 *                 value:
 *                   competition_name: Spring Tournament
 *                   teams:
 *                     - name: falcons
 *                       points: 100
 *                     - name: eagles
 *                       points: 150
 *                     - name: hawks
 *                       points: 50
 *       404:
 *         description: Competition or teams not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the resource was not found
 *             examples:
 *               competitionNotFound:
 *                 summary: Competition not found
 *                 value:
 *                   message: Competition not found
 *               noTeams:
 *                 summary: No teams found for the competition
 *                 value:
 *                   message: No teams found for this competition
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: General error message
 *                   example: Error listing teams
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.get("/competition/:id", teamsController.getTeamsByCompetition);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     description: Deletes a specified team. Only the team admin (the user who created the team) can perform this action.
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the team to delete
 *         example: 1
 *     responses:
 *       204:
 *         description: Team deleted successfully
 *         content: {}
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating authentication failure
 *                   example: Authentication required
 *       403:
 *         description: User is not the team admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating insufficient permissions
 *                   example: Only the team admin can delete the team
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the team was not found
 *                   example: Team not found
 *       422:
 *         description: Invalid team ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the ID is invalid
 *                   example: The team ID must be a positive integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: General error message
 *                   example: Error deleting team
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.delete("/:id", authenticateToken, teamsController.deleteTeam);

/**
 * @swagger
 * /teams/{teamId}/participants/{participantId}:
 *   delete:
 *     summary: Remove a participant from a team
 *     description: Allows the team admin to remove a participant from the specified team. Only the team admin can perform this action.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the team
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the participant to be removed
 *     responses:
 *       200:
 *         description: Participant removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Participant removed from team successfully
 *       400:
 *         description: Bad request (e.g., participant is the team admin or not in the team)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - Participant is not a member of this team
 *                     - Cannot remove the team admin
 *                   example: Participant is not a member of this team
 *       403:
 *         description: Forbidden (e.g., user is not the team admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Only the team admin can remove participants
 *       404:
 *         description: Team or participant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - Team not found
 *                     - Participant not found
 *             examples:
 *               teamNotFound:
 *                 summary: Team not found
 *                 value:
 *                   error: Team not found
 *               participantNotFound:
 *                 summary: Participant not found
 *                 value:
 *                   error: Participant not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.delete(
  "/:teamId/participants/:participantId",
  authenticateToken,
  teamsController.removeParticipantFromTeam
);

/**
 * @swagger
 * /teams/{id}/join:
 *   post:
 *     summary: Join a public team
 *     description: Allows an authenticated user to join a public team with available slots. The user must not already be a member of any team.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the team to join
 *         example: 1
 *     responses:
 *       201:
 *         description: Successfully joined the team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully joined the team
 *       400:
 *         description: Bad request (e.g., team is full or user is already in a team)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - Participant is already a member of a team
 *                     - Team has no available slots
 *             examples:
 *               alreadyInTeam:
 *                 summary: Participant is already a member of a team
 *                 value:
 *                   error: Participant is already a member of a team
 *               noSlots:
 *                 summary: Team has no available slots
 *                 value:
 *                   error: Team has no available slots
 *       403:
 *         description: Forbidden (e.g., attempting to join a private team)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - Cannot join a private team without an invite
 *             examples:
 *               privateTeam:
 *                 summary: Cannot join a private team
 *                 value:
 *                   error: Cannot join a private team without an invite
 *       404:
 *         description: Team or participant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - Team not found
 *                     - Participant not found
 *             examples:
 *               teamNotFound:
 *                 summary: Team not found
 *                 value:
 *                   error: Team not found
 *               participantNotFound:
 *                 summary: Participant not found
 *                 value:
 *                   error: Participant not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/:id/join", authenticateToken, teamsController.joinTeam);

/**
 * @swagger
 * /teams/{id}/invites:
 *   post:
 *     summary: Create an invite link for a team
 *     description: Allows the team admin to generate an invite link for a private team. The link includes a unique token and expires after 7 days.
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the team
 *         example: 1
 *     responses:
 *       201:
 *         description: Invite created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invite created successfully
 *                 inviteLink:
 *                   type: string
 *                   example: http://offly.com/join?token=550e8400-e29b-41d4-a716-446655440000
 *       403:
 *         description: Forbidden (e.g., user is not the team admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Only the team admin can create invites
 *       404:
 *         description: Team not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Team not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/:id/invites", authenticateToken, teamsController.createInvite);

/**
 * @swagger
 * /teams/join-by-invite:
 *   post:
 *     summary: Join a team using an invite token
 *     description: Allows an authenticated user to join a private team using a valid invite token. The user must not already be a member of any team.
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *             required:
 *               - token
 *     responses:
 *       201:
 *         description: Successfully joined the team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully joined the team via invite
 *       400:
 *         description: Bad request (e.g., invalid token, team is full, or user is already in a team)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - Invite token is required
 *                     - Invite token has expired
 *                     - Participant is already a member of a team
 *                     - Team has no available slots
 *                   example: Invite token is required
 *       404:
 *         description: Invite, team, or participant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   enum:
 *                     - Invalid or expired invite token
 *                     - Team not found
 *                     - Participant not found
 *             examples:
 *               inviteNotFound:
 *                 summary: Invalid or expired invite token
 *                 value:
 *                   error: Invalid or expired invite token
 *               teamNotFound:
 *                 summary: Team not found
 *                 value:
 *                   error: Team not found
 *               participantNotFound:
 *                 summary: Participant not found
 *                 value:
 *                   error: Participant not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/join-by-invite", authenticateToken, teamsController.joinByInvite);


module.exports = router;
