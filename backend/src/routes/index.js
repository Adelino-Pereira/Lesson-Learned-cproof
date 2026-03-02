const { Router } = require('express');

const knowledgeRoutes = require('./knowledge');
const masterRoutes = require('./masters');
const projectRoutes = require('./projects');

const router = Router();

router.use('/knowledge', knowledgeRoutes);
router.use('/master', masterRoutes);
router.use('/projects', projectRoutes);

module.exports = router;
