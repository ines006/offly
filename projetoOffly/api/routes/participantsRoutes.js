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
 *                 username: joaosilva
 *                 email: joao@example.com
 *                 level: 1
 *                 gender: 1
 *                 upload: 1
 *                 answers_id: 1
 *                 teams_id: 1
 *                 teams_team_admin: 1
 *       500:
 *         description: Failed to retrieve participants
 *         content:
 *           application/json:
 *             example:
 *               message: Error when searching for participants
 *               error: Internal server error
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
 *               - id: 1
 *                 name: João Silva
 *                 username: joaosilva
 *                 email: joao@example.com
 *                 level: 1
 *                 gender: 1
 *                 upload: 1
 *                 answers_id: 1
 *                 teams_id: 1
 *                 teams_team_admin: 1
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             example:
 *               message: Participant not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Failure to obtain participant
 *               error: Internal server error
 */
router.get("/:id", participantsController.getParticipantById);

/**
 * @swagger
 * /participants:
 *   post:
 *     summary: Create a new participant
 *     description: Creates a new participant with the provided details. Username and email must be unique, password must be at least 6 characters long and contain uppercase, lowercase, and special characters, and gender must be 0 (male) or 1 (female).
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
 *                 description: Full name of the participant
 *                 example: João Silva
 *               username:
 *                 type: string
 *                 description: Unique username
 *                 example: joaosilva
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique email address
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (min 8 chars, must include uppercase, lowercase, and special characters)
 *                 example: Teste123!
 *               gender:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Gender (0 = male, 1 = female)
 *                 example: 0
 *               level:
 *                 type: integer
 *                 description: Participant level (optional, defaults to 1)
 *                 example: 1
 *                 default: 1
 *     responses:
 *       201:
 *         description: Participant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the created participant
 *                   example: 2
 *                 email:
 *                   type: string
 *                   description: Email of the created participant
 *                   example: joao@example.com
 *       400:
 *         description: Invalid password complexity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the password complexity issue
 *                   example: The password must contain at least one uppercase letter, one lowercase letter, a number and a special character
 *       409:
 *         description: Username or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating which field is already in use
 *             examples:
 *               duplicateUsername:
 *                 summary: Username already taken
 *                 value:
 *                   message: Username already in use
 *               duplicateEmail:
 *                 summary: Email already taken
 *                 value:
 *                   message: Email already in use
 *       422:
 *         description: Missing or invalid input fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the validation issue
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: All fields are required
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   message: Invalid email format
 *               shortPassword:
 *                 summary: Password too short
 *                 value:
 *                   message: The password must be at least 8 characters long
 *               invalidGender:
 *                 summary: Invalid gender value
 *                 value:
 *                   message: The gender field must be 0 (male) or 1 (female)
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
 *                   example: Error creating participant
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.post("/", participantsController.createParticipant);

/**
 * @swagger
 * /participants/{id}:
 *   put:
 *     summary: Update a participant's personal data
 *     description: Updates the personal data (name, username, email, or password) of the authenticated participant. Only the participant themselves can update their own data. At least one field must be provided, and all provided fields must be valid.
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the participant to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The participant's full name
 *                 example: João Silva
 *               username:
 *                 type: string
 *                 description: The participant's unique username
 *                 example: joaosilva2
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The participant's unique email address
 *                 example: joao2@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The participant's new password (min 8 characters, must include uppercase, lowercase, number, and special character)
 *                 example: NewPass123!
 *     responses:
 *       200:
 *         description: Participant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Participant updated successfully
 *                 participant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The participant's ID
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: The participant's updated name
 *                       example: João Silva
 *                     username:
 *                       type: string
 *                       description: The participant's updated username
 *                       example: joaosilva2
 *                     email:
 *                       type: string
 *                       description: The participant's updated email
 *                       example: joao2@example.com
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
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user is not authorized
 *                   example: You are not authorized to update this participant's data
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the participant does not exist
 *                   example: Participant not found
 *       409:
 *         description: Username or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating which field is already in use
 *             examples:
 *               duplicateUsername:
 *                 summary: Username already taken
 *                 value:
 *                   message: Username already in use
 *               duplicateEmail:
 *                 summary: Email already taken
 *                 value:
 *                   message: Email already in use
 *       422:
 *         description: Invalid or missing input fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the validation issue
 *             examples:
 *               noFieldsProvided:
 *                 summary: No fields provided
 *                 value:
 *                   message: At least one field must be provided for update
 *               emptyName:
 *                 summary: Empty name field
 *                 value:
 *                   message: Name cannot be empty
 *               emptyUsername:
 *                 summary: Empty username field
 *                 value:
 *                   message: Username cannot be empty
 *               emptyEmail:
 *                 summary: Empty email field
 *                 value:
 *                   message: Email cannot be empty
 *               emptyPassword:
 *                 summary: Empty password field
 *                 value:
 *                   message: Password cannot be empty
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   message: Invalid email format
 *               shortPassword:
 *                 summary: Password too short
 *                 value:
 *                   message: The password must be at least 8 characters long
 *               weakPassword:
 *                 summary: Password lacks required complexity
 *                 value:
 *                   message: The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
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
 *                   example: Error updating participant
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
router.put(
  "/:id",
  authenticateToken,
  authorizeSelf,
  participantsController.updateParticipant
);

/**
 * @swagger
 * /participants/{id}:
 *   delete:
 *     summary: Delete a participant's account
 *     description: Deletes the account of the authenticated participant. Only the participant themselves can delete their own account. Requires a valid JWT token for authentication.
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the participant to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Participant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message confirming the deletion
 *                   example: Participant deleted successfully
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
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user is not authorized
 *                   example: You are not authorized to update this participant's data
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the participant does not exist
 *                   example: Participant not found
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
 *                   example: Error deleting participant
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
router.delete(
  "/:id",
  authenticateToken,
  authorizeSelf,
  participantsController.deleteParticipant
);

/**
 * @swagger
 * /participants/{id}/answers:
 *   get:
 *     summary: Get a participant's answers to the initial questionnaire
 *     description: Retrieves the answers submitted by a participant to the initial questionnaire. Returns the participant's ID and their answers.
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the participant whose answers are to be retrieved
 *         example: 1
 *     responses:
 *       200:
 *         description: Answers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The participant's ID
 *                   example: 1
 *                 answers:
 *                   type: object
 *                   nullable: true
 *                   description: The participant's answers to the initial questionnaire, or null if no answers exist
 *                   example:
 *                     question1: "Option A"
 *                     question2: "Option B"
 *             examples:
 *               Answers:
 *                 summary: Answers
 *                 value:
 *                   id: 1
 *                   answers:
 *                     question1: "Option A"
 *                     question2: "Option B"
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the participant does not exist
 *                   example: Participant not found
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
 *                   example: Error fetching answers
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
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
 *     summary: Add or update a participant's answers to the initial questionnaire
 *     description: Adds or updates the answers to the initial questionnaire for a participant. Expects an array of exactly 4 non-empty answers. If the participant already has answers, they are updated; otherwise, new answers are created.
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the participant whose answers are to be added or updated
 *         example: 1
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
 *                 description: An array of exactly 4 non-empty answers to the initial questionnaire
 *                 example: ["Option A", "Option B", "Option C", "Option D"]
 *     responses:
 *       201:
 *         description: Answers added or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The participant's ID
 *                   example: 1
 *                 answers:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The participant's answers to the initial questionnaire
 *                   example: ["Option A", "Option B", "Option C", "Option D"]
 *       404:
 *         description: Participant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the participant does not exist
 *                   example: Participant not found
 *       422:
 *         description: Invalid or missing answers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message explaining the validation issue
 *             examples:
 *               missingAnswers:
 *                 summary: Answers field is missing
 *                 value:
 *                   message: Answers are required
 *               invalidAnswers:
 *                 summary: Invalid answers format or count
 *                 value:
 *                   message: Each of the 4 questions must have an associated answer
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
 *                   example: Error adding answers
 *                 error:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
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
 *     summary: Check if a participant has an active daily challenge
 *     description: Verifies if the authenticated participant has an active challenge for today. Returns the challenge details if active, or indicates no active challenge exists. Only the participant themselves can access their own challenge data.
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the participant to check for an active challenge
 *         example: 1
 *     responses:
 *       200:
 *         description: Challenge status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 active:
 *                   type: boolean
 *                   description: Indicates if there is an active challenge
 *                 challenge:
 *                   type: object
 *                   description: Details of the active challenge, if present
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The challenge assignment ID
 *                       example: 1
 *                     participants_id:
 *                       type: integer
 *                       description: The participant's ID
 *                       example: 1
 *                     starting_date:
 *                       type: string
 *                       format: date-time
 *                       description: Start date of the challenge
 *                       example: "2025-04-13T00:00:00.000Z"
 *                     end_date:
 *                       type: string
 *                       format: date-time
 *                       description: End date of the challenge
 *                       example: "2025-04-13T23:59:59.999Z"
 *                     validated:
 *                       type: integer
 *                       description: Validation status (0 = not validated)
 *                       example: 0
 *                     Challenge:
 *                       type: object
 *                       description: Details of the associated challenge
 *                       properties:
 *                         title:
 *                           type: string
 *                           description: Title of the challenge
 *                           example: "Daily Fitness Challenge"
 *                         description:
 *                           type: string
 *                           description: Description of the challenge
 *                           example: "Complete a 30-minute workout session."
 *                 message:
 *                   type: string
 *                   description: Message indicating no active challenge, if applicable
 *             examples:
 *               activeChallenge:
 *                 summary: Active challenge found
 *                 value:
 *                   active: true
 *                   challenge:
 *                     id: 1
 *                     participants_id: 1
 *                     starting_date: "2025-04-13T00:00:00.000Z"
 *                     end_date: "2025-04-13T23:59:59.999Z"
 *                     validated: 0
 *                     Challenge:
 *                       title: "Daily Fitness Challenge"
 *                       description: "Complete a 30-minute workout session."
 *               noActiveChallenge:
 *                 summary: No active challenge
 *                 value:
 *                   active: false
 *                   message: "No active challenge found"
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
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user is not authorized
 *                   example: You are not authorized to update this participant's data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: General error message
 *                   example: Error fetching daily challenge
 *                 details:
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
router.get(
  "/:id/daily-challenge",
  authenticateToken,
  authorizeSelf,
  participantsController.getDailyChallenge
);

/**
 * @swagger
 * /participants/{id}/daily-challenge:
 *   post:
 *     summary: Assign a new daily challenge to a participant
 *     description: Choose a new daily challenge with a unique title, description, and level, and associates it with the specified participant.
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the participant to associate the challenge with
 *         example: 1
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
 *                 description: The unique title of the challenge (case-insensitive)
 *                 example: "Morning Yoga"
 *               description:
 *                 type: string
 *                 description: A description of the challenge
 *                 example: "Complete a 30-minute yoga session in the morning."
 *               level:
 *                 type: integer
 *                 description: The difficulty level of the challenge (1 to 3)
 *                 example: 2
 *     responses:
 *       201:
 *         description: Challenge associated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message confirming the challenge creation
 *                   example: Challenge created and associated with the participant!
 *                 challenge:
 *                   type: object
 *                   description: Details of the newly created challenge
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The challenge ID
 *                       example: 1
 *                     title:
 *                       type: string
 *                       description: The challenge title
 *                       example: "morning yoga"
 *                     description:
 *                       type: string
 *                       description: The challenge description
 *                       example: "Complete a 30-minute yoga session in the morning."
 *                     challenge_types_id_challenge_types:
 *                       type: integer
 *                       description: The challenge type ID
 *                       example: 1
 *       409:
 *         description: Challenge title already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the title is already in use
 *                   example: A challenge with this title already exists
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
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user is not authorized
 *                   example: You are not authorized to update this participant's data
 *       422:
 *         description: Invalid or missing input fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining the validation issue
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: The challenge must have a title, description, and level associated.
 *               invalidLevel:
 *                 summary: Invalid level value
 *                 value:
 *                   error: The challenge level must be an integer between 1 and 3.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: General error message
 *                 details:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   nullable: true
 *             examples:
 *               creationFailed:
 *                 summary: Failed to create challenge
 *                 value:
 *                   error: Failed to create the challenge
 *               serverError:
 *                 summary: General server error
 *                 value:
 *                   error: Error creating challenge
 *                   details: Internal server error
 */
