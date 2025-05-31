const Challenge = require("../models/challenges");
const ParticipantsHasChallenges = require("../models/participantsHasChallenges");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../config/database"); 
const Participants = require("../models/participants");
const Team = require("../models/teams");

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
  const { dia, participanteId } = req.query;

  // Verificação de parâmetros obrigatórios
  if (!dia || !participanteId) {
    return res.status(400).json({ error: "Os parâmetros 'dia' e 'participanteId' são obrigatórios." });
  }

  try {
    // Verifica se o participante existe
    const participante = await Participants.findByPk(participanteId);
    if (!participante) {
      return res.status(404).json({ error: "Participante não encontrado." });
    }

    // Obtem data atual para usar o mês e o ano
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1; // Janeiro = 0

    // Formata dia e mês para garantir 2 dígitos
    const diaFormatado = String(dia).padStart(2, '0');
    const mesFormatado = String(mes).padStart(2, '0');

    // Define o intervalo de tempo para o dia selecionado
    const inicioDia = new Date(`${ano}-${mesFormatado}-${diaFormatado}T00:00:00`);
    const fimDia = new Date(`${ano}-${mesFormatado}-${diaFormatado}T23:59:59`);

    // Busca todos os membros da equipa do participante autenticado
    const teamMembers = await Participants.findAll({
      where: {
        teams_id: participante.teams_id,
      },
      attributes: ["id", "name", "image"],
    });

    // Busca os desafios realizados nesse dia por membros da mesma equipa
    const completedChallenges = await ParticipantsHasChallenges.findAll({
      where: {
        starting_date: {
          [Op.between]: [inicioDia, fimDia],
        },
      },
      include: [
        {
          model: Participants,
          as: "participant",
          attributes: ["id", "name", "image"],
          required: true,
          where: {
            teams_id: participante.teams_id,
          },
        },
        {
          model: Challenge,
          as: "challenge",
          attributes: ["id", "title", "description"],
        },
      ],
      order: [["starting_date", "ASC"]],
    });

    // Envia os dados para o frontend
    res.status(200).json({
      teamMembers,
      completedChallenges,
    });
  } catch (error) {
    console.error("Erro ao buscar desafios do dia:", error);
    res.status(500).json({ error: "Erro ao buscar desafios do dia." });
  }
};