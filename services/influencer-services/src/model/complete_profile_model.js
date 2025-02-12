const mongoose = require('mongoose');

const InfluencerProfileSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true, ref: 'User' },
    phone_number: { type: String, required: true },
    bio: { type: String, required: true },
    profile_picture: { type: String },
    social_media_links: {
        instagram: { type: String },
        youtube: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        facebook: { type: String },
        
    },
    followers_count: {
        instagram: { type: Number, default: 0 },
        youtube: { type: Number, default: 0 },
        twitter: { type: Number, default: 0 },
        linkedin: { type: Number, default: 0 },
        facebook: { type: Number, default: 0 },
        
    },
    engagement_rate: {
        instagram: { type: Number, default: 0 },
        youtube: { type: Number, default: 0 },
        twitter: { type: Number, default: 0 },
        linkedin: { type: Number, default: 0 },
        facebook: { type: Number, default: 0 },
        
    },
    verification_documents: [{ type: String }], 
    mentorship_sessions: {
        free_sessions: { type: Boolean, default: false },
        scheduled_sessions: [{
            date: { type: Date },
            time: { type: String },
            topic: { type: String },
            attendees: [{ type: Number, ref: 'User' }],
        }]
    },
    availability_schedule: [{
        // e.g., "Monday"
        day: { type: String }, 
        // "10:00 AM"
        start_time: { type: String }, 
        // "5:00 PM"
        end_time: { type: String } 
    }],
    accepted_requests: [{
        user_id: { type: Number, ref: 'User' },
        chat_or_mentorship: { type: String, enum: ['chat', 'mentorship'] },
        agreed_time: { type: DateTime }
    }],
}, { timestamps: true });

module.exports = mongoose.model('InfluencerProfile', InfluencerProfileSchema);
