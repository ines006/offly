const { OpenAI } = require("openai");
const Participants = require("../models/participants");
const Answers = require("../models/answers");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");

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
        completed_date: { [require("sequelize").Op.ne]: null },
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

    // Tentar fazer parse do JSON
    let parsedChallenges;
    try {
      parsedChallenges = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON mal formatado pelo GPT:", raw);
      return res.status(500).json({ error: "Erro ao interpretar os desafios gerados." });
    }

    // Validar que há 3 desafios e que têm os campos certos
    if (!Array.isArray(parsedChallenges) || parsedChallenges.length !== 3) {
      return res.status(500).json({ error: "Resposta inválida. Esperados 3 desafios." });
    }

    const valid = parsedChallenges.every(
      (c) => c.title && c.description && ["fácil", "intermédio", "difícil"].includes(c.level)
    );

    if (!valid) {
      return res.status(500).json({ error: "Estrutura de desafio inválida." });
    }

    res.status(200).json({ challenges: parsedChallenges });
  } catch (error) {
    console.error("Erro em generateShakeChallenges:", error.message);
    res.status(500).json({ error: "Erro ao gerar desafios personalizados" });
  }
};


exports.saveSelectedChallenge = async (req, res) => {
  try {
    const { title, description, levelId } = req.body;

    if (!title || !description || !levelId) {
      return res
        .status(400)
        .json({ error: "title, description e levelId são obrigatórios" });
    }

    const challenge = await Challenges.create({
      title,
      description,
      challenge_types_id: 1, // tipo shake
      challenge_levels_id: levelId,
    });

    res.status(201).json({
      message: "Desafio guardado com sucesso",
      challenge,
    });
  } catch (error) {
    console.error("Erro em saveSelectedChallenge:", error.message);
    res.status(500).json({ error: "Erro ao guardar desafio" });
  }
};