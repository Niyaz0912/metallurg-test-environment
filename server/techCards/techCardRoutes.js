const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const techCardController = require('./techCardController');
const { authenticateToken } = require('../users/authMiddleware');

// Настройка хранилища Multer для PDF файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // сохраняем с уникальным именем
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `techcard-${unique}${ext}`); // ✅ Переименовано с drawing на techcard
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

// ========== ОСНОВНЫЕ CRUD ОПЕРАЦИИ ==========

// GET /api/techcards - список всех техкарт (с автоматическим логированием при просмотре отдельной)
router.get('/', authenticateToken, techCardController.getAllTechCards);

// POST /api/techcards - создание новой техкарты (упрощенное: 5 полей)
router.post('/', authenticateToken, techCardController.createTechCard);

// GET /api/techcards/:id - просмотр конкретной техкарты (с автоматическим логированием)
router.get('/:id', authenticateToken, techCardController.getTechCardById);

// PUT /api/techcards/:id - обновление техкарты (упрощенное)
router.put('/:id', authenticateToken, techCardController.updateTechCard);

// DELETE /api/techcards/:id - удаление техкарты
router.delete('/:id', authenticateToken, techCardController.deleteTechCard);

// ========== ОПЕРАЦИИ С ВЫПОЛНЕНИЯМИ ==========

// POST /api/techcards/:id/executions - фиксация работы оператора (упрощенное: количество + установка)
router.post('/:id/executions', authenticateToken, techCardController.addExecution);

// ========== ЗАГРУЗКА PDF ФАЙЛОВ ==========

// POST /api/techcards/:id/upload-pdf - загрузка PDF файла с техкартой и чертежом
router.post('/:id/upload-pdf', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'PDF файл не загружен' });
    }

    // ✅ ИСПРАВЛЕНО: Вызываем правильную функцию
    const fileUrl = `/uploads/${req.file.filename}`;
    const updated = await techCardController.updatePdfUrl(id, fileUrl);
    
    res.json({ 
      pdfUrl: fileUrl, // ✅ Переименовано с drawingUrl
      message: 'PDF файл успешно загружен',
      techCard: updated
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Ошибка при загрузке PDF файла' });
  }
});

// ========== ИСТОРИЯ И АНАЛИТИКА ==========

// GET /api/techcards/:id/accesses - история доступов к техкарте (кто и когда открывал)
router.get('/:id/accesses', authenticateToken, techCardController.getTechCardAccesses);

// ========== LEGACY SUPPORT (для совместимости) ==========

// POST /api/techcards/:id/upload-drawing - старый роут для обратной совместимости
router.post('/:id/upload-drawing', authenticateToken, upload.single('drawing'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const updated = await techCardController.updatePdfUrl(id, fileUrl);
    
    res.json({ 
      drawingUrl: fileUrl, // Возвращаем в старом формате для совместимости
      pdfUrl: fileUrl,     // И в новом формате
      message: 'Файл успешно загружен',
      techCard: updated
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Ошибка при загрузке файла' });
  }
});

module.exports = router;
