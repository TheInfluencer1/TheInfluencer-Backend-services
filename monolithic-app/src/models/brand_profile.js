const mongoose = require('mongoose');

const BrandProfileSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true, ref: 'User' },
    
    // Company Information
    company_name: { type: String, required: true },
    industry: { type: String, required: true },
    company_size: {
        type: String,
        enum: ['Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)']
    },
    
    // Contact Information
    contact_person: {
        name: { type: String, required: true },
        position: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String }
    },
    
    // Company Details
    website: { type: String },
    description: { type: String, required: true },
    mission_statement: { type: String },
    
    // Social Media
    social_media: {
        instagram: { type: String },
        facebook: { type: String },
        twitter: { type: String },
        linkedin: { type: String }
    },
    
    // Brand Preferences
    target_audience: [{
        type: String,
        enum: [
            'Gen Z (18-24)',
            'Millennials (25-40)',
            'Gen X (41-56)',
            'Baby Boomers (57-75)',
            'All Ages'
        ]
    }],
    
    content_categories: [{
        type: String,
        enum: [
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
        ]
    }],
    
    // Budget and Preferences
    budget_range: {
        min: { type: Number },
        max: { type: Number }
    },
    
    preferred_content_types: [{
        type: String,
        enum: ['Reels', 'Stories', 'Youtube Videos', 'Text Based Posts', 'Live Streams', 'Podcasts']
    }],
    
    // Company Assets
    logo: {
        url: { type: String },
        key: { type: String }
    },
    
    company_images: [{
        url: { type: String },
        key: { type: String },
        description: { type: String }
    }],
    
    // Verification
    is_verified: { type: Boolean, default: false },
    verification_documents: [{
        type: { type: String },
        url: { type: String },
        key: { type: String },
        uploaded_at: { type: Date, default: Date.now }
    }],
    
    // Analytics
    profile_views: { type: Number, default: 0 },
    total_collaborations: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    
    // Settings
    is_public: { type: Boolean, default: true },
    auto_approve_requests: { type: Boolean, default: false }
    
}, { timestamps: true });

module.exports = mongoose.model('BrandProfile', BrandProfileSchema); 