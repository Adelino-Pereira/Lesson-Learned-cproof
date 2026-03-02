const { Router } = require('express');
const ProjectController = require('../controllers/ProjectController');

const router = Router();

router.get('/', ProjectController.getProjects);
router.get('/:project/documents-used', ProjectController.getDocumentsUsed);

module.exports = router;
