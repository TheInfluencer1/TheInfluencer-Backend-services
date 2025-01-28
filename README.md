# The Influencer Backend - Microservices Architecture

## Overview
This repository contains a microservices-based architecture for "The Influencer Backend." The setup uses Node.js, MongoDB, and Docker for seamless deployment and scalability.

---

## Folder Structure
```
THE_INFLUENCER_BACKEND/
│── config/                  # Global configuration
│   ├── logs/                # Log files
│   ├── db.js                # Database connection
│   ├── env.js               # Environment variables
│
│── services/                # All microservices
│   │── auth-service/        # Authentication Service
│   │── user-service/        # User Management Service
│   │── admin-service/       # Admin Management Service
│
│── .gitignore
│── docker-compose.yml       # Docker Compose setup
│── package.json             # Root dependencies
│── README.md                # Documentation
```

---

## Microservices
### Authentication Service (`auth-service`)
- Handles JWT-based authentication.
- Supports user registration, login, and password reset.

### User Service (`user-service`)
- Manages user profiles and roles.

### Admin Service (`admin-service`)
- Provides administrative tools and moderation capabilities.

---

## Docker Compose Setup
This project uses Docker Compose to manage microservices.

### **Run All Services**
```sh
docker-compose up --build -d
```

### **Check Running Containers**
```sh
docker ps
```

### **Stop Services**
```sh
docker-compose down
```

---

## Environment Variables (`.env`)
Each microservice has its own `.env` file. Example for `auth-service`:
```env
PORT=5001
MONGO_URI=mongodb://mongodb:27017/influencerDB
JWT_SECRET=your-secret-key
```

---

## Best Practices
- Use `.env` files for sensitive credentials.
- Follow the MVC pattern for service organization.
- Implement JWT-based authentication for security.
- Use Docker Compose for containerized deployments.

---

## Future Enhancements
- Implement an API Gateway for unified access.
- Add Redis caching for performance optimization.
- Deploy using Kubernetes for better scalability.

---

## Conclusion
This repository provides a structured microservices-based architecture for "The Influencer Backend." The setup ensures modularity, maintainability, and scalability. Contributions and improvements are welcome!

---

### 📌 Author
**Aniket Kumar** 🚀
