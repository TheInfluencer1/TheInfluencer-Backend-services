const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, requireProfileCompletion } = require('../middleware/auth');
const { 
    validateInfluencerProfile, 
    validatePagination, 
    validateSearch, 
    validateId,
    validateFileUpload 
} = require('../middleware/validation');
const InfluencerController = require('../controllers/influencer.controller');

/**
 * @swagger
 * /api/influencer/profile:
 *   get:
 *     summary: Get influencer profile
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InfluencerProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/profile', authenticateToken, authorizeRoles('influencer'), InfluencerController.getProfile);


/**
 * @swagger
 * /api/influencer/profile:
 *   put:
 *     summary: Update influencer profile
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InfluencerProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.put('/profile', authenticateToken, authorizeRoles('influencer'), validateInfluencerProfile, InfluencerController.updateProfile);

/**
 * @swagger
 * /api/influencer/profile/complete:
 *   post:
 *     summary: Complete influencer profile setup
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *       400:
 *         description: Profile incomplete
 *       401:
 *         description: Unauthorized
 */
router.post('/profile/complete', authenticateToken, authorizeRoles('influencer'), InfluencerController.completeProfile);

/**
 * @swagger
 * /api/influencer/portfolio/upload:
 *   post:
 *     summary: Upload portfolio media
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               media_type:
 *                 type: string
 *                 enum: [portfolio_image, portfolio_video]
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
router.post('/portfolio/upload', authenticateToken, authorizeRoles('influencer'), InfluencerController.uploadPortfolioMedia);

/**
 * @swagger
 * /api/influencer/portfolio:
 *   get:
 *     summary: Get portfolio items
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/portfolio', authenticateToken, authorizeRoles('influencer'), InfluencerController.getPortfolio);

/**
 * @swagger
 * /api/influencer/portfolio/{id}:
 *   delete:
 *     summary: Delete portfolio media
 *     tags: [Influencer]
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
 *         description: Media deleted successfully
 *       404:
 *         description: Media not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/portfolio/:id', authenticateToken, authorizeRoles('influencer'), validateId, InfluencerController.deletePortfolioMedia);

/**
 * @swagger
 * /api/influencer/analytics:
 *   get:
 *     summary: Get influencer analytics
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile_views:
 *                       type: number
 *                     unique_views:
 *                       type: number
 *                     collaboration_requests:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         accepted:
 *                           type: number
 *                         completed:
 *                           type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics', authenticateToken, authorizeRoles('influencer'), InfluencerController.getAnalytics);

/**
 * @swagger
 * /api/influencer/analytics/profile-views:
 *   get:
 *     summary: Get profile views analytics
 *     tags: [Influencer]
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
 *         description: Profile views retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics/profile-views', authenticateToken, authorizeRoles('influencer'), validatePagination, InfluencerController.getProfileViews);

/**
 * @swagger
 * /api/influencer/analytics/engagement:
 *   get:
 *     summary: Get engagement metrics
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics/engagement', authenticateToken, authorizeRoles('influencer'), InfluencerController.getEngagementMetrics);

/**
 * @swagger
 * /api/influencer/requests:
 *   get:
 *     summary: Get collaboration requests
 *     tags: [Influencer]
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
 *         description: Collaboration requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/requests', authenticateToken, authorizeRoles('influencer'), validatePagination, InfluencerController.getCollaborationRequests);

/**
 * @swagger
 * /api/influencer/requests/{id}:
 *   get:
 *     summary: Get specific collaboration request
 *     tags: [Influencer]
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
 *         description: Collaboration request retrieved successfully
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.get('/requests/:id', authenticateToken, authorizeRoles('influencer'), validateId, InfluencerController.getCollaborationRequest);

/**
 * @swagger
 * /api/influencer/requests/{id}/respond:
 *   put:
 *     summary: Respond to collaboration request
 *     tags: [Influencer]
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
 *             properties:
 *               message:
 *                 type: string
 *               counter_offer:
 *                 type: object
 *     responses:
 *       200:
 *         description: Response sent successfully
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.put('/requests/:id/respond', authenticateToken, authorizeRoles('influencer'), validateId, InfluencerController.respondToRequest);

/**
 * @swagger
 * /api/influencer/requests/{id}/accept:
 *   put:
 *     summary: Accept collaboration request
 *     tags: [Influencer]
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
 *         description: Request accepted successfully
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.put('/requests/:id/accept', authenticateToken, authorizeRoles('influencer'), validateId, InfluencerController.acceptRequest);

/**
 * @swagger
 * /api/influencer/requests/{id}/reject:
 *   put:
 *     summary: Reject collaboration request
 *     tags: [Influencer]
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
 *         description: Request rejected successfully
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.put('/requests/:id/reject', authenticateToken, authorizeRoles('influencer'), validateId, InfluencerController.rejectRequest);

/**
 * @swagger
 * /api/influencer/brands/approached:
 *   get:
 *     summary: Get brands that have approached the influencer
 *     tags: [Influencer]
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
 *         description: Approaching brands retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/brands/approached', authenticateToken, authorizeRoles('influencer'), validatePagination, InfluencerController.getApproachingBrands);

/**
 * @swagger
 * /api/influencer/brands/contacted:
 *   get:
 *     summary: Get brands the influencer has contacted
 *     tags: [Influencer]
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
 *         description: Contacted brands retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/brands/contacted', authenticateToken, authorizeRoles('influencer'), validatePagination, InfluencerController.getContactedBrands);

/**
 * @swagger
 * /api/influencer/public/{id}:
 *   get:
 *     summary: Get public influencer profile (for brands to view)
 *     tags: [Influencer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get('/public/:id', InfluencerController.getPublicProfile);

/**
 * @swagger
 * /api/influencer/public/{id}/view:
 *   post:
 *     summary: Record profile view
 *     tags: [Influencer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile view recorded successfully
 */