router.post(
  "/:id/daily-challenge",
  authenticateToken,
  authorizeSelf,
  participantsController.createDailyChallenge
);

/**
 * @swagger
 * /participants/{id}/daily-challenge:
 *   put:
 *     summary: Mark a daily challenge as completed
 *     description: Marks a specific challenge as completed for a participant by updating its status to validated and associating an image.
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the participant whose challenge is to be marked as completed
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challengeId:
 *                 type: integer
 *                 description: The ID of the challenge to mark as completed
 *                 example: 1
 *               userImg:
 *                 type: string
 *                 description: A URL or path to the image associated with the challenge completion
 *                 example: "https://example.com/images/challenge-proof.jpg"
 *     responses:
 *       200:
 *         description: Challenge marked as completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message confirming the challenge was marked as completed
 *                   example: Challenge completed successfully!
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
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating the user is not authorized
 *                   example: You are not authorized to update this participant's data
 *       404:
 *         description: No challenge found to update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating no matching challenge was found
 *                   example: No challenge found to update
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: General error message
 *                   example: Error completing challenge
 *                 details:
 *                   type: string
 *                   description: Detailed error message from the server
 *                   example: Internal server error
 */
router.put(
  "/:id/daily-challenge",
  authenticateToken,
  authorizeSelf,
  participantsController.completeDailyChallenge
);

module.exports = router;
