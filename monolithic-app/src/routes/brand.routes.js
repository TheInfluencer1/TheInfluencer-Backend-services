const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, requireProfileCompletion } = require('../middleware/auth');
const { 
    validateBrandProfile, 
    validateCollaborationRequest,
    validatePagination, 
    validateSearch, 
    validateId,
    validateResponse 
} = require('../middleware/validation');
const BrandController = require('../controllers/brand.controller');

/**
 * @swagger
 * /api/brand/profile:
 *   get:
 *     summary: Get brand profile
 *     tags: [Brand]
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
 *                   $ref: '#/components/schemas/BrandProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get('/profile', authenticateToken, authorizeRoles('brand'), BrandController.getProfile);

/**
 * @swagger
 * /api/brand/profile:
 *   put:
 *     summary: Update brand profile
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BrandProfile'
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
router.put('/profile', authenticateToken, authorizeRoles('brand'), validateBrandProfile, BrandController.updateProfile);

/**
 * @swagger
 * /api/brand/profile/complete:
 *   post:
 *     summary: Complete brand profile setup
 *     tags: [Brand]
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
router.post('/profile/complete', authenticateToken, authorizeRoles('brand'), BrandController.completeProfile);

/**
 * @swagger
 * /api/brand/assets/upload:
 *   post:
 *     summary: Upload company asset
 *     tags: [Brand]
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
 *                 enum: [company_logo, company_image]
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
router.post('/assets/upload', authenticateToken, authorizeRoles('brand'), BrandController.uploadCompanyAsset);

/**
 * @swagger
 * /api/brand/assets:
 *   get:
 *     summary: Get company assets
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assets retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/assets', authenticateToken, authorizeRoles('brand'), BrandController.getCompanyAssets);

/**
 * @swagger
 * /api/brand/assets/{id}:
 *   delete:
 *     summary: Delete company asset
 *     tags: [Brand]
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
 *         description: Asset deleted successfully
 *       404:
 *         description: Asset not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/assets/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.deleteCompanyAsset);

/**
 * @swagger
 * /api/brand/explore:
 *   get:
 *     summary: Explore available influencers
 *     tags: [Brand]
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
 *         name: budget_min
 *         schema:
 *           type: integer
 *         description: Minimum budget
 *       - in: query
 *         name: budget_max
 *         schema:
 *           type: integer
 *         description: Maximum budget
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
 */
router.get('/explore', authenticateToken, authorizeRoles('brand'), validateSearch, validatePagination, BrandController.exploreInfluencers);

/**
 * @swagger
 * /api/brand/explore/{id}:
 *   get:
 *     summary: Get influencer details
 *     tags: [Brand]
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
 */
