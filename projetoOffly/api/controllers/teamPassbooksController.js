const TeamPassbooks = require("../models/teamPassbooks");
const Teams = require("../models/teams");

exports.createTeamPassbook = async (req, res) => {
  const { competitions_id, team_id } = req.body;

  if (!competitions_id || !team_id) {
    return res.status(400).json({ message: "competitions_id e team_id são obrigatórios." });
  }

  try {
    // 1. Criar nova caderneta
    const newPassbook = await TeamPassbooks.create({ competitions_id });

    // 2. Atualizar a equipa com o ID da nova caderneta
    await Teams.update(
      { team_passbooks_id: newPassbook.id },
      { where: { id: team_id } }
    );

    return res.status(201).json({
      message: "Caderneta criada e equipa atualizada com sucesso.",
      team_passbook_id: newPassbook.id,
    });
  } catch (error) {
    console.error("❌ Erro ao criar caderneta:", error);
    res.status(500).json({ message: "Erro ao criar caderneta." });
  }
};
