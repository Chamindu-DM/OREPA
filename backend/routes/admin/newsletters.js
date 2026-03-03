// ============================================================================
// OREPA Backend - Admin Newsletter Routes
// ============================================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Controllers
const {
    getAllNewsletters,
    getNewsletterById,
    createNewsletter,
    updateNewsletter,
    deleteNewsletter,
    togglePublish,
} = require('../../controllers/admin/newsletterController');

// Middleware
const { authenticate } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/authorize');
const { logAdminAction } = require('../../middleware/auditLog');

// ============================================================================
// MULTER CONFIGURATION
// ============================================================================

const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = file.fieldname === 'cover'
            ? path.join(__dirname, '../../uploads/newsletters/covers')
            : path.join(__dirname, '../../uploads/newsletters');

        // Ensure directory exists
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename: replace spaces with hyphens, add timestamp for uniqueness
        const timestamp = Date.now();
        const sanitized = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
        cb(null, `${timestamp}-${sanitized}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'pdf') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    } else if (file.fieldname === 'cover') {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed for covers'), false);
        }
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: pdfStorage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max for PDFs
    },
});

const uploadFields = upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
]);

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/admin/newsletters — List all newsletters
router.get('/', authenticate, requireAdmin, getAllNewsletters);

// GET /api/admin/newsletters/:id — Single newsletter
router.get('/:id', authenticate, requireAdmin, getNewsletterById);

// POST /api/admin/newsletters — Create newsletter (with file upload)
router.post('/', authenticate, requireAdmin, uploadFields, createNewsletter);

// PUT /api/admin/newsletters/:id — Update newsletter (with optional file upload)
router.put('/:id', authenticate, requireAdmin, uploadFields, updateNewsletter);

// PATCH /api/admin/newsletters/:id/toggle-publish — Toggle publish/unpublish
router.patch('/:id/toggle-publish', authenticate, requireAdmin, togglePublish);

// DELETE /api/admin/newsletters/:id — Delete newsletter
router.delete('/:id', authenticate, requireAdmin, deleteNewsletter);

module.exports = router;
