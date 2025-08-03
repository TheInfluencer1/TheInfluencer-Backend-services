const InfluencerProfile = require('../models/influencer_profile');
const CollaborationRequest = require('../models/collaboration_request');
const ProfileViewStats = require('../models/profile_view_stats');
const MediaUploads = require('../models/media_uploads');
const User = require('../models/user');
const { uploadToS3 } = require('../utils/s3Upload');
const { sendEmail } = require('../utils/email');

class InfluencerController {
    
    // Profile Management
    static async getProfile(req, res) {
        try {
            const profile = await InfluencerProfile.findOne({ user_id: req.user.user_id });
            
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
            const profile = await InfluencerProfile.findOneAndUpdate(
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
            const profile = await InfluencerProfile.findOne({ user_id: req.user.user_id });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            // Check if required fields are completed
            const requiredFields = [
                'full_name.first_name',
                'full_name.last_name',
                'phone_number',
                'primary_social_media',
                'content_categories',
                'preferred_content_types',
                'languages',
                'minimum_budget'
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

    // Portfolio Management
    static async uploadPortfolioMedia(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const { media_type, description, tags } = req.body;
            
            // Upload to S3
            const uploadResult = await uploadToS3(req.file, 'portfolio');
            
            const mediaUpload = new MediaUploads({
                user_id: req.user.user_id,
                profile_type: 'influencer',
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

            // Update profile with portfolio image
            if (media_type === 'portfolio_image') {
                await InfluencerProfile.findOneAndUpdate(
                    { user_id: req.user.user_id },
                    { $push: { portfolio_images: { url: uploadResult.url, key: uploadResult.key, description } } }
                );
            }

            res.json({
                success: true,
                message: 'Media uploaded successfully',
                data: mediaUpload
            });
        } catch (error) {
            console.error('Error uploading media:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading media'
            });
        }
    }

    static async getPortfolio(req, res) {
        try {
            const portfolio = await MediaUploads.find({
                user_id: req.user.user_id,
                profile_type: 'influencer',
                media_type: { $in: ['portfolio_image', 'portfolio_video'] }
            }).sort({ created_at: -1 });

            res.json({
                success: true,
                data: portfolio
            });
        } catch (error) {
            console.error('Error getting portfolio:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving portfolio'
            });
        }
    }

    static async deletePortfolioMedia(req, res) {
        try {
            const media = await MediaUploads.findOne({
                _id: req.params.id,
                user_id: req.user.user_id
            });

            if (!media) {
                return res.status(404).json({
                    success: false,
                    message: 'Media not found'
                });
            }

            // Delete from S3 and database
            // Note: Implement S3 deletion logic here
            await MediaUploads.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: 'Media deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting media:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting media'
            });
        }
    }

    // Analytics
    static async getAnalytics(req, res) {
        try {
            const userId = req.user.user_id;
            
            // Get profile views
            const profileViews = await ProfileViewStats.aggregate([
                { $match: { profile_id: userId, profile_type: 'influencer' } },
                { $group: { _id: null, total_views: { $sum: '$total_views' }, unique_views: { $sum: '$unique_views' } } }
            ]);

            // Get collaboration requests
            const requests = await CollaborationRequest.find({ influencer_id: userId });
            const pendingRequests = requests.filter(r => r.status === 'pending').length;
            const acceptedRequests = requests.filter(r => r.status === 'accepted').length;
            const completedRequests = requests.filter(r => r.status === 'completed').length;

            // Get recent activity
            const recentViews = await ProfileViewStats.find({ profile_id: userId })
                .sort({ view_date: -1 })
                .limit(10);

            const analytics = {
                profile_views: profileViews[0]?.total_views || 0,
                unique_views: profileViews[0]?.unique_views || 0,
                collaboration_requests: {
                    total: requests.length,
                    pending: pendingRequests,
                    accepted: acceptedRequests,
                    completed: completedRequests
                },
                recent_activity: recentViews
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

    static async getProfileViews(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const views = await ProfileViewStats.find({ profile_id: req.user.user_id })
                .sort({ view_date: -1 })
                .skip(skip)
                .limit(limit);

            const total = await ProfileViewStats.countDocuments({ profile_id: req.user.user_id });

            res.json({
                success: true,
                data: views,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting profile views:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving profile views'
            });
        }
    }

    static async getEngagementMetrics(req, res) {
        try {
            const userId = req.user.user_id;
            
            // Calculate engagement metrics
            const metrics = await ProfileViewStats.aggregate([
                { $match: { profile_id: userId, profile_type: 'influencer' } },
                {
                    $group: {
                        _id: null,
                        total_interactions: { $sum: { $cond: [{ $eq: ['$interactions.profile_clicked', true] }, 1, 0] } },
                        contact_clicks: { $sum: { $cond: [{ $eq: ['$interactions.contact_clicked', true] }, 1, 0] } },
                        portfolio_views: { $sum: { $cond: [{ $eq: ['$interactions.portfolio_viewed', true] }, 1, 0] } },
                        collaboration_requests: { $sum: { $cond: [{ $eq: ['$interactions.collaboration_requested', true] }, 1, 0] } }
                    }
                }
            ]);

            res.json({
                success: true,
                data: metrics[0] || {
                    total_interactions: 0,
                    contact_clicks: 0,
                    portfolio_views: 0,
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

    // Collaboration Requests
    static async getCollaborationRequests(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const requests = await CollaborationRequest.find({ influencer_id: req.user.user_id })
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit);

            const total = await CollaborationRequest.countDocuments({ influencer_id: req.user.user_id });

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
            console.error('Error getting collaboration requests:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving collaboration requests'
            });
        }
    }

    static async getCollaborationRequest(req, res) {
        try {
            const request = await CollaborationRequest.findOne({
                _id: req.params.id,
                influencer_id: req.user.user_id
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
            console.error('Error getting collaboration request:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving collaboration request'
            });
        }
    }

    static async respondToRequest(req, res) {
        try {
            const { message, counter_offer } = req.body;
            
            const request = await CollaborationRequest.findOneAndUpdate(
                {
                    _id: req.params.id,
                    influencer_id: req.user.user_id,
                    status: 'pending'
                },
                {
                    'response.influencer_response': {
                        message,
                        counter_offer,
                        responded_at: new Date()
                    }
                },
                { new: true }
            );

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found or already responded'
                });
            }

            // Send notification to brand
            // Note: Implement notification logic here

            res.json({
                success: true,
                message: 'Response sent successfully',
                data: request
            });
        } catch (error) {
            console.error('Error responding to request:', error);
            res.status(500).json({
                success: false,
                message: 'Error responding to request'
            });
        }
    }

    static async acceptRequest(req, res) {
        try {
            const request = await CollaborationRequest.findOneAndUpdate(
                {
                    _id: req.params.id,
                    influencer_id: req.user.user_id,
                    status: 'pending'
                },
                { status: 'accepted' },
                { new: true }
            );

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found or already processed'
                });
            }

            // Send notification to brand
            // Note: Implement notification logic here

            res.json({
                success: true,
                message: 'Request accepted successfully',
                data: request
            });
        } catch (error) {
            console.error('Error accepting request:', error);
            res.status(500).json({
                success: false,
                message: 'Error accepting request'
            });
        }
    }

