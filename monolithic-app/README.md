# TheInfluencer.in - Monolithic Backend

A comprehensive backend system for the influencer marketing platform built with Node.js, Express.js, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Email verification with OTP
- Password reset functionality
- Secure password hashing with bcrypt

### Influencer Features
- Complete profile management
- Portfolio uploads (images/videos)
- Social media integration
- Analytics and insights
- Collaboration request management
- Brand discovery and interaction

### Brand Features
- Company profile creation
- Influencer discovery and search
- Collaboration request sending
- Campaign management
- Analytics dashboard

### Admin Features
- User management
- Platform analytics
- Content moderation
- System settings

### Technical Features
- RESTful API design
- Comprehensive API documentation (Swagger)
- File uploads with AWS S3
- Email notifications with AWS SES
- Rate limiting and security headers
- Input validation and error handling

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Email Service**: AWS SES
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, Rate Limiting
- **Validation**: Express-validator

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd monolithic-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/theinfluencer
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   COOKIE_EXPIRES=7d
   
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=theinfluencer-uploads
   SES_EMAIL=your-verified-ses-email@domain.com
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/send-verification-otp` - Send verification OTP
- `POST /api/auth/verify-otp` - Verify account with OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### Influencer Routes
- `GET /api/influencer/profile` - Get profile
- `PUT /api/influencer/profile` - Update profile
- `POST /api/influencer/portfolio` - Upload portfolio
- `GET /api/influencer/analytics` - Get analytics
- `GET /api/influencer/requests` - Get collaboration requests
- `PUT /api/influencer/requests/:id/respond` - Respond to request

### Brand Routes
- `GET /api/brand/profile` - Get profile
- `PUT /api/brand/profile` - Update profile
- `GET /api/brand/explore` - Explore influencers
- `POST /api/brand/requests` - Send collaboration request
- `GET /api/brand/requests` - Get sent requests

### Admin Routes
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Platform analytics

## 🗃 Database Models

### Core Models
- **User**: Authentication and basic user info
- **InfluencerProfile**: Detailed influencer information
- **BrandProfile**: Company and brand details
- **CollaborationRequest**: Collaboration requests between brands and influencers
- **ProfileViewStats**: Analytics for profile views
- **MediaUploads**: File upload metadata

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for different user types
- **Password Hashing**: Bcrypt for secure password storage
- **Rate Limiting**: Protection against DDoS attacks
- **Security Headers**: Helmet for additional security
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configurable cross-origin resource sharing

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Centralized error handling
- **Health Checks**: `/health` endpoint for monitoring

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Prerequisites
- Node.js 16+ 
- MongoDB instance
- AWS account (for S3 and SES)

### Environment Variables
Make sure all required environment variables are set in your production environment.

### PM2 (Recommended for production)
```bash
npm install -g pm2
pm2 start server.js --name "theinfluencer-api"
pm2 save
pm2 startup
```

## 📁 Project Structure

```
monolithic-app/
├── src/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── aws/              # AWS configurations
│   ├── types/            # Type definitions
│   └── config/           # Configuration files
├── server.js             # Main application file
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@theinfluencer.in
- Documentation: `/api-docs` when server is running
