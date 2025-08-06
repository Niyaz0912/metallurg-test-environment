// server/productionPlans/productionPlanRoutes.js
const express = require('express');
const router = express.Router();
const productionPlanController = require('./productionPlanController');
const { authMiddleware, roleMiddleware } = require('../users/authMiddleware');

// Получить все планы
router.get('/', authMiddleware, productionPlanController.getAllProductionPlans);

// Получить план по ID
router.get('/:id', authMiddleware, productionPlanController.getProductionPlanById);

// Создать новый план (только админы и мастера)
router.post('/', 
  authMiddleware, 
  roleMiddleware(['admin', 'master']), 
  productionPlanController.createProductionPlan
);

// Обновить план (только админы и мастера)
router.put('/:id', 
  authMiddleware, 
  roleMiddleware(['admin', 'master']), 
  productionPlanController.updateProductionPlan
);

// Удалить план (только админы)
router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  productionPlanController.deleteProductionPlan
);

module.exports = router;

