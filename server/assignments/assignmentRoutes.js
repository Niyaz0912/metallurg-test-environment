const express = require('express');
const router = express.Router();
const assignmentController = require('./assignmentController');

router.get('/', assignmentController.getAllAssignments);
router.post('/', assignmentController.createAssignment);

module.exports = router;
