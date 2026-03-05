/**
 * routes/index.js — Route aggregator.
 * Mounts all sub-routers under the /api prefix (set in index.js).
 *   /api/knowledge  → Knowledge item CRUD + stats
 *   /api/master     → Master data (types, processes)
 *   /api/projects   → Projects + documents-used
 */

const { Router } = require('express');

const knowledgeRoutes = require('./knowledge');
const masterRoutes = require('./masters');
const projectRoutes = require('./projects');

const router = Router();

router.use('/knowledge', knowledgeRoutes);
router.use('/master', masterRoutes);
router.use('/projects', projectRoutes);

module.exports = router;