router.post('/public/:id/view', InfluencerController.recordProfileView);

/**
 * @swagger
 * /api/influencer/search:
 *   get:
 *     summary: Search influencers
 *     tags: [Influencer]
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
 *         name: min_followers
 *         schema:
 *           type: integer
 *         description: Minimum follower count
 *       - in: query
 *         name: max_followers
 *         schema:
 *           type: integer
 *         description: Maximum follower count
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
 *         description: Search results retrieved successfully
 */
router.get('/search', validateSearch, validatePagination, InfluencerController.searchInfluencers);

/**
 * @swagger
 * /api/influencer/categories:
 *   get:
 *     summary: Get content categories
 *     tags: [Influencer]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', InfluencerController.getCategories);

/**
 * @swagger
 * /api/influencer/trending:
 *   get:
 *     summary: Get trending influencers
 *     tags: [Influencer]
 *     responses:
 *       200:
 *         description: Trending influencers retrieved successfully
 */
router.get('/trending', InfluencerController.getTrendingInfluencers);

/**
 * @swagger
 * /api/influencer/settings:
 *   get:
 *     summary: Get influencer settings
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/settings', authenticateToken, authorizeRoles('influencer'), InfluencerController.getSettings);

/**
 * @swagger
 * /api/influencer/settings:
 *   put:
 *     summary: Update influencer settings
 *     tags: [Influencer]
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
 *         description: Settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/settings', authenticateToken, authorizeRoles('influencer'), InfluencerController.updateSettings);

/**
 * @swagger
 * /api/influencer/settings/availability:
 *   put:
 *     summary: Update availability settings
 *     tags: [Influencer]
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
 *         description: Availability updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/settings/availability', authenticateToken, authorizeRoles('influencer'), InfluencerController.updateAvailability);

/**
 * @swagger
 * /api/influencer/settings/pricing:
 *   put:
 *     summary: Update pricing settings
 *     tags: [Influencer]
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
 *         description: Pricing updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/settings/pricing', authenticateToken, authorizeRoles('influencer'), InfluencerController.updatePricing);

/**
 * @swagger
 * /api/influencer/notifications:
 *   get:
 *     summary: Get influencer notifications
 *     tags: [Influencer]
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
 */
router.get('/notifications', authenticateToken, authorizeRoles('influencer'), validatePagination, InfluencerController.getNotifications);

/**
 * @swagger
 * /api/influencer/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Influencer]
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
 */
router.put('/notifications/:id/read', authenticateToken, authorizeRoles('influencer'), validateId, InfluencerController.markNotificationRead);

/**
 * @swagger
 * /api/influencer/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.put('/notifications/read-all', authenticateToken, authorizeRoles('influencer'), InfluencerController.markAllNotificationsRead);

/**
 * @swagger
 * /api/influencer/verify:
 *   post:
 *     summary: Request verification
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification request submitted successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/verify', authenticateToken, authorizeRoles('influencer'), InfluencerController.requestVerification);

/**
 * @swagger
 * /api/influencer/verify/status:
 *   get:
 *     summary: Get verification status
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/verify/status', authenticateToken, authorizeRoles('influencer'), InfluencerController.getVerificationStatus);

/**
 * @swagger
 * /api/influencer/dashboard:
 *   get:
 *     summary: Get influencer dashboard
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authenticateToken, authorizeRoles('influencer'), InfluencerController.getDashboard);

/**
 * @swagger
 * /api/influencer/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard/stats', authenticateToken, authorizeRoles('influencer'), InfluencerController.getDashboardStats);

module.exports = router; 