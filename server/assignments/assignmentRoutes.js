const express = require('express');
const router = express.Router();
const assignmentController = require('./assignmentController');
const { authenticateToken } = require('../users/authMiddleware');

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

// Excel загрузка
router.post('/upload-excel', 
  authenticateToken,
  assignmentController.uploadExcelMiddleware,
  assignmentController.uploadAssignmentsFromExcel
);

module.exports = router;

