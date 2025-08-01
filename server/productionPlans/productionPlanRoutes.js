const express = require('express');
const router = express.Router();
const productionPlanController = require('./productionPlanController');

router.get('/', productionPlanController.getAllProductionPlans);
router.post('/', productionPlanController.createProductionPlan);

module.exports = router;
