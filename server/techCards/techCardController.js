const { TechCard, TechCardExecution } = require('../models');

const getAllTechCards = async (req, res) => {
  try {
    const techCards = await TechCard.findAll({
      include: [{ model: TechCardExecution, as: 'executions' }]
    });
    res.json(techCards);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении технологических карт' });
  }
};

const createTechCard = async (req, res) => {
  try {
    const {
      productName,
      description,
      drawingUrl,
      specifications,
      productionStages,
    } = req.body;

    const techCard = await TechCard.create({
      productName,
      description,
      drawingUrl,
      specifications,
      productionStages,
    });

    res.status(201).json(techCard);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании технологической карты' });
  }
};

module.exports = {
  getAllTechCards,
  createTechCard,
};
