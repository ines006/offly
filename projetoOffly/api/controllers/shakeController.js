const { OpenAI } = require("openai");
const { Op } = require("sequelize");
const Participants = require("../models/participants");
const Answers = require("../models/answers");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const Challenges = require("../models/challenges");
const ChallengeLevels = require("../models/challengeLevel"); 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateShakeChallenges = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: "userId inválido" });
    }

    const participant = await Participants.findByPk(userId);
    if (!participant) {
      return res.status(404).json({ error: "Participante não encontrado" });
    }

    const userAnswers = await Answers.findByPk(participant.answers_id);
    if (!userAnswers || !userAnswers.answers) {
      return res.status(400).json({ error: "Características não encontradas" });
    }

    const userCharacteristics = userAnswers.answers;

    const completedChallenges = await ParticipantsHasChallenges.findAll({
      where: {
        participants_id: userId,
        validated: 1,
        challenge_types_id: 2,
        completed_date: { [Op.ne]: null },
      },
    });

    const completedDescriptions = completedChallenges
      .map((c) => c.description || "")
      .filter(Boolean);

    const prompt = `
Cria exatamente 3 desafios personalizados para uma pessoa com estas características:
${userCharacteristics}

Evita repetir os seguintes desafios já concluídos:
${completedDescriptions.join("\n")}

Requisitos dos desafios:
- Um deve ser nível "fácil", outro "intermédio" e outro "difícil"
- Devem ser seguros
- Gratuitos (preferencialmente)
- Fora do ecrã
- Realizáveis no mesmo dia
- Comprováveis com uma só fotografia

Formato da resposta:
JSON válido com esta estrutura:
[
  { "title": "Título do desafio 1", "description": "Descrição curta", "level": "fácil" },
  { "title": "Título do desafio 2", "description": "Descrição curta", "level": "intermédio" },
  { "title": "Título do desafio 3", "description": "Descrição curta", "level": "difícil" }
]

Responde apenas com o JSON.
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const raw = response.choices[0].message.content.trim();

    let parsedChallenges;
    try {
      parsedChallenges = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON mal formatado pelo GPT:", raw);
      return res.status(500).json({ error: "Erro ao interpretar os desafios gerados." });
    }

    if (!Array.isArray(parsedChallenges) || parsedChallenges.length !== 3) {
      return res.status(500).json({ error: "Resposta inválida. Esperados 3 desafios." });
    }

    const valid = parsedChallenges.every(
      (c) => c.title && c.description && ["fácil", "intermédio", "difícil"].includes(c.level)
    );

    if (!valid) {
      return res.status(500).json({ error: "Estrutura de desafio inválida." });
    }

    // 🔽 Mapeia nível textual para ID numérico
    const levelMap = {
      "fácil": 1,
      "intermédio": 2,
      "difícil": 3,
    };

    const levelIds = [...new Set(parsedChallenges.map(c => levelMap[c.level]))];

    const levelData = await ChallengeLevels.findAll({
      where: { level: { [Op.in]: levelIds } }
    });

    const levelImageMap = {};
    levelData.forEach((lvl) => {
      levelImageMap[lvl.level] = {
        image: lvl.image_level,
        id: lvl.id
      };
    });

    const challengesWithImages = parsedChallenges.map((challenge) => {
      const levelInfo = levelImageMap[levelMap[challenge.level]] || {};
      return {
        ...challenge,
        image: levelInfo.image || null,
        levelId: levelInfo.id || null,
      };
    });

    res.status(200).json({ challenges: challengesWithImages });
  } catch (error) {
    console.error("Erro em generateShakeChallenges:", error.message);
    res.status(500).json({ error: "Erro ao gerar desafios personalizados" });
  }
};

exports.saveSelectedChallenge = async (req, res) => {
  try {
    const { title, description, levelId, userId } = req.body;

    if (!title || !description || !levelId || !userId) {
      return res.status(400).json({
        error: "title, description, levelId e userId são obrigatórios",
      });
    }

    const challenge = await Challenges.create({
      title,
      description,
      img: null,
      challenge_types_id: 1, 
      challenge_levels_id: levelId,
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 1);

    const participation = await ParticipantsHasChallenges.create({
      participants_id: userId,
      challenges_id: challenge.id,
      challenge_types_id: challenge.challenge_types_id,
      challenge_levels_id_challenge_levels: challenge.challenge_levels_id,
      user_img: "",
      validated: 0,
      streak: 0,
      completed_date: null,
      starting_date: now,
      end_date: endDate,
      description: challenge.description,
    });

    return res.status(201).json({
      message: "Desafio guardado e associado com sucesso",
      challenge,
      participation,
    });
  } catch (error) {
    console.error("❌ Erro em saveSelectedChallenge:", error);
    return res.status(500).json({ error: "Erro ao guardar seleção" });
  }
};

exports.validateChallengeTimeOut = async (req, res) => {
  try {
    const { id } = req.params;

    const challengeEntry = await ParticipantsHasChallenges.findByPk(id);
    if (!challengeEntry) {
      return res.status(404).json({ error: "Registo não encontrado" });
    }

    challengeEntry.validated = 1;
    await challengeEntry.save();

    return res.status(200).json({ message: "Desafio validado automaticamente com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao validar desafio automaticamente:", error);
    return res.status(500).json({ error: "Erro ao validar desafio." });
  }
};
