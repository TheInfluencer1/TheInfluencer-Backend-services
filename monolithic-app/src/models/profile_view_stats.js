const mongoose = require('mongoose');

const ProfileViewStatsSchema = new mongoose.Schema({
    profile_id: { type: Number, required: true }, // user_id of the profile owner
    profile_type: { 
        type: String, 
        enum: ['influencer', 'brand'], 
        required: true 
    },
    
    // View Statistics
    total_views: { type: Number, default: 0 },
    unique_views: { type: Number, default: 0 },
    
    // Viewer Information
    viewer_id: { type: Number }, // user_id of the viewer
    viewer_type: { 
        type: String, 
        enum: ['influencer', 'brand', 'admin', 'anonymous'] 
    },
    
    // View Details
    view_date: { type: Date, default: Date.now },
    session_duration: { type: Number }, // in seconds
    pages_viewed: [String], // which sections were viewed
    
    // Interaction Data
    interactions: {
        profile_clicked: { type: Boolean, default: false },
        contact_clicked: { type: Boolean, default: false },
        portfolio_viewed: { type: Boolean, default: false },
        collaboration_requested: { type: Boolean, default: false }
    },
    
    // Geographic Data
    location: {
        country: String,
        city: String,
        ip_address: String
    },
    
    // Device Information
    device: {
        type: { type: String, enum: ['mobile', 'desktop', 'tablet'] },
        browser: String,
        os: String
    },
    
    // Referral Information
    referrer: {
        source: String, // 'search', 'social', 'direct', 'email', 'other'
        url: String,
        campaign: String
    }
    
}, { timestamps: true });

// Indexes for efficient queries
ProfileViewStatsSchema.index({ profile_id: 1, profile_type: 1 });
ProfileViewStatsSchema.index({ view_date: -1 });
ProfileViewStatsSchema.index({ viewer_id: 1, profile_id: 1 });

module.exports = mongoose.model('ProfileViewStats', ProfileViewStatsSchema); 