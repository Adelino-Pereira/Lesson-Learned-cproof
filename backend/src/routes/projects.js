const { Router } = require('express');
const ProjectController = require('../controllers/ProjectController');

const router = Router();

router.get('/', ProjectController.getProjects);
router.get('/:project/documents-used', ProjectController.getDocumentsUsed);
router.get('/:project/items-with-usage', ProjectController.getItemsWithUsage);
router.post('/:project/documents-used', ProjectController.linkDocument);
router.delete('/:project/documents-used/:itemId', ProjectController.unlinkDocument);

module.exports = router;
