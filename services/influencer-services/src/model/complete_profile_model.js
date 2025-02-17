const mongoose = require('mongoose');

const InfluencerProfileSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true, ref: 'User' },

    full_name: { type: String, required: true },  
    email: { type: String, required: true, unique: true }, 
    phone_number: { type: String, default: "" },
    bio: { type: String, default: "This is my influencer bio." },
    profile_picture: { type: String, default: "" },
    
    social_media_links: {
        instagram: { type: String, default: "" },
        youtube: { type: String, default: "" },
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        facebook: { type: String, default: "" }
    },
    
    followers_count: {
        instagram: { type: Number, default: 0 },
        youtube: { type: Number, default: 0 },
        twitter: { type: Number, default: 0 },
        linkedin: { type: Number, default: 0 },
        facebook: { type: Number, default: 0 }
    },
    
    engagement_rate: {
        instagram: { type: Number, default: 0 },
        youtube: { type: Number, default: 0 },
        twitter: { type: Number, default: 0 },
        linkedin: { type: Number, default: 0 },
        facebook: { type: Number, default: 0 }
    },

    // Influencer niche e.g., Tech, Fashion, Fitness, etc.
    categories: [{ type: String, default: [] }], 
    
    verification_documents: [{ type: String, default: [] }], 
    
    achievements: [{ type: String, default: [] }], 

    mentorship_sessions: {
        free_sessions: { type: Boolean, default: false },
        scheduled_sessions: [{
            date: { type: Date },
            time: { type: String },
            topic: { type: String },
            attendees: [{ type: Number, ref: 'User' }]
        }]
    },

    availability_schedule: [{
        day: { type: String }, // e.g., "Monday"
        start_time: { type: String }, // e.g., "10:00 AM"
        end_time: { type: String } // e.g., "5:00 PM"
    }],

    accepted_requests: [{
        user_id: { type: Number, ref: 'User' },
        chat_or_mentorship: { type: String, enum: ['chat', 'mentorship'] },
        agreed_time: { type: Date }
    }],

    pricing: { 
        one_on_one_session: { type: Number, default: 0 }, 
        brand_collaboration: { 
            starting_price: { type: Number, default: 0 },
            negotiable: { type: Boolean, default: false }
        } 
    },

    past_collaborations: [{ 
        brand_name: { type: String }, 
        campaign_details: { type: String } 
    }],

    reviews: [{
        user_id: { type: Number, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        review_text: { type: String },
        date: { type: Date, default: Date.now }
    }],

    location: {
        longitude: { type: Number, default: 0 }, 
        latitude: { type: Number, default: 0 } 
    },

    is_verified: { type: Boolean, default: false } 

}, { timestamps: true });

module.exports = mongoose.model('InfluencerProfile', InfluencerProfileSchema);
