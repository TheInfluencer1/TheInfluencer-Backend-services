const mongoose = require('mongoose');

const InfluencerProfileSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true, ref: 'User' },

    // Personal Information
    full_name: {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true }
    },
    address: {
        street_address: { type: String, required: true },
        street_address_line2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postal_code: { type: String, required: true }
    },
    phone_number: { type: String, required: true },
    email: { type: String, required: true },

    // Social Media Information
    primary_social_media: [{
        type: String,
        enum: ['Instagram', 'Youtube', 'Linkedin', 'X']
    }],
    
    social_media_details: {
        instagram: {
            handle: { type: String },
            follower_count: { type: Number },
            engagement_rate: { type: String }
        },
        youtube: {
            channel_name: { type: String },
            subscriber_count: { type: Number }
        },
        x: {
            username: { type: String },
            follower_count: { type: Number }
        },
        linkedin: {
            username: { type: String },
            follower_count: { type: Number }
        }
    },

    // Content Categories
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
    other_content_category: { type: String },

    // Content Type Preferences
    preferred_content_types: [{
        type: String,
        enum: ['Reels', 'Stories', 'Youtube Videos', 'Text Based Posts', 'Other']
    }],
    other_content_type: { type: String },

    // Content Language
    languages: [{ type: String }],

    // Collaboration Details
    past_brand_collaborations: { type: Boolean },
    collaboration_preferences: [{
        type: String,
        enum: [
            'Sponsored Content & Promotions',
            'Product Engagement & Reviews',
            'Event & Live Collaborations',
            'Content Creation & Brand Partnerships'
        ]
    }],
    minimum_budget: { type: Number },
    availability: [{
        type: String,
        enum: ['Full Time', 'Part Time', 'Occasional']
    }],

    suggestions: { type: String },
    profile_image: {
        url: { type: String },
        key: { type: String }, // S3 object key
    },
    portfolio_images: [{
        url: { type: String },
        key: { type: String },
        description: { type: String }
    }],

}, { timestamps: true });

module.exports = mongoose.model('InfluencerProfile', InfluencerProfileSchema); 