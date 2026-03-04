const { Router } = require('express');
const ProjectController = require('../controllers/ProjectController');

const router = Router();

router.get('/', ProjectController.getProjects);
router.get('/customers', ProjectController.getCustomers);
router.get('/vehicles', ProjectController.getVehicles);
router.get('/:projectId/documents-used', ProjectController.getDocumentsUsed);
router.get('/:projectId/items-with-usage', ProjectController.getItemsWithUsage);
router.post('/:projectId/documents-used', ProjectController.linkDocument);
router.delete('/:projectId/documents-used/:itemId', ProjectController.unlinkDocument);

module.exports = router;
