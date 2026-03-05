/**
 * routes/projects.js — Project and "Documents Used" routes.
 * Provides project listing/search, customer/vehicle lookups,
 * and link/unlink operations for the documents-used feature.
 */

const { Router } = require('express');
const ProjectController = require('../controllers/ProjectController');

const router = Router();

// Project listing and lookups
router.get('/', ProjectController.getProjects);           // GET /api/projects
router.get('/customers', ProjectController.getCustomers);  // GET /api/projects/customers
router.get('/vehicles', ProjectController.getVehicles);    // GET /api/projects/vehicles

// Documents used by a specific project
router.get('/:projectId/documents-used', ProjectController.getDocumentsUsed);      // Linked items
router.get('/:projectId/items-with-usage', ProjectController.getItemsWithUsage);   // All items with usage flag
router.post('/:projectId/documents-used', ProjectController.linkDocument);          // Link item to project
router.delete('/:projectId/documents-used/:itemId', ProjectController.unlinkDocument); // Unlink item

module.exports = router;
