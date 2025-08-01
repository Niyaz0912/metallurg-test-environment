const express = require('express');
const router = express.Router();

const assignmentController = require('./assignmentController');
const { authMiddleware } = require('../users/authMiddleware');

router.use(authMiddleware);

router.get('/', assignmentController.getAssignments);
router.post('/', assignmentController.createAssignment);
router.get('/:id', assignmentController.getAssignmentById);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;
