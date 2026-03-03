// ============================================================================
// OREPA Backend - Admin Newsletter Controller
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../../middleware/errorHandler');
const { logAction } = require('../../middleware/auditLog');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Upload directories
const UPLOAD_DIR = path.join(__dirname, '../../uploads/newsletters');
const COVERS_DIR = path.join(UPLOAD_DIR, 'covers');

// Ensure upload directories exist
[UPLOAD_DIR, COVERS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ============================================================================
// GET ALL NEWSLETTERS (Admin)
// ============================================================================

exports.getAllNewsletters = asyncHandler(async (req, res) => {
    const { search, isPublished, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (isPublished !== undefined) {
        where.isPublished = isPublished === 'true';
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { date: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [newsletters, total] = await Promise.all([
        prisma.newsletter.findMany({
            where,
            orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: parseInt(limit),
            include: {
                createdBy: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        }),
        prisma.newsletter.count({ where }),
    ]);

    res.status(200).json({
        success: true,
        data: {
            newsletters,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalNewsletters: total,
                limit: parseInt(limit),
            },
        },
    });
});

// ============================================================================
// GET NEWSLETTER BY ID (Admin)
// ============================================================================

exports.getNewsletterById = asyncHandler(async (req, res) => {
    const newsletter = await prisma.newsletter.findUnique({
        where: { id: req.params.id },
        include: {
            createdBy: {
                select: { id: true, firstName: true, lastName: true, email: true }
            }
        }
    });

    if (!newsletter) {
        return res.status(404).json({ success: false, message: 'Newsletter not found' });
    }

    res.status(200).json({ success: true, newsletter });
});

// ============================================================================
// CREATE NEWSLETTER
// ============================================================================

exports.createNewsletter = asyncHandler(async (req, res) => {
    const { title, date, description, isPublished, sortOrder } = req.body;

    if (!title || !date) {
        return res.status(400).json({
            success: false,
            message: 'Title and date are required',
        });
    }

    // Handle uploaded files
    let pdfUrl = '';
    let coverImage = null;

    if (req.files?.pdf?.[0]) {
        pdfUrl = `/uploads/newsletters/${req.files.pdf[0].filename}`;
    } else {
        return res.status(400).json({
            success: false,
            message: 'PDF file is required',
        });
    }

    if (req.files?.cover?.[0]) {
        coverImage = `/uploads/newsletters/covers/${req.files.cover[0].filename}`;
    }

    // Get max sortOrder for auto-incrementing
    const maxSort = await prisma.newsletter.aggregate({ _max: { sortOrder: true } });
    const nextSortOrder = sortOrder !== undefined
        ? parseInt(sortOrder)
        : (maxSort._max.sortOrder || 0) + 1;

    const newsletter = await prisma.newsletter.create({
        data: {
            title,
            date,
            pdfUrl,
            coverImage,
            description: description || null,
            isPublished: isPublished !== undefined ? isPublished === 'true' : true,
            sortOrder: nextSortOrder,
            createdById: req.user?.id || null,
        },
    });

    await logAction({
        admin: req.user,
        action: 'CREATE_NEWSLETTER',
        resourceType: 'Newsletter',
        resourceId: newsletter.id,
        description: `Created newsletter: ${title}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        afterState: { title, date, pdfUrl, coverImage },
    });

    res.status(201).json({
        success: true,
        message: 'Newsletter created successfully',
        newsletter,
    });
});

// ============================================================================
// UPDATE NEWSLETTER
// ============================================================================

exports.updateNewsletter = asyncHandler(async (req, res) => {
    const existing = await prisma.newsletter.findUnique({
        where: { id: req.params.id },
    });

    if (!existing) {
        return res.status(404).json({ success: false, message: 'Newsletter not found' });
    }

    const { title, date, description, isPublished, sortOrder } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (date !== undefined) updateData.date = date;
    if (description !== undefined) updateData.description = description;
    if (isPublished !== undefined) updateData.isPublished = isPublished === 'true' || isPublished === true;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);

    // Handle file replacements
    if (req.files?.pdf?.[0]) {
        // Delete old PDF if it's in uploads directory
        if (existing.pdfUrl?.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, '../..', existing.pdfUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.pdfUrl = `/uploads/newsletters/${req.files.pdf[0].filename}`;
    }

    if (req.files?.cover?.[0]) {
        // Delete old cover if it's in uploads directory
        if (existing.coverImage?.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, '../..', existing.coverImage);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.coverImage = `/uploads/newsletters/covers/${req.files.cover[0].filename}`;
    }

    const newsletter = await prisma.newsletter.update({
        where: { id: req.params.id },
        data: updateData,
    });

    await logAction({
        admin: req.user,
        action: 'UPDATE_NEWSLETTER',
        resourceType: 'Newsletter',
        resourceId: newsletter.id,
        description: `Updated newsletter: ${newsletter.title}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        beforeState: { title: existing.title, date: existing.date },
        afterState: updateData,
    });

    res.status(200).json({
        success: true,
        message: 'Newsletter updated successfully',
        newsletter,
    });
});

// ============================================================================
// DELETE NEWSLETTER
// ============================================================================

exports.deleteNewsletter = asyncHandler(async (req, res) => {
    const newsletter = await prisma.newsletter.findUnique({
        where: { id: req.params.id },
    });

    if (!newsletter) {
        return res.status(404).json({ success: false, message: 'Newsletter not found' });
    }

    // Delete associated files from uploads directory
    if (newsletter.pdfUrl?.startsWith('/uploads/')) {
        const pdfPath = path.join(__dirname, '../..', newsletter.pdfUrl);
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }
    if (newsletter.coverImage?.startsWith('/uploads/')) {
        const coverPath = path.join(__dirname, '../..', newsletter.coverImage);
        if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }

    await prisma.newsletter.delete({ where: { id: req.params.id } });

    await logAction({
        admin: req.user,
        action: 'DELETE_NEWSLETTER',
        resourceType: 'Newsletter',
        resourceId: newsletter.id,
        description: `Deleted newsletter: ${newsletter.title}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        beforeState: { title: newsletter.title, date: newsletter.date },
    });

    res.status(200).json({
        success: true,
        message: 'Newsletter deleted successfully',
    });
});

// ============================================================================
// TOGGLE PUBLISH
// ============================================================================

exports.togglePublish = asyncHandler(async (req, res) => {
    const newsletter = await prisma.newsletter.findUnique({
        where: { id: req.params.id },
    });

    if (!newsletter) {
        return res.status(404).json({ success: false, message: 'Newsletter not found' });
    }

    const updated = await prisma.newsletter.update({
        where: { id: req.params.id },
        data: { isPublished: !newsletter.isPublished },
    });

    res.status(200).json({
        success: true,
        message: `Newsletter ${updated.isPublished ? 'published' : 'unpublished'} successfully`,
        newsletter: updated,
    });
});

// ============================================================================
// GET PUBLIC NEWSLETTERS (no auth)
// ============================================================================

exports.getPublicNewsletters = asyncHandler(async (req, res) => {
    const newsletters = await prisma.newsletter.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
        select: {
            id: true,
            title: true,
            date: true,
            pdfUrl: true,
            coverImage: true,
            description: true,
        },
    });

    res.status(200).json({ success: true, newsletters });
});
