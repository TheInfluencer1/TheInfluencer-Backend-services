const BrandProfile = require('../models/brand_profile');
const InfluencerProfile = require('../models/influencer_profile');
const CollaborationRequest = require('../models/collaboration_request');
const ProfileViewStats = require('../models/profile_view_stats');
const MediaUploads = require('../models/media_uploads');
const User = require('../models/user');
const { uploadToS3 } = require('../utils/s3Upload');
const { sendEmail } = require('../utils/email');

class BrandController {
    
    // Profile Management
    static async getProfile(req, res) {
        try {
            const profile = await BrandProfile.findOne({ user_id: req.user.user_id });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            console.error('Error getting profile:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving profile'
            });
        }
    }

    static async updateProfile(req, res) {
        try {
            const profile = await BrandProfile.findOneAndUpdate(
                { user_id: req.user.user_id },
                req.body,
                { new: true, runValidators: true }
            );

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: profile
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating profile'
            });
        }
    }

    static async completeProfile(req, res) {
        try {
            const profile = await BrandProfile.findOne({ user_id: req.user.user_id });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            // Check if required fields are completed
            const requiredFields = [
                'company_name',
                'industry',
                'contact_person.name',
                'contact_person.position',
                'contact_person.email',
                'description',
                'target_audience',
                'content_categories'
            ];

            const missingFields = requiredFields.filter(field => {
                const value = field.split('.').reduce((obj, key) => obj?.[key], profile);
                return !value || (Array.isArray(value) && value.length === 0);
            });

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Profile incomplete',
                    missingFields
                });
            }

            // Update user profile completion status
            await User.findOneAndUpdate(
                { user_id: req.user.user_id },
                { profile_completed: true }
            );

            res.json({
                success: true,
                message: 'Profile completed successfully'
            });
        } catch (error) {
            console.error('Error completing profile:', error);
            res.status(500).json({
                success: false,
                message: 'Error completing profile'
            });
        }
    }

    // Company Assets
    static async uploadCompanyAsset(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const { media_type, description, tags } = req.body;
            
            // Upload to S3
            const uploadResult = await uploadToS3(req.file, 'company-assets');
            
            const mediaUpload = new MediaUploads({
                user_id: req.user.user_id,
                profile_type: 'brand',
                file_name: uploadResult.key,
                original_name: req.file.originalname,
                file_type: req.file.mimetype.split('/')[0],
                mime_type: req.file.mimetype,
                file_size: req.file.size,
                url: uploadResult.url,
                key: uploadResult.key,
                bucket: process.env.AWS_S3_BUCKET,
                media_type,
                description,
                tags: tags ? JSON.parse(tags) : []
            });

            await mediaUpload.save();

            // Update profile with company asset
            if (media_type === 'company_logo') {
                await BrandProfile.findOneAndUpdate(
                    { user_id: req.user.user_id },
                    { logo: { url: uploadResult.url, key: uploadResult.key } }
                );
            } else if (media_type === 'company_image') {
                await BrandProfile.findOneAndUpdate(
                    { user_id: req.user.user_id },
                    { $push: { company_images: { url: uploadResult.url, key: uploadResult.key, description } } }
                );
            }

            res.json({
                success: true,
                message: 'Asset uploaded successfully',
                data: mediaUpload
            });
        } catch (error) {
            console.error('Error uploading asset:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading asset'
            });
        }
    }

    static async getCompanyAssets(req, res) {
        try {
            const assets = await MediaUploads.find({
                user_id: req.user.user_id,
                profile_type: 'brand'
            }).sort({ created_at: -1 });

            res.json({
                success: true,
                data: assets
            });
        } catch (error) {
            console.error('Error getting company assets:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving company assets'
            });
        }
    }

    static async deleteCompanyAsset(req, res) {
        try {
            const asset = await MediaUploads.findOne({
                _id: req.params.id,
                user_id: req.user.user_id
            });

            if (!asset) {
                return res.status(404).json({
                    success: false,
                    message: 'Asset not found'
                });
            }

            // Delete from S3 and database
            // Note: Implement S3 deletion logic here
            await MediaUploads.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: 'Asset deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting asset:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting asset'
            });
        }
    }

    // Influencer Exploration
    static async exploreInfluencers(req, res) {
        try {
            const { q, category, min_followers, max_followers, budget_min, budget_max, page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            let query = {};

            if (q) {
                query.$or = [
                    { 'full_name.first_name': { $regex: q, $options: 'i' } },
                    { 'full_name.last_name': { $regex: q, $options: 'i' } },
                    { content_categories: { $in: [new RegExp(q, 'i')] } }
                ];
            }

            if (category) {
                query.content_categories = { $in: [category] };
            }

            if (min_followers || max_followers) {
                query.$or = [
                    { 'social_media_details.instagram.follower_count': { $gte: parseInt(min_followers) || 0 } },
                    { 'social_media_details.youtube.subscriber_count': { $gte: parseInt(min_followers) || 0 } }
                ];
            }

            if (max_followers) {
                query.$and = [
                    { 'social_media_details.instagram.follower_count': { $lte: parseInt(max_followers) } },
                    { 'social_media_details.youtube.subscriber_count': { $lte: parseInt(max_followers) } }
                ];
            }

            if (budget_min) {
                query.minimum_budget = { $gte: parseInt(budget_min) };
            }

            if (budget_max) {
                query.minimum_budget = { ...query.minimum_budget, $lte: parseInt(budget_max) };
            }

            const influencers = await InfluencerProfile.find(query)
                .select('-address -phone_number -email -suggestions') // Exclude private info
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ created_at: -1 });

            const total = await InfluencerProfile.countDocuments(query);

            res.json({
                success: true,
                data: influencers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error exploring influencers:', error);
            res.status(500).json({
                success: false,
                message: 'Error exploring influencers'
            });
        }
    }

    static async getInfluencerDetails(req, res) {
        try {
            const influencer = await InfluencerProfile.findOne({ user_id: req.params.id })
                .select('-address -phone_number -email -suggestions'); // Exclude private info

            if (!influencer) {
                return res.status(404).json({
                    success: false,
                    message: 'Influencer not found'
                });
            }

            // Record profile view
            const viewerId = req.user.user_id;
            const viewStats = new ProfileViewStats({
                profile_id: req.params.id,
                profile_type: 'influencer',
                viewer_id: viewerId,
                viewer_type: 'brand',
                total_views: 1,
                unique_views: 1,
                interactions: {
                    profile_clicked: true
                }
            });

            await viewStats.save();

            res.json({
                success: true,
                data: influencer
            });
        } catch (error) {
            console.error('Error getting influencer details:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving influencer details'
            });
        }
    }

    static async getInfluencerCategories(req, res) {
        try {
            const categories = [
                'Fashion & Beauty',
                'Food & Lifestyle',
                'Technology & Gadgets',
                'Education & Self-Improvement',
                'Parenting & Family',
                'Health & Fitness',
                'Travel & Adventure',
                'Finance & Business',
                'Entertainment & Media',
                'Sustainability & Pet Care'
            ];

            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            console.error('Error getting influencer categories:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving categories'
            });
        }
    }

    static async getTrendingInfluencers(req, res) {
        try {
            // Get influencers with most profile views in last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const trendingInfluencers = await ProfileViewStats.aggregate([
                { $match: { view_date: { $gte: thirtyDaysAgo } } },
                { $group: { _id: '$profile_id', total_views: { $sum: '$total_views' } } },
                { $sort: { total_views: -1 } },
                { $limit: 10 }
            ]);

            const influencerIds = trendingInfluencers.map(item => item._id);
            const profiles = await InfluencerProfile.find({ user_id: { $in: influencerIds } })
                .select('-address -phone_number -email -suggestions');

            res.json({
                success: true,
                data: profiles
            });
        } catch (error) {
            console.error('Error getting trending influencers:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving trending influencers'
            });
        }
    }

    // Collaboration Requests
    static async sendCollaborationRequest(req, res) {
        try {
            const { influencer_id, ...requestData } = req.body;
            
            // Check if influencer exists
            const influencer = await InfluencerProfile.findOne({ user_id: influencer_id });
            if (!influencer) {
                return res.status(404).json({
                    success: false,
                    message: 'Influencer not found'
                });
            }

            // Check if request already exists
            const existingRequest = await CollaborationRequest.findOne({
                brand_id: req.user.user_id,
                influencer_id,
                status: { $in: ['pending', 'accepted'] }
            });

            if (existingRequest) {
                return res.status(400).json({
                    success: false,
                    message: 'Collaboration request already exists'
                });
            }

            const collaborationRequest = new CollaborationRequest({
                brand_id: req.user.user_id,
                influencer_id,
                ...requestData
            });

            await collaborationRequest.save();

            // Send notification to influencer
            // Note: Implement notification logic here

            res.json({
                success: true,
                message: 'Collaboration request sent successfully',
                data: collaborationRequest
            });
        } catch (error) {
            console.error('Error sending collaboration request:', error);
            res.status(500).json({
                success: false,
                message: 'Error sending collaboration request'
            });
        }
    }

    static async getMyRequests(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const requests = await CollaborationRequest.find({ brand_id: req.user.user_id })
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit);

            const total = await CollaborationRequest.countDocuments({ brand_id: req.user.user_id });

            res.json({
                success: true,
                data: requests,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting my requests:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving requests'
            });
        }
    }

    static async getRequestDetails(req, res) {
        try {
            const request = await CollaborationRequest.findOne({
                _id: req.params.id,
                brand_id: req.user.user_id
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found'
                });
            }

            res.json({
                success: true,
                data: request
            });
        } catch (error) {
            console.error('Error getting request details:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving request details'
            });
        }
    }

    static async updateRequest(req, res) {
        try {
            const request = await CollaborationRequest.findOneAndUpdate(
                {
                    _id: req.params.id,
                    brand_id: req.user.user_id,
                    status: 'pending'
                },
                req.body,
                { new: true }
            );

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found or cannot be updated'
                });
            }

            res.json({
                success: true,
                message: 'Request updated successfully',
                data: request
            });
        } catch (error) {
            console.error('Error updating request:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating request'
            });
        }
    }

    static async cancelRequest(req, res) {
        try {
            const request = await CollaborationRequest.findOneAndUpdate(
                {
                    _id: req.params.id,
                    brand_id: req.user.user_id,
                    status: 'pending'
                },
                { status: 'cancelled' },
                { new: true }
            );

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found or cannot be cancelled'
                });
            }

            res.json({
                success: true,
                message: 'Request cancelled successfully',
                data: request
            });
        } catch (error) {
            console.error('Error cancelling request:', error);
            res.status(500).json({
                success: false,
                message: 'Error cancelling request'
            });
        }
    }

    static async respondToInfluencer(req, res) {
        try {
            const { message } = req.body;
            
            const request = await CollaborationRequest.findOneAndUpdate(
                {
                    _id: req.params.id,
                    brand_id: req.user.user_id
                },
                {
                    'response.brand_response': {
                        message,
                        responded_at: new Date()
                    }
                },
                { new: true }
            );

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found'
                });
            }

            res.json({
                success: true,
                message: 'Response sent successfully',
                data: request
            });
        } catch (error) {
            console.error('Error responding to influencer:', error);
            res.status(500).json({
                success: false,
                message: 'Error responding to influencer'
            });
        }
    }

    // Analytics
    static async getAnalytics(req, res) {
        try {
            const userId = req.user.user_id;
            
            // Get profile views
            const profileViews = await ProfileViewStats.aggregate([
                { $match: { profile_id: userId, profile_type: 'brand' } },
                { $group: { _id: null, total_views: { $sum: '$total_views' }, unique_views: { $sum: '$unique_views' } } }
            ]);

            // Get collaboration requests
            const requests = await CollaborationRequest.find({ brand_id: userId });
            const pendingRequests = requests.filter(r => r.status === 'pending').length;
            const acceptedRequests = requests.filter(r => r.status === 'accepted').length;
            const completedRequests = requests.filter(r => r.status === 'completed').length;

            const analytics = {
                profile_views: profileViews[0]?.total_views || 0,
                unique_views: profileViews[0]?.unique_views || 0,
                collaboration_requests: {
                    total: requests.length,
                    pending: pendingRequests,
                    accepted: acceptedRequests,
                    completed: completedRequests
                }
            };

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Error getting analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving analytics'
            });
        }
    }

    static async getRequestAnalytics(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const requests = await CollaborationRequest.find({ brand_id: req.user.user_id })
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit);

            const total = await CollaborationRequest.countDocuments({ brand_id: req.user.user_id });

            res.json({
                success: true,
                data: requests,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting request analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving request analytics'
            });
        }
    }

    static async getEngagementMetrics(req, res) {
        try {
            const userId = req.user.user_id;
            
            // Calculate engagement metrics
            const metrics = await ProfileViewStats.aggregate([
                { $match: { profile_id: userId, profile_type: 'brand' } },
                {
                    $group: {
                        _id: null,
                        total_interactions: { $sum: { $cond: [{ $eq: ['$interactions.profile_clicked', true] }, 1, 0] } },
                        contact_clicks: { $sum: { $cond: [{ $eq: ['$interactions.contact_clicked', true] }, 1, 0] } },
                        collaboration_requests: { $sum: { $cond: [{ $eq: ['$interactions.collaboration_requested', true] }, 1, 0] } }
                    }
                }
            ]);

            res.json({
                success: true,
                data: metrics[0] || {
                    total_interactions: 0,
                    contact_clicks: 0,
                    collaboration_requests: 0
                }
            });
        } catch (error) {
            console.error('Error getting engagement metrics:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving engagement metrics'
            });
        }
    }

    // Dashboard
    static async getDashboard(req, res) {
        try {
            const userId = req.user.user_id;
            
            // Get recent requests
            const recentRequests = await CollaborationRequest.find({ brand_id: userId })
                .sort({ created_at: -1 })
                .limit(5);

            // Get profile views for last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const recentViews = await ProfileViewStats.find({
                profile_id: userId,
                view_date: { $gte: sevenDaysAgo }
            });

            // Get company assets count
            const assetsCount = await MediaUploads.countDocuments({
                user_id: userId,
                profile_type: 'brand'
            });

            const dashboard = {
                recent_requests: recentRequests,
                recent_views: recentViews.length,
                assets_count: assetsCount,
                profile_completion: req.user.profile_completed
            };

            res.json({
                success: true,
                data: dashboard
            });
        } catch (error) {
            console.error('Error getting dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving dashboard'
            });
        }
    }

    static async getDashboardStats(req, res) {
        try {
            const userId = req.user.user_id;
            
            // Get various stats
            const stats = {
                total_requests: await CollaborationRequest.countDocuments({ brand_id: userId }),
                pending_requests: await CollaborationRequest.countDocuments({ brand_id: userId, status: 'pending' }),
                accepted_requests: await CollaborationRequest.countDocuments({ brand_id: userId, status: 'accepted' }),
                profile_views: await ProfileViewStats.countDocuments({ profile_id: userId }),
                assets_count: await MediaUploads.countDocuments({ user_id: userId, profile_type: 'brand' })
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving dashboard stats'
            });
        }
    }

    // Public Profile
    static async getPublicProfile(req, res) {
        try {
            const profile = await BrandProfile.findOne({ user_id: req.params.id });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            // Return only public information
            const publicProfile = {
                user_id: profile.user_id,
                company_name: profile.company_name,
                industry: profile.industry,
                description: profile.description,
                target_audience: profile.target_audience,
                content_categories: profile.content_categories,
                budget_range: profile.budget_range,
                logo: profile.logo,
                company_images: profile.company_images.slice(0, 3), // Limit to 3 images
                is_verified: profile.is_verified
            };

            res.json({
                success: true,
                data: publicProfile
            });
        } catch (error) {
            console.error('Error getting public profile:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving public profile'
            });
        }
    }

    static async recordProfileView(req, res) {
        try {
            const viewerId = req.user?.user_id || null;
            const viewerType = req.user?.user_type || 'anonymous';

            const viewStats = new ProfileViewStats({
                profile_id: req.params.id,
                profile_type: 'brand',
                viewer_id: viewerId,
                viewer_type: viewerType,
                total_views: 1,
                unique_views: 1,
                interactions: {
                    profile_clicked: true
                }
            });

            await viewStats.save();

            res.json({
                success: true,
                message: 'Profile view recorded'
            });
        } catch (error) {
            console.error('Error recording profile view:', error);
            res.status(500).json({
                success: false,
                message: 'Error recording profile view'
            });
        }
    }

    // Additional methods for routes
    static async addToFavorites(req, res) {
        try {
            const { influencer_id } = req.params;
            
            // In real app, add to favorites collection
            res.json({
                success: true,
                message: 'Influencer added to favorites'
            });
        } catch (error) {
            console.error('Error adding to favorites:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding to favorites'
            });
        }
    }

    static async removeFromFavorites(req, res) {
        try {
            const { influencer_id } = req.params;
            
            // In real app, remove from favorites collection
            res.json({
                success: true,
                message: 'Influencer removed from favorites'
            });
        } catch (error) {
            console.error('Error removing from favorites:', error);
            res.status(500).json({
                success: false,
                message: 'Error removing from favorites'
            });
        }
    }

    static async getFavorites(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Mock favorites - in real app, this would come from a favorites collection
            const favorites = [];

            res.json({
                success: true,
                data: favorites,
                pagination: {
                    page,
                    limit,
                    total: favorites.length,
                    pages: Math.ceil(favorites.length / limit)
                }
            });
        } catch (error) {
            console.error('Error getting favorites:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving favorites'
            });
        }
    }

    static async createList(req, res) {
        try {
            const { name, description } = req.body;
            
            // In real app, create list in database
            res.json({
                success: true,
                message: 'List created successfully'
            });
        } catch (error) {
            console.error('Error creating list:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating list'
            });
        }
    }

    static async getLists(req, res) {
        try {
            // Mock lists - in real app, this would come from a lists collection
            const lists = [];

            res.json({
                success: true,
                data: lists
            });
        } catch (error) {
            console.error('Error getting lists:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving lists'
            });
        }
    }

    static async updateList(req, res) {
        try {
            const { id } = req.params;
            
            // In real app, update list in database
            res.json({
                success: true,
                message: 'List updated successfully'
            });
        } catch (error) {
            console.error('Error updating list:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating list'
            });
        }
    }

    static async deleteList(req, res) {
        try {
            const { id } = req.params;
            
            // In real app, delete list from database
            res.json({
                success: true,
                message: 'List deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting list:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting list'
            });
        }
    }

    static async addInfluencerToList(req, res) {
        try {
            const { id, influencer_id } = req.params;
            
            // In real app, add influencer to list
            res.json({
                success: true,
                message: 'Influencer added to list'
            });
        } catch (error) {
            console.error('Error adding influencer to list:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding influencer to list'
            });
        }
    }

    static async removeInfluencerFromList(req, res) {
        try {
            const { id, influencer_id } = req.params;
            
            // In real app, remove influencer from list
            res.json({
                success: true,
                message: 'Influencer removed from list'
            });
        } catch (error) {
            console.error('Error removing influencer from list:', error);
            res.status(500).json({
                success: false,
                message: 'Error removing influencer from list'
            });
        }
    }

    static async createCampaign(req, res) {
        try {
            const { name, description, budget, timeline } = req.body;
            
            // In real app, create campaign in database
            res.json({
                success: true,
                message: 'Campaign created successfully'
            });
        } catch (error) {
            console.error('Error creating campaign:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating campaign'
            });
        }
    }

    static async getCampaigns(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Mock campaigns - in real app, this would come from a campaigns collection
            const campaigns = [];

            res.json({
                success: true,
                data: campaigns,
                pagination: {
                    page,
                    limit,
                    total: campaigns.length,
                    pages: Math.ceil(campaigns.length / limit)
                }
            });
        } catch (error) {
            console.error('Error getting campaigns:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving campaigns'
            });
        }
    }

    static async getCampaignDetails(req, res) {
        try {
            const { id } = req.params;
            
            // Mock campaign details
            const campaign = {
                id,
                name: 'Sample Campaign',
                description: 'Sample campaign description'
            };

            res.json({
                success: true,
                data: campaign
            });
        } catch (error) {
            console.error('Error getting campaign details:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving campaign details'
            });
        }
    }

    static async updateCampaign(req, res) {
        try {
            const { id } = req.params;
            
            // In real app, update campaign in database
            res.json({
                success: true,
                message: 'Campaign updated successfully'
            });
        } catch (error) {
            console.error('Error updating campaign:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating campaign'
            });
        }
    }

    static async deleteCampaign(req, res) {
        try {
            const { id } = req.params;
            
            // In real app, delete campaign from database
            res.json({
                success: true,
                message: 'Campaign deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting campaign:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting campaign'
            });
        }
    }

    static async getSettings(req, res) {
        try {
            const profile = await BrandProfile.findOne({ user_id: req.user.user_id });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            const settings = {
                notifications: {
                    email: true,
                    push: true,
                    sms: false
                },
                privacy: {
                    profile_visibility: 'public',
                    contact_visibility: 'private',
                    analytics_visibility: 'private'
                },
                preferences: {
                    auto_approve_requests: false,
                    budget_range: profile.budget_range,
                    preferred_categories: profile.content_categories
                }
            };

            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Error getting settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving settings'
            });
        }
    }

    static async updateSettings(req, res) {
        try {
            const { notifications, privacy, preferences } = req.body;
            
            // Update profile with new preferences
            await BrandProfile.findOneAndUpdate(
                { user_id: req.user.user_id },
                {
                    budget_range: preferences?.budget_range,
                    content_categories: preferences?.preferred_categories
                }
            );

            res.json({
                success: true,
                message: 'Settings updated successfully'
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating settings'
            });
        }
    }

    static async updateNotificationSettings(req, res) {
        try {
            const { notifications } = req.body;
            
            // In real app, update notification settings
            res.json({
                success: true,
                message: 'Notification settings updated successfully'
            });
        } catch (error) {
            console.error('Error updating notification settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating notification settings'
            });
        }
    }

    static async updatePrivacySettings(req, res) {
        try {
            const { privacy } = req.body;
            
            // In real app, update privacy settings
            res.json({
                success: true,
                message: 'Privacy settings updated successfully'
            });
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating privacy settings'
            });
        }
    }

    static async getNotifications(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Mock notifications - in real app, this would come from a notifications collection
            const notifications = [
                {
                    id: 1,
                    type: 'collaboration_response',
                    title: 'Collaboration Response',
                    message: 'Influencer ABC has responded to your collaboration request',
                    read: false,
                    created_at: new Date()
                }
            ];

            res.json({
                success: true,
                data: notifications,
                pagination: {
                    page,
                    limit,
                    total: notifications.length,
                    pages: Math.ceil(notifications.length / limit)
                }
            });
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving notifications'
            });
        }
    }

    static async markNotificationRead(req, res) {
        try {
            const { id } = req.params;
            
            // In real app, update notification status in database
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Error marking notification read:', error);
            res.status(500).json({
                success: false,
                message: 'Error marking notification as read'
            });
        }
    }

    static async markAllNotificationsRead(req, res) {
        try {
            // In real app, update all notifications for this user
            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            console.error('Error marking all notifications read:', error);
            res.status(500).json({
                success: false,
                message: 'Error marking all notifications as read'
            });
        }
    }

    static async requestVerification(req, res) {
        try {
            const profile = await BrandProfile.findOne({ user_id: req.user.user_id });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            // In real app, create verification request
            res.json({
                success: true,
                message: 'Verification request submitted successfully'
            });
        } catch (error) {
            console.error('Error requesting verification:', error);
            res.status(500).json({
                success: false,
                message: 'Error submitting verification request'
            });
        }
    }

    static async getVerificationStatus(req, res) {
        try {
            const profile = await BrandProfile.findOne({ user_id: req.user.user_id });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.json({
                success: true,
                data: {
                    is_verified: profile.is_verified,
                    verification_status: profile.is_verified ? 'verified' : 'pending'
                }
            });
        } catch (error) {
            console.error('Error getting verification status:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving verification status'
            });
        }
    }
}

module.exports = BrandController; 