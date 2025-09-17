const express = require('express');
const router = express.Router();
const assignmentController = require('./assignmentController');
const { authenticateToken } = require('../users/authMiddleware');

// Тестовый роут для диагностики
router.post('/test', (req, res) => {
  console.log('✅ POST /api/assignments/test работает!');
  res.json({ 
    message: 'Тест успешен',
    body: req.body,
    timestamp: new Date()
  });
});

// Базовые CRUD операции
router.get('/', authenticateToken, assignmentController.getAssignments);
router.post('/', authenticateToken, assignmentController.createAssignment);
router.get('/statistics', authenticateToken, assignmentController.getAssignmentStatistics);

// ✅ ИСПРАВЛЕНИЕ: Специфичные роуты ПЕРЕД параметризованными
router.delete('/delete-all-active', authenticateToken, assignmentController.deleteAllActiveAssignments);

// Параметризованные роуты в конце
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);
router.put('/:id', authenticateToken, assignmentController.updateAssignment);
router.delete('/:id', authenticateToken, assignmentController.deleteAssignment);
// Получить уникальные детали и заказчиков для формы
router.get('/form-data', authenticateToken, assignmentController.getFormData);

// Excel загрузка
router.post('/upload-excel', 
  authenticateToken,
  assignmentController.uploadExcelMiddleware,
  assignmentController.uploadAssignmentsFromExcel
);

module.exports = router;

