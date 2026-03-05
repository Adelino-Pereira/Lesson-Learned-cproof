/**
 * routes/masters.js — Master/reference data routes.
 * Provides read-only endpoints for types and processes used in dropdowns.
 */

const { Router } = require('express');
const MasterController = require('../controllers/MasterController');

const router = Router();

router.get('/types', MasterController.getTypes);       // GET /api/master/types
router.get('/processes', MasterController.getProcesses); // GET /api/master/processes

module.exports = router;
