const { Router } = require('express');
const MasterController = require('../controllers/MasterController');

const router = Router();

router.get('/types', MasterController.getTypes);
router.get('/processes', MasterController.getProcesses);

module.exports = router;
