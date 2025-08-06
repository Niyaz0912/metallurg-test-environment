// server/techCards/index.js
const express = require('express');
const router = express.Router();

// Базовые маршруты для techCards
router.get('/', (req, res) => {
  res.json({ 
    message: 'TechCards API',
    status: 'available',
    version: '1.0.0'
  });
});

router.post('/', (req, res) => {
  res.status(501).json({ 
    message: 'TechCard creation - в разработке',
    status: 'not implemented'
  });
});

router.get('/:id', (req, res) => {
  res.json({ 
    message: `TechCard ID: ${req.params.id}`,
    status: 'not implemented'
  });
});

module.exports = router;
