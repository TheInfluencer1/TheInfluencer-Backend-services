const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { 
    validatePagination, 
    validateSearch, 
    validateId,
    validateUserUpdate,
    validateStatusUpdate
} = require('../middleware/validation');
const AdminController = require('../controllers/admin.controller');

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: user_type
 *         schema:
 *           type: string
 *           enum: [influencer, brand, admin]
 *         description: Filter by user type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', authenticateToken, authorizeRoles('admin'), validateSearch, validatePagination, AdminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users/:id', authenticateToken, authorizeRoles('admin'), validateId, AdminController.getUserDetails);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/users/:id/status', authenticateToken, authorizeRoles('admin'), validateId, validateStatusUpdate, AdminController.updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}/verify:
 *   put:
 *     summary: Verify user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User verified successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/users/:id/verify', authenticateToken, authorizeRoles('admin'), validateId, AdminController.verifyUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete('/users/:id', authenticateToken, authorizeRoles('admin'), validateId, AdminController.deleteUser);

/**
 * @swagger
 * /api/admin/influencers:
 *   get:
 *     summary: Get all influencers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Content category filter
 *       - in: query
 *         name: verified
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Verification status filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Influencers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/influencers', authenticateToken, authorizeRoles('admin'), validateSearch, validatePagination, AdminController.getAllInfluencers);

/**
 * @swagger
 * /api/admin/influencers/{id}:
 *   get:
 *     summary: Get influencer details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Influencer details retrieved successfully
 *       404:
 *         description: Influencer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/influencers/:id', authenticateToken, authorizeRoles('admin'), validateId, AdminController.getInfluencerDetails);

/**
 * @swagger
 * /api/admin/influencers/{id}/feature:
 *   put:
 *     summary: Feature influencer
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Influencer featured successfully
 *       404:
 *         description: Influencer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/influencers/:id/feature', authenticateToken, authorizeRoles('admin'), validateId, AdminController.featureInfluencer);

/**
 * @swagger
 * /api/admin/influencers/{id}/verify:
 *   put:
 *     summary: Verify influencer
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Influencer verified successfully
 *       404:
 *         description: Influencer not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/influencers/:id/verify', authenticateToken, authorizeRoles('admin'), validateId, AdminController.verifyInfluencer);

/**
 * @swagger
 * /api/admin/influencers/pending-verification:
 *   get:
 *     summary: Get pending influencer verifications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Pending verifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/influencers/pending-verification', authenticateToken, authorizeRoles('admin'), validatePagination, AdminController.getPendingVerifications);

/**
 * @swagger
 * /api/admin/brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Industry filter
 *       - in: query
 *         name: verified
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Verification status filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/brands', authenticateToken, authorizeRoles('admin'), validateSearch, validatePagination, AdminController.getAllBrands);

/**
 * @swagger
 * /api/admin/brands/{id}:
 *   get:
 *     summary: Get brand details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand details retrieved successfully
 *       404:
 *         description: Brand not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/brands/:id', authenticateToken, authorizeRoles('admin'), validateId, AdminController.getBrandDetails);

/**
 * @swagger
 * /api/admin/brands/{id}/verify:
 *   put:
 *     summary: Verify brand
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand verified successfully
 *       404:
 *         description: Brand not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/brands/:id/verify', authenticateToken, authorizeRoles('admin'), validateId, AdminController.verifyBrand);

/**
 * @swagger
 * /api/admin/brands/pending-verification:
 *   get:
 *     summary: Get pending brand verifications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Pending verifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/brands/pending-verification', authenticateToken, authorizeRoles('admin'), validatePagination, AdminController.getPendingBrandVerifications);

/**
 * @swagger
 * /api/admin/collaborations:
 *   get:
 *     summary: Get all collaborations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, expired, completed]
 *         description: Status filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Collaborations retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/collaborations', authenticateToken, authorizeRoles('admin'), validatePagination, AdminController.getAllCollaborations);

/**
 * @swagger
 * /api/admin/collaborations/{id}:
 *   get:
 *     summary: Get collaboration details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaboration details retrieved successfully
 *       404:
 *         description: Collaboration not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/collaborations/:id', authenticateToken, authorizeRoles('admin'), validateId, AdminController.getCollaborationDetails);

/**
 * @swagger
 * /api/admin/collaborations/{id}/status:
 *   put:
 *     summary: Update collaboration status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, expired, completed]
 *     responses:
 *       200:
 *         description: Collaboration status updated successfully
 *       404:
 *         description: Collaboration not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/collaborations/:id/status', authenticateToken, authorizeRoles('admin'), validateId, validateStatusUpdate, AdminController.updateCollaborationStatus);

/**
 * @swagger
 * /api/admin/collaborations/{id}:
 *   delete:
 *     summary: Delete collaboration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collaboration deleted successfully
 *       404:
 *         description: Collaboration not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete('/collaborations/:id', authenticateToken, authorizeRoles('admin'), validateId, AdminController.deleteCollaboration);

/**
 * @swagger
 * /api/admin/analytics/overview:
 *   get:
 *     summary: Get overview analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/overview', authenticateToken, authorizeRoles('admin'), AdminController.getOverviewAnalytics);

/**
 * @swagger
 * /api/admin/analytics/users:
 *   get:
 *     summary: Get user analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/users', authenticateToken, authorizeRoles('admin'), AdminController.getUserAnalytics);

/**
 * @swagger
 * /api/admin/analytics/collaborations:
 *   get:
 *     summary: Get collaboration analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collaboration analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/collaborations', authenticateToken, authorizeRoles('admin'), AdminController.getCollaborationAnalytics);

/**
 * @swagger
 * /api/admin/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/revenue', authenticateToken, authorizeRoles('admin'), AdminController.getRevenueAnalytics);

/**
 * @swagger
 * /api/admin/analytics/engagement:
 *   get:
 *     summary: Get engagement analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/engagement', authenticateToken, authorizeRoles('admin'), AdminController.getEngagementAnalytics);

/**
 * @swagger
 * /api/admin/analytics/platform-stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/platform-stats', authenticateToken, authorizeRoles('admin'), AdminController.getPlatformStats);

/**
 * @swagger
 * /api/admin/analytics/onboarding:
 *   get:
 *     summary: Get onboarding statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/onboarding', authenticateToken, authorizeRoles('admin'), AdminController.getOnboardingStats);

/**
 * @swagger
 * /api/admin/analytics/retention:
 *   get:
 *     summary: Get retention statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retention statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/retention', authenticateToken, authorizeRoles('admin'), AdminController.getRetentionStats);

/**
 * @swagger
 * /api/admin/analytics/growth:
 *   get:
 *     summary: Get growth statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Growth statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics/growth', authenticateToken, authorizeRoles('admin'), AdminController.getGrowthStats);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), AdminController.getDashboardStats);

/**
 * @swagger
 * /api/admin/content/moderation:
 *   get:
 *     summary: Get content for moderation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Content for moderation retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/content/moderation', authenticateToken, authorizeRoles('admin'), validatePagination, AdminController.getContentForModeration);

/**
 * @swagger
 * /api/admin/content/{id}/approve:
 *   put:
 *     summary: Approve content
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content approved successfully
 *       404:
 *         description: Content not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/content/:id/approve', authenticateToken, authorizeRoles('admin'), validateId, AdminController.approveContent);

/**
 * @swagger
 * /api/admin/content/{id}/reject:
 *   put:
 *     summary: Reject content
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Content rejected successfully
 *       404:
 *         description: Content not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/content/:id/reject', authenticateToken, authorizeRoles('admin'), validateId, AdminController.rejectContent);

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/settings', authenticateToken, authorizeRoles('admin'), AdminController.getSystemSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: System settings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/settings', authenticateToken, authorizeRoles('admin'), AdminController.updateSystemSettings);

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: Get admin notifications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/notifications', authenticateToken, authorizeRoles('admin'), validatePagination, AdminController.getNotifications);

/**
 * @swagger
 * /api/admin/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/notifications/:id/read', authenticateToken, authorizeRoles('admin'), validateId, AdminController.markNotificationRead);

/**
 * @swagger
 * /api/admin/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/notifications/read-all', authenticateToken, authorizeRoles('admin'), AdminController.markAllNotificationsRead);

/**
 * @swagger
 * /api/admin/backup:
 *   post:
 *     summary: Create system backup
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/backup', authenticateToken, authorizeRoles('admin'), AdminController.createBackup);

/**
 * @swagger
 * /api/admin/backup:
 *   get:
 *     summary: Get backup list
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/backup', authenticateToken, authorizeRoles('admin'), AdminController.getBackupList);

/**
 * @swagger
 * /api/admin/backup/{id}/download:
 *   get:
 *     summary: Download backup
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Backup downloaded successfully
 *       404:
 *         description: Backup not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/backup/:id/download', authenticateToken, authorizeRoles('admin'), validateId, AdminController.downloadBackup);

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Get system logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: Log level filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: System logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/logs', authenticateToken, authorizeRoles('admin'), validatePagination, AdminController.getSystemLogs);

/**
 * @swagger
 * /api/admin/logs/clear:
 *   delete:
 *     summary: Clear system logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System logs cleared successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete('/logs/clear', authenticateToken, authorizeRoles('admin'), AdminController.clearSystemLogs);

module.exports = router; 