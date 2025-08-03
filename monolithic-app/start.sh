#!/bin/bash

echo "🚀 Starting TheInfluencer.in Monolithic Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Please create one with required environment variables."
    echo "📝 Example .env file:"
    echo "PORT=5000"
    echo "MONGODB_URI=mongodb://localhost:27017/theinfluencer"
    echo "JWT_SECRET=your-super-secret-jwt-key"
    echo "AWS_ACCESS_KEY_ID=your-aws-access-key"
    echo "AWS_SECRET_ACCESS_KEY=your-aws-secret-key"
    echo "AWS_REGION=us-east-1"
    echo "AWS_S3_BUCKET=theinfluencer-uploads"
    echo "SES_EMAIL=your-verified-ses-email@domain.com"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB before running the application."
    fi
else
    echo "⚠️  MongoDB not found. Please install MongoDB or use a cloud database."
fi

# Start the application
echo "🎯 Starting the application..."
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Running in production mode..."
    npm start
else
    echo "🔧 Running in development mode..."
    npm run dev
fi 