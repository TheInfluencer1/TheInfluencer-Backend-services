const mongoose = require('mongoose');

const MediaUploadsSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, ref: 'User' },
    profile_type: { 
        type: String, 
        enum: ['influencer', 'brand'], 
        required: true 
    },
    
    // File Information
    file_name: { type: String, required: true },
    original_name: { type: String, required: true },
    file_type: { type: String, required: true }, // image, video, document
    mime_type: { type: String, required: true },
    file_size: { type: Number, required: true }, // in bytes
    
    // Storage Information
    url: { type: String, required: true },
    key: { type: String, required: true }, // S3 object key
    bucket: { type: String, required: true },
    
    // Media Details
    media_type: {
        type: String,
        enum: [
            'profile_image',
            'portfolio_image',
            'portfolio_video',
            'company_logo',
            'company_image',
            'verification_document',
            'campaign_attachment',
            'other'
        ],
        required: true
    },
    
    // Image/Video Specific Data
    dimensions: {
        width: Number,
        height: Number
    },
    duration: Number, // for videos, in seconds
    thumbnail_url: String,
    
    // Metadata
    description: String,
    tags: [String],
    is_public: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    
    // Usage Information
    usage_count: { type: Number, default: 0 },
    last_used: { type: Date },
    
    // Processing Status
    processing_status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    
    // Security
    is_verified: { type: Boolean, default: false },
    virus_scan_status: {
        type: String,
        enum: ['pending', 'clean', 'infected', 'failed'],
        default: 'pending'
    },
    
    // Analytics
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    
    // Expiration (for temporary files)
    expires_at: Date,
    
    // Error Information
    error_message: String,
    retry_count: { type: Number, default: 0 }
    
}, { timestamps: true });

// Indexes for efficient queries
MediaUploadsSchema.index({ user_id: 1, profile_type: 1 });
MediaUploadsSchema.index({ media_type: 1 });
MediaUploadsSchema.index({ created_at: -1 });
MediaUploadsSchema.index({ is_public: 1, is_featured: 1 });

module.exports = mongoose.model('MediaUploads', MediaUploadsSchema); 