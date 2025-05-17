const Challenge = require("../models/challenges");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../config/database"); 
const Participants = require("../models/participants");

exports.getRandomChallenges = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  try {
    // Buscar os IDs de desafios já validados pelo utilizador
    const validated = await ParticipantsHasChallenges.findAll({
      where: {
        participants_id: userId,
        validated: 1, // Somente os validados (1 = true)
      },
      attributes: ["challenges_id"],
    });

    const validatedIds = validated.map((entry) => entry.challenges_id);

    // Buscar até 3 desafios ainda não validados
    const challenges = await Challenge.findAll({
      where: {
        id: {
          [Op.notIn]: validatedIds.length ? validatedIds : [0],
        },
      },
      attributes: ["id", "title", "description", "img"],
      order: Sequelize.literal("RAND()"),
      limit: 3,
    });

    res.status(200).json(challenges);
  } catch (error) {
    console.error("Erro ao buscar desafios:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }

};

exports.getChallengeImage = async (req, res) => {
  const challengeId = req.params.id;

  try {
    const [results] = await sequelize.query(
      "SELECT img FROM challenges WHERE id = ?",
      {
        replacements: [challengeId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results || !results.img) {
      return res.status(404).json({ error: "Imagem não encontrada." });
    }

    res.set("Content-Type", "image/jpeg");
    res.send(results.img); // ou results[0].img se necessário
  } catch (error) {
    console.error("Erro ao carregar imagem:", error);
    res.status(500).json({ error: "Erro ao carregar imagem." });
  }
};

exports.getDesafiosDoDia = async (req, res) => {
  const { dia } = req.query;

  if (!dia) {
    return res.status(400).json({ error: "O parâmetro 'dia' é obrigatório." });
  }

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;

  const diaFormatado = String(dia).padStart(2, '0');
  const mesFormatado = String(mes).padStart(2, '0');

  const inicioDia = new Date(`${ano}-${mesFormatado}-${diaFormatado}T00:00:00`);
  const fimDia = new Date(`${ano}-${mesFormatado}-${diaFormatado}T23:59:59`);

  try {
    const resultados = await ParticipantsHasChallenges.findAll({
      where: {
        starting_date: {
          [Op.between]: [inicioDia, fimDia],
        },
      },
      include: [
        {
          model: Participants,
          as: "participant",
          attributes: ["id", "name", "image"]
        },
        {
          model: Challenge,
          as: "challenge",
          attributes: ["id", "title", "description"]
        }
      ],
      order: [["starting_date", "ASC"]]
    });

    res.status(200).json(resultados);
  } catch (error) {
    console.error("Erro ao buscar desafios do dia:", error);
    res.status(500).json({ error: "Erro ao buscar desafios do dia." });
  }
};