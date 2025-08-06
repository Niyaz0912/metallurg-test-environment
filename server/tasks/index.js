// server/tasks/index.js
const express = require('express');
const router = express.Router();

// Базовые маршруты для tasks
router.get('/', (req, res) => {
  res.json({ 
    message: 'Tasks API',
    status: 'available',
    version: '1.0.0'
  });
});

router.post('/', (req, res) => {
  res.status(501).json({ 
    message: 'Tasks creation - в разработке',
    status: 'not implemented'
  });
});

router.get('/:id', (req, res) => {
  res.json({ 
    message: `Task ID: ${req.params.id}`,
    status: 'not implemented'
  });
});

module.exports = router;

