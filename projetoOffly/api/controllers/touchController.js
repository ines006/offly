const { Op } = require("sequelize");
const Touchs = require("../models/touchs");
const Participants = require("../models/participants");

// Registar fly
exports.createTouch = async (req, res) => {
  const { sender_id, receiver_id } = req.body;

  try {
    const existingTouchs = await Touchs.findOne({
      where: {
        sender_id,
        receiver_id,
      },
    });

    if (existingTouchs) {
      if (existingTouchs.active) {
        return res.status(200).json({ message: "Fly já enviado", touchs: existingTouchs });
      } else {
        existingTouchs.active = true;
        existingTouchs.fly_date = new Date(); // Atualiza a data
        await existingTouchs.save();
        return res.status(200).json({ message: "Fly reativado", touchs: existingTouchs });
      }
    }

    const newTouchs = await Touchs.create({
      sender_id,
      receiver_id,
      active: true,
      fly_date: new Date(), 
    });

    return res.status(201).json({ message: "Fly enviado", touchs: newTouchs });
  } catch (error) {
    console.error("Erro ao criar touch:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
};



//Get
exports.getTouchsByReceiver = async (req, res) => {
  const { id } = req.params;

  try {
    const today = new Date().toISOString().split("T")[0];

    const touchs = await Touchs.findAll({
      where: {
        receiver_id: id,
        active: true,
        fly_date: {
          [Op.gte]: new Date(today + "T00:00:00.000Z"),
          [Op.lte]: new Date(today + "T23:59:59.999Z"),
        },
      },
    });

    return res.status(200).json(touchs);
  } catch (error) {
    console.error("Erro ao obter touchs:", error);
    return res.status(500).json({ error: "Erro ao obter touchs" });
  }
};

// PUT /touchs/:id/desativar
exports.deactivateTouch = async (req, res) => {
  const { id } = req.params;

  try {
    const touch = await Touchs.findByPk(id);
    if (!touch) return res.status(404).json({ error: "Touch não encontrado" });

    touch.active = false;
    await touch.save();

    return res.status(200).json({ message: "Touch desativado com sucesso" });
  } catch (error) {
    console.error("Erro ao desativar touch:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
};

