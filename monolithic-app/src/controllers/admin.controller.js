const User = require('../models/user');
const InfluencerProfile = require('../models/influencer_profile');
const BrandProfile = require('../models/brand_profile');
const CollaborationRequest = require('../models/collaboration_request');
const ProfileViewStats = require('../models/profile_view_stats');
const MediaUploads = require('../models/media_uploads');

class AdminController {
    
    // User Management
    static async getAllUsers(req, res) {
        try {
            const { q, user_type, page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            let query = {};

            if (q) {
                query.$or = [
                    { name: { $regex: q, $options: 'i' } },
                    { email: { $regex: q, $options: 'i' } }
                ];
            }

            if (user_type) {
                query.user_type = user_type;
            }

            const users = await User.find(query)
                .select('-password')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ created_at: -1 });

            const total = await User.countDocuments(query);

            res.json({
                success: true,
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving users'
            });
        }
    }

    static async getUserDetails(req, res) {
        try {
            const user = await User.findOne({ user_id: req.params.id }).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get profile based on user type
            let profile = null;
            if (user.user_type === 'influencer') {
                profile = await InfluencerProfile.findOne({ user_id: user.user_id });
            } else if (user.user_type === 'brand') {
                profile = await BrandProfile.findOne({ user_id: user.user_id });
            }

            res.json({
                success: true,
                data: {
                    user,
                    profile
                }
            });
        } catch (error) {
            console.error('Error getting user details:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving user details'
            });
        }
    }

    static async updateUserStatus(req, res) {
        try {
            const { status } = req.body;
            
            const user = await User.findOneAndUpdate(
                { user_id: req.params.id },
                { is_active: status === 'active' },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User status updated successfully',
                data: user
            });
        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating user status'
            });
        }
    }

    static async verifyUser(req, res) {
        try {
            const user = await User.findOneAndUpdate(
                { user_id: req.params.id },
                { is_verified: true },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update profile verification status
            if (user.user_type === 'influencer') {
                await InfluencerProfile.findOneAndUpdate(
                    { user_id: user.user_id },
                    { is_verified: true }
                );
            } else if (user.user_type === 'brand') {
                await BrandProfile.findOneAndUpdate(
                    { user_id: user.user_id },
                    { is_verified: true }
                );
            }

            res.json({
                success: true,
                message: 'User verified successfully',
                data: user
            });
        } catch (error) {
            console.error('Error verifying user:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying user'
            });
        }
    }

    static async deleteUser(req, res) {
        try {
            const user = await User.findOne({ user_id: req.params.id });
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Delete related data
            if (user.user_type === 'influencer') {
                await InfluencerProfile.findOneAndDelete({ user_id: user.user_id });
            } else if (user.user_type === 'brand') {
                await BrandProfile.findOneAndDelete({ user_id: user.user_id });
            }

            await CollaborationRequest.deleteMany({
                $or: [
                    { influencer_id: user.user_id },
                    { brand_id: user.user_id }
                ]
            });

            await ProfileViewStats.deleteMany({
                profile_id: user.user_id
            });

            await MediaUploads.deleteMany({
                user_id: user.user_id
            });

            await User.findByIdAndDelete(user._id);

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting user'
            });
        }
    }

    // Influencer Management
    static async getAllInfluencers(req, res) {
        try {
            const { q, category, verified, page = 1, limit = 10 } = req.query;
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

            if (verified !== undefined) {
                query.is_verified = verified === 'true';
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
            console.error('Error getting all influencers:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving influencers'
            });
        }
    }

    static async getInfluencerDetails(req, res) {
        try {
            const influencer = await InfluencerProfile.findOne({ user_id: req.params.id });
            
            if (!influencer) {
                return res.status(404).json({
                    success: false,
                    message: 'Influencer not found'
                });
            }

            const user = await User.findOne({ user_id: req.params.id }).select('-password');

            res.json({
                success: true,
                data: {
                    influencer,
                    user
                }
            });
        } catch (error) {
            console.error('Error getting influencer details:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving influencer details'
            });
        }
    }

    static async featureInfluencer(req, res) {
        try {
            const influencer = await InfluencerProfile.findOneAndUpdate(
                { user_id: req.params.id },
                { is_featured: true },
                { new: true }
            );

            if (!influencer) {
                return res.status(404).json({
                    success: false,
                    message: 'Influencer not found'
                });
            }

            res.json({
                success: true,
                message: 'Influencer featured successfully',
                data: influencer
            });
        } catch (error) {
            console.error('Error featuring influencer:', error);
            res.status(500).json({
                success: false,
                message: 'Error featuring influencer'
            });
        }
    }

    static async verifyInfluencer(req, res) {
        try {
            const influencer = await InfluencerProfile.findOneAndUpdate(
                { user_id: req.params.id },
                { is_verified: true },
                { new: true }
            );

            if (!influencer) {
                return res.status(404).json({
                    success: false,
                    message: 'Influencer not found'
                });
            }

            // Update user verification status
            await User.findOneAndUpdate(
                { user_id: req.params.id },
                { is_verified: true }
            );

            res.json({
                success: true,
                message: 'Influencer verified successfully',
                data: influencer
            });
        } catch (error) {
            console.error('Error verifying influencer:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying influencer'
            });
        }
    }

    static async getPendingVerifications(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const influencers = await InfluencerProfile.find({ is_verified: false })
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });

            const total = await InfluencerProfile.countDocuments({ is_verified: false });

            res.json({
                success: true,
                data: influencers,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting pending verifications:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving pending verifications'
            });
        }
    }

    // Brand Management
    static async getAllBrands(req, res) {
        try {
            const { q, industry, verified, page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            let query = {};

            if (q) {
                query.$or = [
                    { company_name: { $regex: q, $options: 'i' } },
                    { industry: { $regex: q, $options: 'i' } }
                ];
            }

            if (industry) {
                query.industry = industry;
            }

            if (verified !== undefined) {
                query.is_verified = verified === 'true';
            }

            const brands = await BrandProfile.find(query)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ created_at: -1 });

            const total = await BrandProfile.countDocuments(query);

            res.json({
                success: true,
                data: brands,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting all brands:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving brands'
            });
        }
    }

    static async getBrandDetails(req, res) {
        try {
            const brand = await BrandProfile.findOne({ user_id: req.params.id });
            
            if (!brand) {
                return res.status(404).json({
                    success: false,
                    message: 'Brand not found'
                });
            }

            const user = await User.findOne({ user_id: req.params.id }).select('-password');

            res.json({
                success: true,
                data: {
                    brand,
                    user
                }
            });
        } catch (error) {
            console.error('Error getting brand details:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving brand details'
            });
        }
    }

    static async verifyBrand(req, res) {
        try {
            const brand = await BrandProfile.findOneAndUpdate(
                { user_id: req.params.id },
                { is_verified: true },
                { new: true }
            );

            if (!brand) {
                return res.status(404).json({
                    success: false,
                    message: 'Brand not found'
                });
            }

            // Update user verification status
            await User.findOneAndUpdate(
                { user_id: req.params.id },
                { is_verified: true }
            );

            res.json({
                success: true,
                message: 'Brand verified successfully',
                data: brand
            });
        } catch (error) {
            console.error('Error verifying brand:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying brand'
            });
        }
    }

    static async getPendingBrandVerifications(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const brands = await BrandProfile.find({ is_verified: false })
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 });

            const total = await BrandProfile.countDocuments({ is_verified: false });

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
            console.error('Error getting pending brand verifications:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving pending brand verifications'
            });
        }
    }

    // Collaboration Management
    static async getAllCollaborations(req, res) {
        try {
            const { status, page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;

            let query = {};

            if (status) {
                query.status = status;
            }

            const collaborations = await CollaborationRequest.find(query)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ created_at: -1 });

            const total = await CollaborationRequest.countDocuments(query);

            res.json({
                success: true,
                data: collaborations,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting all collaborations:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving collaborations'
            });
        }
    }

    static async getCollaborationDetails(req, res) {
        try {
            const collaboration = await CollaborationRequest.findById(req.params.id);
            
            if (!collaboration) {
                return res.status(404).json({
                    success: false,
                    message: 'Collaboration not found'
                });
            }

            res.json({
                success: true,
                data: collaboration
            });
        } catch (error) {
            console.error('Error getting collaboration details:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving collaboration details'
            });
        }
    }

    static async updateCollaborationStatus(req, res) {
        try {
            const { status } = req.body;
            
            const collaboration = await CollaborationRequest.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );

            if (!collaboration) {
                return res.status(404).json({
                    success: false,
                    message: 'Collaboration not found'
                });
            }

            res.json({
                success: true,
                message: 'Collaboration status updated successfully',
                data: collaboration
            });
        } catch (error) {
            console.error('Error updating collaboration status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating collaboration status'
            });
        }
    }

    static async deleteCollaboration(req, res) {
        try {
            const collaboration = await CollaborationRequest.findByIdAndDelete(req.params.id);

            if (!collaboration) {
                return res.status(404).json({
                    success: false,
                    message: 'Collaboration not found'
                });
            }

            res.json({
                success: true,
                message: 'Collaboration deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting collaboration:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting collaboration'
            });
        }
    }

    // Analytics and Metrics
    static async getOverviewAnalytics(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const totalInfluencers = await InfluencerProfile.countDocuments();
            const totalBrands = await BrandProfile.countDocuments();
            const totalCollaborations = await CollaborationRequest.countDocuments();
            const pendingCollaborations = await CollaborationRequest.countDocuments({ status: 'pending' });
            const completedCollaborations = await CollaborationRequest.countDocuments({ status: 'completed' });

            // Get recent activity
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const newUsers = await User.countDocuments({ created_at: { $gte: thirtyDaysAgo } });
            const newInfluencers = await InfluencerProfile.countDocuments({ created_at: { $gte: thirtyDaysAgo } });
            const newBrands = await BrandProfile.countDocuments({ created_at: { $gte: thirtyDaysAgo } });

            const analytics = {
                total_users: totalUsers,
                total_influencers: totalInfluencers,
                total_brands: totalBrands,
                total_collaborations: totalCollaborations,
                pending_collaborations: pendingCollaborations,
                completed_collaborations: completedCollaborations,
                recent_activity: {
                    new_users: newUsers,
                    new_influencers: newInfluencers,
                    new_brands: newBrands
                }
            };

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Error getting overview analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving overview analytics'
            });
        }
    }

    static async getUserAnalytics(req, res) {
        try {
            const userTypes = await User.aggregate([
                { $group: { _id: '$user_type', count: { $sum: 1 } } }
            ]);

            const verificationStatus = await User.aggregate([
                { $group: { _id: '$is_verified', count: { $sum: 1 } } }
            ]);

            const profileCompletion = await User.aggregate([
                { $group: { _id: '$profile_completed', count: { $sum: 1 } } }
            ]);

            const analytics = {
                user_types: userTypes,
                verification_status: verificationStatus,
                profile_completion: profileCompletion
            };

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Error getting user analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving user analytics'
            });
        }
    }

    static async getCollaborationAnalytics(req, res) {
        try {
            const statusDistribution = await CollaborationRequest.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);

            const campaignTypes = await CollaborationRequest.aggregate([
                { $group: { _id: '$campaign_type', count: { $sum: 1 } } }
            ]);

            const monthlyTrends = await CollaborationRequest.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$created_at' },
                            month: { $month: '$created_at' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 12 }
            ]);

            const analytics = {
                status_distribution: statusDistribution,
                campaign_types: campaignTypes,
                monthly_trends: monthlyTrends
            };

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Error getting collaboration analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving collaboration analytics'
            });
        }
    }

    static async getRevenueAnalytics(req, res) {
        try {
            // Calculate revenue metrics based on collaboration budgets
            const revenueMetrics = await CollaborationRequest.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: null,
                        total_revenue: { $sum: '$budget.max' },
                        avg_budget: { $avg: '$budget.max' },
                        min_budget: { $min: '$budget.min' },
                        max_budget: { $max: '$budget.max' }
                    }
                }
            ]);

            const monthlyRevenue = await CollaborationRequest.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$created_at' },
                            month: { $month: '$created_at' }
                        },
                        revenue: { $sum: '$budget.max' }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 12 }
            ]);

            const analytics = {
                revenue_metrics: revenueMetrics[0] || {
                    total_revenue: 0,
                    avg_budget: 0,
                    min_budget: 0,
                    max_budget: 0
                },
                monthly_revenue: monthlyRevenue
            };

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Error getting revenue analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving revenue analytics'
            });
        }
    }

    static async getEngagementAnalytics(req, res) {
        try {
            const profileViews = await ProfileViewStats.aggregate([
                {
                    $group: {
                        _id: '$profile_type',
                        total_views: { $sum: '$total_views' },
                        unique_views: { $sum: '$unique_views' }
                    }
                }
            ]);

            const interactionMetrics = await ProfileViewStats.aggregate([
                {
                    $group: {
                        _id: null,
                        total_interactions: { $sum: { $cond: [{ $eq: ['$interactions.profile_clicked', true] }, 1, 0] } },
                        contact_clicks: { $sum: { $cond: [{ $eq: ['$interactions.contact_clicked', true] }, 1, 0] } },
                        collaboration_requests: { $sum: { $cond: [{ $eq: ['$interactions.collaboration_requested', true] }, 1, 0] } }
                    }
                }
            ]);

            const analytics = {
                profile_views: profileViews,
                interaction_metrics: interactionMetrics[0] || {
                    total_interactions: 0,
                    contact_clicks: 0,
                    collaboration_requests: 0
                }
            };

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Error getting engagement analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving engagement analytics'
            });
        }
    }

    // Dashboard Stats
    static async getDashboardStats(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const totalInfluencers = await InfluencerProfile.countDocuments();
            const totalBrands = await BrandProfile.countDocuments();
            const totalCollaborations = await CollaborationRequest.countDocuments();
            const pendingCollaborations = await CollaborationRequest.countDocuments({ status: 'pending' });

            // Get today's stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const newUsersToday = await User.countDocuments({ created_at: { $gte: today } });
            const newCollaborationsToday = await CollaborationRequest.countDocuments({ created_at: { $gte: today } });

            const stats = {
                total_users: totalUsers,
                total_influencers: totalInfluencers,
                total_brands: totalBrands,
                total_collaborations: totalCollaborations,
                pending_collaborations: pendingCollaborations,
                today: {
                    new_users: newUsersToday,
                    new_collaborations: newCollaborationsToday
                }
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

    static async getOnboardingStats(req, res) {
        try {
            const onboardingStats = await User.aggregate([
                {
                    $group: {
                        _id: '$user_type',
                        total: { $sum: 1 },
                        completed_profiles: { $sum: { $cond: ['$profile_completed', 1, 0] } },
                        verified_users: { $sum: { $cond: ['$is_verified', 1, 0] } }
                    }
                }
            ]);

            res.json({
                success: true,
                data: onboardingStats
            });
        } catch (error) {
            console.error('Error getting onboarding stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving onboarding stats'
            });
        }
    }

    static async getRetentionStats(req, res) {
        try {
            // Calculate retention metrics
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const activeUsers = await User.countDocuments({
                last_login: { $gte: thirtyDaysAgo }
            });

            const totalUsers = await User.countDocuments();
            const retentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

            const stats = {
                active_users: activeUsers,
                total_users: totalUsers,
                retention_rate: retentionRate
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting retention stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving retention stats'
            });
        }
    }

    static async getGrowthStats(req, res) {
        try {
            // Calculate growth metrics for last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlyGrowth = await User.aggregate([
                { $match: { created_at: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$created_at' },
                            month: { $month: '$created_at' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            const influencerGrowth = await InfluencerProfile.aggregate([
                { $match: { created_at: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$created_at' },
                            month: { $month: '$created_at' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            const brandGrowth = await BrandProfile.aggregate([
                { $match: { created_at: { $gte: sixMonthsAgo } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$created_at' },
                            month: { $month: '$created_at' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            const stats = {
                monthly_growth: monthlyGrowth,
                influencer_growth: influencerGrowth,
                brand_growth: brandGrowth
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting growth stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving growth stats'
            });
        }
    }

    // Additional methods for routes
    static async getPlatformStats(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const totalInfluencers = await InfluencerProfile.countDocuments();
            const totalBrands = await BrandProfile.countDocuments();
            const totalCollaborations = await CollaborationRequest.countDocuments();

            const stats = {
                total_users: totalUsers,
                total_influencers: totalInfluencers,
                total_brands: totalBrands,
                total_collaborations: totalCollaborations,
                platform_health: 'healthy',
                uptime: process.uptime()
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting platform stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving platform stats'
            });
        }
    }

    static async getContentForModeration(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Mock content for moderation - in real app, this would come from a content collection
            const content = [];

            res.json({
                success: true,
                data: content,
                pagination: {
                    page,
                    limit,
                    total: content.length,
                    pages: Math.ceil(content.length / limit)
                }
            });
        } catch (error) {
            console.error('Error getting content for moderation:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving content for moderation'
            });
        }
    }

    static async approveContent(req, res) {
        try {
            const { id } = req.params;
            
            // In real app, approve content in database
            res.json({
                success: true,
                message: 'Content approved successfully'
            });
        } catch (error) {
            console.error('Error approving content:', error);
            res.status(500).json({
                success: false,
                message: 'Error approving content'
            });
        }
    }

    static async rejectContent(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            
            // In real app, reject content in database
            res.json({
                success: true,
                message: 'Content rejected successfully'
            });
        } catch (error) {
            console.error('Error rejecting content:', error);
            res.status(500).json({
                success: false,
                message: 'Error rejecting content'
            });
        }
    }

    static async getSystemSettings(req, res) {
        try {
            const settings = {
                platform: {
                    name: 'TheInfluencer.in',
                    version: '1.0.0',
                    maintenance_mode: false
                },
                features: {
                    influencer_verification: true,
                    brand_verification: true,
                    content_moderation: true,
                    analytics: true
                },
                limits: {
                    max_file_size: 10 * 1024 * 1024, // 10MB
                    max_files_per_upload: 5,
                    max_collaboration_requests: 100
                }
            };

            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Error getting system settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving system settings'
            });
        }
    }

    static async updateSystemSettings(req, res) {
        try {
            const { platform, features, limits } = req.body;
            
            // In real app, update system settings in database
            res.json({
                success: true,
                message: 'System settings updated successfully'
            });
        } catch (error) {
            console.error('Error updating system settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating system settings'
            });
        }
    }

    static async getNotifications(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Mock admin notifications - in real app, this would come from a notifications collection
            const notifications = [
                {
                    id: 1,
                    type: 'system_alert',
                    title: 'System Alert',
                    message: 'High server load detected',
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
            // In real app, update all notifications for admin
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

    static async createBackup(req, res) {
        try {
            // In real app, create system backup
            res.json({
                success: true,
                message: 'Backup created successfully',
                data: {
                    backup_id: 'backup_' + Date.now(),
                    created_at: new Date()
                }
            });
        } catch (error) {
            console.error('Error creating backup:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating backup'
            });
        }
    }

    static async getBackupList(req, res) {
        try {
            // Mock backup list - in real app, this would come from a backups collection
            const backups = [
                {
                    id: 'backup_1234567890',
                    created_at: new Date(),
                    size: '1.2GB',
                    status: 'completed'
                }
            ];

            res.json({
                success: true,
                data: backups
            });
        } catch (error) {
            console.error('Error getting backup list:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving backup list'
            });
        }
    }

    static async downloadBackup(req, res) {
        try {
            const { id } = req.params;
            
            // In real app, generate download link for backup
            res.json({
                success: true,
                data: {
                    download_url: `/api/admin/backup/${id}/file`,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                }
            });
        } catch (error) {
            console.error('Error downloading backup:', error);
            res.status(500).json({
                success: false,
                message: 'Error downloading backup'
            });
        }
    }

    static async getSystemLogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const level = req.query.level || 'all';

            // Mock system logs - in real app, this would come from a logs collection
            const logs = [
                {
                    id: 1,
                    level: 'info',
                    message: 'Server started successfully',
                    timestamp: new Date(),
                    source: 'server'
                }
            ];

            res.json({
                success: true,
                data: logs,
                pagination: {
                    page,
                    limit,
                    total: logs.length,
                    pages: Math.ceil(logs.length / limit)
                }
            });
        } catch (error) {
            console.error('Error getting system logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving system logs'
            });
        }
    }

    static async clearSystemLogs(req, res) {
        try {
            // In real app, clear system logs
            res.json({
                success: true,
                message: 'System logs cleared successfully'
            });
        } catch (error) {
            console.error('Error clearing system logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error clearing system logs'
            });
        }
    }
}

module.exports = AdminController; 