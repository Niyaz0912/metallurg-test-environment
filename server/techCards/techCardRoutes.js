const express = require('express');
const router = express.Router();
const techCardController = require('./techCardController');

router.get('/', techCardController.getAllTechCards);
router.post('/', techCardController.createTechCard);

module.exports = router;
