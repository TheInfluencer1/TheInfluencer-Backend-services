const mongoose = require('mongoose');

const CollaborationRequestSchema = new mongoose.Schema({
    brand_id: { type: Number, required: true, ref: 'User' },
    influencer_id: { type: Number, required: true, ref: 'User' },
    
    // Request Details
    title: { type: String, required: true },
    description: { type: String, required: true },
    message: { type: String, required: true },
    
    // Campaign Details
    campaign_type: {
        type: String,
        enum: [
            'Sponsored Content',
            'Product Review',
            'Brand Ambassador',
            'Event Promotion',
            'Live Stream',
            'Story/Reel Creation',
            'Long-term Partnership',
            'One-time Collaboration'
        ],
        required: true
    },
    
    // Budget and Timeline
    budget: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        currency: { type: String, default: 'USD' }
    },
    
    timeline: {
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        is_flexible: { type: Boolean, default: false }
    },
    
    // Content Requirements
    content_requirements: {
        platforms: [{
            type: String,
            enum: ['Instagram', 'Youtube', 'TikTok', 'LinkedIn', 'Twitter', 'Facebook']
        }],
        content_types: [{
            type: String,
            enum: ['Posts', 'Stories', 'Reels', 'Videos', 'Live Streams', 'Blog Posts']
        }],
        deliverables: [String],
        brand_guidelines: String
    },
    
    // Status and Response
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired', 'completed'],
        default: 'pending'
    },
    
    response: {
        influencer_response: {
            message: String,
            counter_offer: {
                budget: Number,
                timeline: {
                    start_date: Date,
                    end_date: Date
                }
            },
            responded_at: Date
        },
        brand_response: {
            message: String,
            responded_at: Date
        }
    },
    
    // Analytics
    viewed_at: { type: Date },
    response_time: { type: Number }, // in hours
    
    // Metadata
    is_urgent: { type: Boolean, default: false },
    is_featured: { type: Boolean, default: false },
    tags: [String],
    
    // Files and Attachments
    attachments: [{
        name: String,
        url: String,
        key: String,
        uploaded_at: { type: Date, default: Date.now }
    }]
    
}, { timestamps: true });

// Index for efficient queries
CollaborationRequestSchema.index({ brand_id: 1, influencer_id: 1 });
CollaborationRequestSchema.index({ status: 1, created_at: -1 });
CollaborationRequestSchema.index({ influencer_id: 1, status: 1 });

module.exports = mongoose.model('CollaborationRequest', CollaborationRequestSchema); 