    static async rejectRequest(req, res) {
        try {
            const request = await CollaborationRequest.findOneAndUpdate(
                {
                    _id: req.params.id,
                    influencer_id: req.user.user_id,
                    status: 'pending'
                },
                { status: 'rejected' },
                { new: true }
            );

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found or already processed'
                });
            }

            // Send notification to brand
            // Note: Implement notification logic here

            res.json({
                success: true,
                message: 'Request rejected successfully',
                data: request
            });
        } catch (error) {
            console.error('Error rejecting request:', error);
            res.status(500).json({
                success: false,
                message: 'Error rejecting request'
            });
        }
    }

    // Public Profile
    static async getPublicProfile(req, res) {
        try {
            const profile = await InfluencerProfile.findOne({ user_id: req.params.id });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            // Return only public information
            const publicProfile = {
                user_id: profile.user_id,
                full_name: profile.full_name,
                content_categories: profile.content_categories,
                primary_social_media: profile.primary_social_media,
                social_media_details: profile.social_media_details,
                minimum_budget: profile.minimum_budget,
                availability: profile.availability,
                profile_image: profile.profile_image,
                portfolio_images: profile.portfolio_images.slice(0, 3), // Limit to 3 images
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
                profile_type: 'influencer',
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

    // Dashboard
    static async getDashboard(req, res) {
        try {
            const userId = req.user.user_id;
            
            // Get recent requests
            const recentRequests = await CollaborationRequest.find({ influencer_id: userId })
                .sort({ created_at: -1 })
                .limit(5);

            // Get profile views for last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const recentViews = await ProfileViewStats.find({
                profile_id: userId,
                view_date: { $gte: sevenDaysAgo }
            });

            // Get portfolio stats
            const portfolioCount = await MediaUploads.countDocuments({
                user_id: userId,
                profile_type: 'influencer'
            });

            const dashboard = {
                recent_requests: recentRequests,
                recent_views: recentViews.length,
                portfolio_count: portfolioCount,
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
                total_requests: await CollaborationRequest.countDocuments({ influencer_id: userId }),
                pending_requests: await CollaborationRequest.countDocuments({ influencer_id: userId, status: 'pending' }),
                accepted_requests: await CollaborationRequest.countDocuments({ influencer_id: userId, status: 'accepted' }),
                profile_views: await ProfileViewStats.countDocuments({ profile_id: userId }),
                portfolio_items: await MediaUploads.countDocuments({ user_id: userId, profile_type: 'influencer' })
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

    // Search and Discovery
    static async searchInfluencers(req, res) {
        try {
            const { q, category, min_followers, max_followers, page = 1, limit = 10 } = req.query;
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

            const influencers = await InfluencerProfile.find(query)
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
            console.error('Error searching influencers:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching influencers'
            });
        }
    }

    static async getCategories(req, res) {
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
            console.error('Error getting categories:', error);
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
            const profiles = await InfluencerProfile.find({ user_id: { $in: influencerIds } });

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

    // Additional methods for routes
    static async getApproachingBrands(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Get brands that have sent collaboration requests to this influencer
            const requests = await CollaborationRequest.find({ 
                influencer_id: req.user.user_id,
                status: { $in: ['pending', 'accepted'] }
            }).populate('brand_id', 'company_name industry');

            const brandIds = [...new Set(requests.map(r => r.brand_id))];
            const brands = await BrandProfile.find({ user_id: { $in: brandIds } })
                .select('company_name industry description logo')
                .skip(skip)
                .limit(limit);

            const total = brands.length;

            res.json({
                success: true,
                data: brands,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting approaching brands:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving approaching brands'
            });
        }
    }

    static async getContactedBrands(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Get brands that this influencer has contacted
            const requests = await CollaborationRequest.find({ 
                influencer_id: req.user.user_id,
                status: { $in: ['pending', 'accepted', 'completed'] }
            }).populate('brand_id', 'company_name industry');

            const brandIds = [...new Set(requests.map(r => r.brand_id))];
            const brands = await BrandProfile.find({ user_id: { $in: brandIds } })
                .select('company_name industry description logo')
                .skip(skip)
                .limit(limit);

            const total = brands.length;

            res.json({
                success: true,
                data: brands,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting contacted brands:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving contacted brands'
            });
        }
    }

    static async getSettings(req, res) {
        try {
            const profile = await InfluencerProfile.findOne({ user_id: req.user.user_id });
            
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
                    auto_accept_requests: false,
                    minimum_budget: profile.minimum_budget,
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
            await InfluencerProfile.findOneAndUpdate(
                { user_id: req.user.user_id },
                {
                    minimum_budget: preferences?.minimum_budget,
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

    static async updateAvailability(req, res) {
        try {
            const { availability } = req.body;
            
            await InfluencerProfile.findOneAndUpdate(
                { user_id: req.user.user_id },
                { availability }
            );

            res.json({
                success: true,
                message: 'Availability updated successfully'
            });
        } catch (error) {
            console.error('Error updating availability:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating availability'
            });
        }
    }

    static async updatePricing(req, res) {
        try {
            const { minimum_budget, pricing_tiers } = req.body;
            
            await InfluencerProfile.findOneAndUpdate(
                { user_id: req.user.user_id },
                { 
                    minimum_budget,
                    pricing_tiers
                }
            );

            res.json({
                success: true,
                message: 'Pricing updated successfully'
            });
        } catch (error) {
            console.error('Error updating pricing:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating pricing'
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
                    type: 'collaboration_request',
                    title: 'New Collaboration Request',
                    message: 'Brand XYZ has sent you a collaboration request',
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
            const profile = await InfluencerProfile.findOne({ user_id: req.user.user_id });
            
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
            const profile = await InfluencerProfile.findOne({ user_id: req.user.user_id });
            
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

module.exports = InfluencerController; 