const express = require('express');
const router = express.Router();
const assignmentController = require('./assignmentController');
const { authenticateToken } = require('../users/authMiddleware');

console.log('🔍 Checking assignment controller middleware...');
console.log('uploadExcelMiddleware type:', typeof assignmentController.uploadExcelMiddleware);

// Базовые CRUD операции
router.get('/', authenticateToken, assignmentController.getAssignments);
router.post('/', authenticateToken, assignmentController.createAssignment);
router.get('/statistics', authenticateToken, assignmentController.getAssignmentStatistics);
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);
router.put('/:id', authenticateToken, assignmentController.updateAssignment);
router.delete('/:id', authenticateToken, assignmentController.deleteAssignment);

// Excel загрузка
if (assignmentController.uploadExcelMiddleware && 
    typeof assignmentController.uploadExcelMiddleware === 'function') {
  router.post('/upload-excel', 
    authenticateToken,
    assignmentController.uploadExcelMiddleware,
    assignmentController.uploadAssignmentsFromExcel
  );
  console.log('✅ Excel upload route registered');
} else {
  router.post('/upload-excel', authenticateToken, (req, res) => {
    res.status(501).json({ 
      message: 'Excel загрузка временно недоступна',
      error: 'Middleware не инициализирован'
    });
  });
  console.log('⚠️ Excel upload route disabled');
}

module.exports = router;
