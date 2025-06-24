exports.discoverWeeklyChallenge = async (req, res) => {
  console.log("✅ discoverWeeklyChallenge foi chamado");
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId é obrigatório" });
    }

    const [participant] = await sequelize.query(
      "SELECT teams_id FROM participants WHERE id = ?",
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!participant) {
      return res.status(404).json({ success: false, message: "Participante não encontrado." });
    }

    const teamId = participant.teams_id;

    const previousChallenges = await sequelize.query(
      `SELECT c.description FROM challenges_has_teams cht
       JOIN challenges c ON cht.challenges_id = c.id
       WHERE cht.teams_id = ?`,
      {
        replacements: [teamId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const descriptionsToAvoid = previousChallenges.map(c => c.description).filter(Boolean);

    const prompt = `
Cria um único desafio semanal breve, objetivo e comprovável com base em uma destas categorias: produtividade, jogos, tempo de ecrã ou social.

Requisitos:
- Deve incentivar o utilizador a reduzir o tempo nessa categoria
- Deve ser comprovável com o upload do screen time
- Não pode repetir nenhuma destas descrições: ${descriptionsToAvoid.join("\n")}

Formato da resposta (obrigatório JSON válido, sem comentários ou texto fora do JSON):
{
  "title": "...",
  "description": "...",
  "category": "produtividade | jogos | tempo de ecrã | social"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "user", content: "Responda apenas com JSON válido, sem explicações." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
    });

    const content = response.choices[0].message.content.trim();

    console.log("🔎 Resposta do GPT:", content);

    let challengeData;

    try {
      challengeData = JSON.parse(content);
    } catch (error) {
      console.error("❌ Erro ao interpretar JSON do GPT:", content);
      return res.status(500).json({ success: false, message: "Erro ao interpretar resposta do GPT." });
    }

    console.log("📦 JSON Interpretado:", challengeData);

    const categoryKey = challengeData.category?.trim().toLowerCase();

    const imageMap = {
      "produtividade": "https://celina05.sirv.com/desafioSemanal/semanal_produtividade.png",
      "jogos": "https://celina05.sirv.com/desafioSemanal/semanal_jogos.png",
      "tempo de ecrã": "https://celina05.sirv.com/desafioSemanal/semanal_tempo.png",
      "social": "https://celina05.sirv.com/desafioSemanal/semanal_social.png"
    };

    const imageUrl = imageMap[categoryKey] || null;

    if (!imageUrl) {
      console.error("❌ Categoria inválida ou imagem não encontrada:", categoryKey);
      return res.status(400).json({ success: false, message: "Categoria inválida ou imagem não encontrada." });
    }

    let challengeId;

    try {
      const [result] = await sequelize.query(
        `INSERT INTO challenges (title, description, img, challenge_types_id, challenge_levels_id)
         VALUES (?, ?, ?, ?, ?)`,
        {
          replacements: [
            challengeData.title,
            challengeData.description,
            imageUrl,
            2, // challenge_types_id
            1  // challenge_levels_id
          ],
          type: sequelize.QueryTypes.INSERT
        }
      );

      challengeId = result;
    } catch (error) {
      console.error("❌ Erro ao inserir desafio:", error);
      return res.status(500).json({ success: false, message: "Erro ao salvar o desafio no banco de dados." });
    }

    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const monday = new Date(now);
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    try {
      await sequelize.query(
        `INSERT INTO challenges_has_teams (challenges_id, teams_id, starting_date, end_date)
         VALUES (?, ?, ?, ?)`,
        {
          replacements: [challengeId, teamId, monday, sunday],
          type: sequelize.QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error("❌ Erro ao associar desafio à equipa:", error);
      return res.status(500).json({ success: false, message: "Erro ao associar desafio à equipa." });
    }

    let participants;

    try {
      participants = await sequelize.query(
        "SELECT id FROM participants WHERE teams_id = ?",
        {
          replacements: [teamId],
          type: sequelize.QueryTypes.SELECT
        }
      );
    } catch (error) {
      console.error("❌ Erro ao buscar participantes da equipa:", error);
      return res.status(500).json({ success: false, message: "Erro ao buscar participantes da equipa." });
    }

    try {
      const insertPromises = participants.map(participant =>
        sequelize.query(
          `INSERT INTO participants_has_challenges 
           (participants_id, challenges_id, starting_date, end_date, completed_date, streak, challenge_levels_id_challenge_levels, challenge_types_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              participant.id,
              challengeId,
              monday,
              sunday,
              null,
              JSON.stringify(["0", "0", "0", "0", "0", "0", "0"]),
              0, 
              2
            ],
            type: sequelize.QueryTypes.INSERT
          }
        )
      );

      await Promise.all(insertPromises);
    } catch (error) {
      console.error("❌ Erro ao associar participantes ao desafio:", error);
      return res.status(500).json({ success: false, message: "Erro ao associar participantes ao desafio." });
    }

    return res.json({ success: true, message: "Desafio semanal gerado e atribuído com sucesso." });

  } catch (err) {
    console.error("❌ Erro inesperado no controller discoverWeeklyChallenge:", err);
    return res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
};
