const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const techCardController = require('./techCardController');
const { authenticateToken } = require('../users/authMiddleware');

// Настройка хранилища Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // сохраняем с уникальным именем
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `drawing-${unique}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB максимум
  },
  fileFilter: (req, file, cb) => {
    // Разрешаем только изображения и PDF
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения (JPG, PNG, GIF) и PDF файлы'));
    }
  }
});

// Базовые CRUD операции
router.get('/', authenticateToken, techCardController.getAllTechCards);
router.post('/', authenticateToken, techCardController.createTechCard);
router.get('/:id', authenticateToken, techCardController.getTechCardById);
router.put('/:id', authenticateToken, techCardController.updateTechCard);
router.delete('/:id', authenticateToken, techCardController.deleteTechCard);

// Операции с выполнениями этапов
router.post('/:id/executions', authenticateToken, techCardController.addExecution);

// Загрузка чертежа
router.post('/:id/upload-drawing', authenticateToken, upload.single('drawing'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    // Сохраняем URL в модели
    const fileUrl = `/uploads/${req.file.filename}`;
    const updated = await techCardController.updateDrawingUrl(id, fileUrl);
    
    res.json({ 
      drawingUrl: fileUrl,
      message: 'Чертеж успешно загружен',
      techCard: updated
    });
  } catch (error) {
    console.error('Error uploading drawing:', error);
    res.status(500).json({ error: 'Ошибка при загрузке чертежа' });
  }
});

module.exports = router;