router.get('/explore/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.getInfluencerDetails);

/**
 * @swagger
 * /api/brand/explore/categories:
 *   get:
 *     summary: Get influencer categories
 *     tags: [Brand]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/explore/categories', BrandController.getInfluencerCategories);

/**
 * @swagger
 * /api/brand/explore/trending:
 *   get:
 *     summary: Get trending influencers
 *     tags: [Brand]
 *     responses:
 *       200:
 *         description: Trending influencers retrieved successfully
 */
router.get('/explore/trending', BrandController.getTrendingInfluencers);

/**
 * @swagger
 * /api/brand/send-request:
 *   post:
 *     summary: Send collaboration request to influencer
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - influencer_id
 *               - title
 *               - description
 *               - message
 *               - campaign_type
 *               - budget
 *               - timeline
 *             properties:
 *               influencer_id:
 *                 type: number
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               message:
 *                 type: string
 *               campaign_type:
 *                 type: string
 *                 enum: [Sponsored Content, Product Review, Brand Ambassador, Event Promotion, Live Stream, Story/Reel Creation, Long-term Partnership, One-time Collaboration]
 *               budget:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *                   currency:
 *                     type: string
 *                     default: USD
 *               timeline:
 *                 type: object
 *                 properties:
 *                   start_date:
 *                     type: string
 *                     format: date
 *                   end_date:
 *                     type: string
 *                     format: date
 *               content_requirements:
 *                 type: object
 *                 properties:
 *                   platforms:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [Instagram, Youtube, TikTok, LinkedIn, Twitter, Facebook]
 *                   content_types:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [Posts, Stories, Reels, Videos, Live Streams, Blog Posts]
 *     responses:
 *       200:
 *         description: Collaboration request sent successfully
 *       400:
 *         description: Validation error or request already exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Influencer not found
 */
router.post('/send-request', authenticateToken, authorizeRoles('brand'), requireProfileCompletion, validateCollaborationRequest, BrandController.sendCollaborationRequest);

/**
 * @swagger
 * /api/brand/my-requests:
 *   get:
 *     summary: Get brand's collaboration requests
 *     tags: [Brand]
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
 *         description: Requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my-requests', authenticateToken, authorizeRoles('brand'), validatePagination, BrandController.getMyRequests);

/**
 * @swagger
 * /api/brand/my-requests/{id}:
 *   get:
 *     summary: Get specific collaboration request details
 *     tags: [Brand]
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
 *         description: Request details retrieved successfully
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.get('/my-requests/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.getRequestDetails);

/**
 * @swagger
 * /api/brand/my-requests/{id}/update:
 *   put:
 *     summary: Update collaboration request
 *     tags: [Brand]
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
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.put('/my-requests/:id/update', authenticateToken, authorizeRoles('brand'), validateId, BrandController.updateRequest);

/**
 * @swagger
 * /api/brand/my-requests/{id}:
 *   delete:
 *     summary: Cancel collaboration request
 *     tags: [Brand]
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
 *         description: Request cancelled successfully
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/my-requests/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.cancelRequest);

/**
 * @swagger
 * /api/brand/my-requests/{id}/respond:
 *   put:
 *     summary: Respond to influencer's response
 *     tags: [Brand]
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
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response sent successfully
 *       404:
 *         description: Request not found
 *       401:
 *         description: Unauthorized
 */
router.put('/my-requests/:id/respond', authenticateToken, authorizeRoles('brand'), validateId, validateResponse, BrandController.respondToInfluencer);

/**
 * @swagger
 * /api/brand/analytics:
 *   get:
 *     summary: Get brand analytics
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics', authenticateToken, authorizeRoles('brand'), BrandController.getAnalytics);

/**
 * @swagger
 * /api/brand/analytics/requests:
 *   get:
 *     summary: Get request analytics
 *     tags: [Brand]
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
 *         description: Request analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics/requests', authenticateToken, authorizeRoles('brand'), validatePagination, BrandController.getRequestAnalytics);

/**
 * @swagger
 * /api/brand/analytics/engagement:
 *   get:
 *     summary: Get engagement metrics
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics/engagement', authenticateToken, authorizeRoles('brand'), BrandController.getEngagementMetrics);

/**
 * @swagger
 * /api/brand/favorites/{influencer_id}:
 *   post:
 *     summary: Add influencer to favorites
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: influencer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Influencer added to favorites
 *       401:
 *         description: Unauthorized
 */
router.post('/favorites/:influencer_id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.addToFavorites);

/**
 * @swagger
 * /api/brand/favorites/{influencer_id}:
 *   delete:
 *     summary: Remove influencer from favorites
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: influencer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Influencer removed from favorites
 *       401:
 *         description: Unauthorized
 */
router.delete('/favorites/:influencer_id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.removeFromFavorites);

/**
 * @swagger
 * /api/brand/favorites:
 *   get:
 *     summary: Get favorite influencers
 *     tags: [Brand]
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
 *         description: Favorite influencers retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/favorites', authenticateToken, authorizeRoles('brand'), validatePagination, BrandController.getFavorites);

/**
 * @swagger
 * /api/brand/lists:
 *   post:
 *     summary: Create influencer list
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: List created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/lists', authenticateToken, authorizeRoles('brand'), BrandController.createList);

/**
 * @swagger
 * /api/brand/lists:
 *   get:
 *     summary: Get influencer lists
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lists retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/lists', authenticateToken, authorizeRoles('brand'), BrandController.getLists);

/**
 * @swagger
 * /api/brand/lists/{id}:
 *   put:
 *     summary: Update influencer list
 *     tags: [Brand]
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
 *     responses:
 *       200:
 *         description: List updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/lists/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.updateList);

/**
 * @swagger
 * /api/brand/lists/{id}:
 *   delete:
 *     summary: Delete influencer list
 *     tags: [Brand]
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
 *         description: List deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/lists/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.deleteList);

/**
 * @swagger
 * /api/brand/lists/{id}/influencers/{influencer_id}:
 *   post:
 *     summary: Add influencer to list
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: influencer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Influencer added to list
 *       401:
 *         description: Unauthorized
 */
router.post('/lists/:id/influencers/:influencer_id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.addInfluencerToList);

/**
 * @swagger
 * /api/brand/lists/{id}/influencers/{influencer_id}:
 *   delete:
 *     summary: Remove influencer from list
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: influencer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Influencer removed from list
 *       401:
 *         description: Unauthorized
 */
router.delete('/lists/:id/influencers/:influencer_id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.removeInfluencerFromList);

/**
 * @swagger
 * /api/brand/campaigns:
 *   post:
 *     summary: Create campaign
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: object
 *               timeline:
 *                 type: object
 *     responses:
 *       200:
 *         description: Campaign created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/campaigns', authenticateToken, authorizeRoles('brand'), BrandController.createCampaign);

/**
 * @swagger
 * /api/brand/campaigns:
 *   get:
 *     summary: Get campaigns
 *     tags: [Brand]
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
 *         description: Campaigns retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/campaigns', authenticateToken, authorizeRoles('brand'), validatePagination, BrandController.getCampaigns);

/**
 * @swagger
 * /api/brand/campaigns/{id}:
 *   get:
 *     summary: Get campaign details
 *     tags: [Brand]
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
 *         description: Campaign details retrieved successfully
 *       404:
 *         description: Campaign not found
 *       401:
 *         description: Unauthorized
 */
router.get('/campaigns/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.getCampaignDetails);

/**
 * @swagger
 * /api/brand/campaigns/{id}:
 *   put:
 *     summary: Update campaign
 *     tags: [Brand]
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
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/campaigns/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.updateCampaign);

/**
 * @swagger
 * /api/brand/campaigns/{id}:
 *   delete:
 *     summary: Delete campaign
 *     tags: [Brand]
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
 *         description: Campaign deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/campaigns/:id', authenticateToken, authorizeRoles('brand'), validateId, BrandController.deleteCampaign);

/**
 * @swagger
 * /api/brand/settings:
 *   get:
 *     summary: Get brand settings
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/settings', authenticateToken, authorizeRoles('brand'), BrandController.getSettings);

/**
 * @swagger
 * /api/brand/settings:
 *   put:
 *     summary: Update brand settings
 *     tags: [Brand]
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
router.put('/settings', authenticateToken, authorizeRoles('brand'), BrandController.updateSettings);

/**
 * @swagger
 * /api/brand/settings/notifications:
 *   put:
 *     summary: Update notification settings
 *     tags: [Brand]
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
 *         description: Notification settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/settings/notifications', authenticateToken, authorizeRoles('brand'), BrandController.updateNotificationSettings);

/**
 * @swagger
 * /api/brand/settings/privacy:
 *   put:
 *     summary: Update privacy settings
 *     tags: [Brand]
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
 *         description: Privacy settings updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/settings/privacy', authenticateToken, authorizeRoles('brand'), BrandController.updatePrivacySettings);

/**
 * @swagger
 * /api/brand/notifications:
 *   get:
 *     summary: Get brand notifications
 *     tags: [Brand]
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
router.get('/notifications', authenticateToken, authorizeRoles('brand'), validatePagination, BrandController.getNotifications);

/**
 * @swagger
 * /api/brand/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Brand]
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
router.put('/notifications/:id/read', authenticateToken, authorizeRoles('brand'), validateId, BrandController.markNotificationRead);

/**
 * @swagger
 * /api/brand/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.put('/notifications/read-all', authenticateToken, authorizeRoles('brand'), BrandController.markAllNotificationsRead);

/**
 * @swagger
 * /api/brand/verify:
 *   post:
 *     summary: Request verification
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification request submitted successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/verify', authenticateToken, authorizeRoles('brand'), BrandController.requestVerification);

/**
 * @swagger
 * /api/brand/verify/status:
 *   get:
 *     summary: Get verification status
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification status retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/verify/status', authenticateToken, authorizeRoles('brand'), BrandController.getVerificationStatus);

/**
 * @swagger
 * /api/brand/dashboard:
 *   get:
 *     summary: Get brand dashboard
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authenticateToken, authorizeRoles('brand'), BrandController.getDashboard);

/**
 * @swagger
 * /api/brand/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard/stats', authenticateToken, authorizeRoles('brand'), BrandController.getDashboardStats);

/**
 * @swagger
 * /api/brand/public/{id}:
 *   get:
 *     summary: Get public brand profile (for influencers to view)
 *     tags: [Brand]
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
router.get('/public/:id', BrandController.getPublicProfile);

/**
 * @swagger
 * /api/brand/public/{id}/view:
 *   post:
 *     summary: Record profile view
 *     tags: [Brand]
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
router.post('/public/:id/view', BrandController.recordProfileView);

module.exports = router; 