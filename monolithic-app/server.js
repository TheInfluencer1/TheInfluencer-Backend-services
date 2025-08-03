const { connectDB } = require("./src/utils/db");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Import routes
const authRouter = require("./src/routes/auth");
const influencerRouter = require("./src/routes/influencer.routes");
const brandRouter = require("./src/routes/brand.routes");
const adminRouter = require("./src/routes/admin.routes");

// Configure environment variables
dotenv.config();

// Connect to database
connectDB(process.env.MONGODB_URI || process.env.DB_URI_INFLUENCER);

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // HTTP request logger

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TheInfluencer.in API',
            version: '1.0.0',
            description: 'API documentation for the influencer marketing platform',
            contact: {
                name: 'API Support',
                email: 'support@theinfluencer.in'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 8000}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'number' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        user_type: { type: 'string', enum: ['influencer', 'brand', 'admin'] },
                        is_verified: { type: 'boolean' },
                        is_active: { type: 'boolean' },
                        profile_completed: { type: 'boolean' }
                    }
                },
                InfluencerProfile: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'number' },
                        full_name: {
                            type: 'object',
                            properties: {
                                first_name: { type: 'string' },
                                last_name: { type: 'string' }
                            }
                        },
                        content_categories: { type: 'array', items: { type: 'string' } },
                        primary_social_media: { type: 'array', items: { type: 'string' } },
                        minimum_budget: { type: 'number' },
                        is_verified: { type: 'boolean' }
                    }
                },
                BrandProfile: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'number' },
                        company_name: { type: 'string' },
                        industry: { type: 'string' },
                        description: { type: 'string' },
                        target_audience: { type: 'array', items: { type: 'string' } },
                        is_verified: { type: 'boolean' }
                    }
                },
                CollaborationRequest: {
                    type: 'object',
                    properties: {
                        brand_id: { type: 'number' },
                        influencer_id: { type: 'number' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        message: { type: 'string' },
                        campaign_type: { type: 'string' },
                        budget: {
                            type: 'object',
                            properties: {
                                min: { type: 'number' },
                                max: { type: 'number' },
                                currency: { type: 'string' }
                            }
                        },
                        status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'expired', 'completed'] }
                    }
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'Authentication endpoints' },
            { name: 'Influencer', description: 'Influencer-specific endpoints' },
            { name: 'Brand', description: 'Brand-specific endpoints' },
            { name: 'Admin', description: 'Admin management endpoints' }
        ]
    },
    apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(swaggerOptions);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/influencer', influencerRouter);
app.use('/api/brand', brandRouter);
app.use('/api/admin', adminRouter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'TheInfluencer.in API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to TheInfluencer.in API',
        documentation: '/api-docs',
        health: '/health'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app; 