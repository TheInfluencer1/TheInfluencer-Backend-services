const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Influencer Profile Validation
const validateInfluencerProfile = [
    body('full_name.first_name').notEmpty().withMessage('First name is required'),
    body('full_name.last_name').notEmpty().withMessage('Last name is required'),
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('primary_social_media').isArray().withMessage('Primary social media must be an array'),
    body('content_categories').isArray().withMessage('Content categories must be an array'),
    body('preferred_content_types').isArray().withMessage('Preferred content types must be an array'),
    body('languages').isArray().withMessage('Languages must be an array'),
    body('minimum_budget').isNumeric().withMessage('Minimum budget must be a number'),
    handleValidationErrors
];

// Brand Profile Validation
const validateBrandProfile = [
    body('company_name').notEmpty().withMessage('Company name is required'),
    body('industry').notEmpty().withMessage('Industry is required'),
    body('contact_person.name').notEmpty().withMessage('Contact person name is required'),
    body('contact_person.position').notEmpty().withMessage('Contact person position is required'),
    body('contact_person.email').isEmail().withMessage('Valid contact email is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('target_audience').isArray().withMessage('Target audience must be an array'),
    body('content_categories').isArray().withMessage('Content categories must be an array'),
    handleValidationErrors
];

// Collaboration Request Validation
const validateCollaborationRequest = [
    body('influencer_id').isNumeric().withMessage('Influencer ID must be a number'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('campaign_type').notEmpty().withMessage('Campaign type is required'),
    body('budget.min').isNumeric().withMessage('Minimum budget must be a number'),
    body('budget.max').isNumeric().withMessage('Maximum budget must be a number'),
    body('budget.currency').notEmpty().withMessage('Currency is required'),
    body('timeline.start_date').isISO8601().withMessage('Valid start date is required'),
    body('timeline.end_date').isISO8601().withMessage('Valid end date is required'),
    handleValidationErrors
];

// Pagination Validation
const validatePagination = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

// Search Validation
const validateSearch = [
    query('q').optional().isString().withMessage('Search query must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('min_followers').optional().isInt({ min: 0 }).withMessage('Min followers must be a positive integer'),
    query('max_followers').optional().isInt({ min: 0 }).withMessage('Max followers must be a positive integer'),
    query('budget_min').optional().isInt({ min: 0 }).withMessage('Budget min must be a positive integer'),
    query('budget_max').optional().isInt({ min: 0 }).withMessage('Budget max must be a positive integer'),
    handleValidationErrors
];

// ID Parameter Validation
const validateId = [
    param('id').isMongoId().withMessage('Invalid ID format'),
    handleValidationErrors
];

// File Upload Validation
const validateFileUpload = [
    body('media_type').isIn(['portfolio_image', 'portfolio_video', 'company_logo', 'company_image']).withMessage('Invalid media type'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('tags').optional().isString().withMessage('Tags must be a JSON string'),
    handleValidationErrors
];

// Response Validation
const validateResponse = [
    body('message').notEmpty().withMessage('Message is required'),
    handleValidationErrors
];

// User Update Validation
const validateUserUpdate = [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('user_type').optional().isIn(['influencer', 'brand', 'admin']).withMessage('Invalid user type'),
    handleValidationErrors
];

// Status Update Validation
const validateStatusUpdate = [
    body('status').isIn(['active', 'inactive', 'pending', 'accepted', 'rejected', 'expired', 'completed']).withMessage('Invalid status'),
    handleValidationErrors
];

module.exports = {
    validateInfluencerProfile,
    validateBrandProfile,
    validateCollaborationRequest,
    validatePagination,
    validateSearch,
    validateId,
    validateFileUpload,
    validateResponse,
    validateUserUpdate,
    validateStatusUpdate
}; 