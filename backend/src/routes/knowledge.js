const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const KnowledgeController = require('../controllers/KnowledgeController');

const router = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

// GET /api/knowledge/stats must come before /api/knowledge/:id
router.get('/stats', KnowledgeController.stats);
router.get('/', KnowledgeController.list);
router.get('/:id', KnowledgeController.getById);
router.post(
  '/',
  upload.fields([
    { name: 'documents', maxCount: 10 },
    { name: 'images', maxCount: 10 },
  ]),
  KnowledgeController.create
);

router.put('/:id', KnowledgeController.update);
router.delete('/:id', KnowledgeController.delete);
router.patch('/:id/status', KnowledgeController.updateStatus);

module.exports = router;
