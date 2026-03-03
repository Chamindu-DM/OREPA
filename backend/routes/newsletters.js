// ============================================================================
// OREPA Backend - Public Newsletter Routes
// ============================================================================

const express = require('express');
const router = express.Router();

const { getPublicNewsletters } = require('../controllers/admin/newsletterController');

// GET /api/newsletters — Public list of published newsletters (no auth)
router.get('/', getPublicNewsletters);

module.exports = router;
