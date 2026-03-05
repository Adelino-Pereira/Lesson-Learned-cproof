/**
 * routes/knowledge.js — Knowledge item routes.
 * Configures Multer for file uploads (documents + images) and maps
 * HTTP methods to KnowledgeController actions.
 */

const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const KnowledgeController = require('../controllers/KnowledgeController');

const router = Router();

// --- Multer configuration for file uploads ---
// Files are stored in backend/uploads/ with a unique timestamp-based filename
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

// IMPORTANT: /stats must be defined before /:id to avoid "stats" being parsed as an ID
router.get('/stats', KnowledgeController.stats);
router.get('/', KnowledgeController.list);
router.get('/:id', KnowledgeController.getById);

// POST accepts multipart form data with up to 10 documents and 10 images
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
router.patch('/:id/status', KnowledgeController.updateStatus);  // Approve/reject workflow

module.exports = router;
