# StudySync 📚

A modern, real-time collaborative study platform that enables students to create virtual study rooms, share educational materials, and communicate seamlessly. StudySync combines PDF sharing capabilities with instant messaging to enhance the collaborative learning experience.

<div align="center">

![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)
![Node Version](https://img.shields.io/badge/Node-18%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Socket Events](#socket-events)
- [Database Models](#database-models)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Future Roadmap](#future-roadmap)
- [License](#license)

---

## ✨ Features

### Core Features (Backend - Complete)
- 🔐 **Secure Authentication** - JWT-based user authentication with bcryptjs password hashing
- 🏠 **Room Management** - Create, join, and manage collaborative study rooms with unique room codes
- 💬 **Real-time Chat** - Socket.io powered instant messaging with active user tracking
- 📄 **PDF Sharing** - Upload and manage educational PDFs with metadata tracking
- 👥 **User Management** - User profiles with email validation and session management
- 🔒 **Protected Routes** - All endpoints secured with JWT middleware

### Frontend (In Development)
- 🎨 Responsive React UI
- 📱 Mobile-first design
- 🎯 Intuitive room navigation
- 👤 User profile management
- 📊 Real-time collaboration indicators

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 5.2.1 | Web framework |
| **Socket.io** | 4.8.3 | Real-time communication |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | 9.0.2 | MongoDB ODM |
| **JWT** | 9.0.3 | Authentication tokens |
| **bcryptjs** | 3.0.3 | Password hashing |
| **Multer** | 2.0.2 | File upload handling |
| **CORS** | 2.8.5 | Cross-origin requests |
| **Dotenv** | 17.2.3 | Environment variables |

### Development Tools
- **Nodemon** - Auto-reload during development
- **Git** - Version control
- **npm** - Package management

### Frontend (Planned)
- React 18+
- Vite
- Tailwind CSS / Material-UI
- Socket.io Client
- React Router

---

## 🏗️ Architecture

```
Client Layer (React Frontend)
        ↓
API Gateway (Express + CORS)
        ↓
├── HTTP Routes (REST API)
│   ├── Authentication
│   ├── Room Management
│   ├── Chat History
│   └── PDF Management
│
├── WebSocket (Socket.io)
│   ├── Real-time Messages
│   ├── User Presence
│   └── Room Events
│
Data Layer (MongoDB)
└── User Profiles
    ├── Room Data
    ├── Messages
    └── PDF Metadata
```

---

## 📦 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (Local or Atlas Cloud)
- **Git**

### System Requirements
- RAM: Minimum 512MB
- Storage: Minimum 1GB
- Internet connection for MongoDB Atlas (if using cloud)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/StudySync.git
cd StudySync
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Create Environment File

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/studysync

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Frontend Setup (When Ready)

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `PORT` | number | Server port | 5000 |
| `NODE_ENV` | string | Environment (development/production) | development |
| `MONGO_URI` | string | MongoDB connection string | mongodb+srv://... |
| `JWT_SECRET` | string | Secret key for JWT signing | your_secret_key |
| `CORS_ORIGIN` | string | Allowed CORS origin | http://localhost:3000 |

### MongoDB Connection

**Local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/studysync
```

**MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to `.env` file

---

## 🎯 Running the Application

### Development Mode

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000` with auto-reload enabled.

### Production Mode

```bash
cd backend
npm start
```

### Test Socket Connection

```bash
node socket-test.js
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": ""
}
```

---

### Room Endpoints

#### Create Room
```http
POST /rooms/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Physics Study Group"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Physics Study Group",
  "roomCode": "ABC123XYZ",
  "head": "507f1f77bcf86cd799439012",
  "members": ["507f1f77bcf86cd799439012"],
  "activePdf": null,
  "createdAt": "2024-05-16T10:30:00.000Z"
}
```

#### Join Room
```http
POST /rooms/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomCode": "ABC123XYZ"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Physics Study Group",
  "roomCode": "ABC123XYZ",
  "head": "507f1f77bcf86cd799439012",
  "members": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "activePdf": null
}
```

#### Get Room Details
```http
GET /rooms/:roomId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Physics Study Group",
  "roomCode": "ABC123XYZ",
  "head": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "members": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "activePdf": null,
  "createdAt": "2024-05-16T10:30:00.000Z"
}
```

---

### Chat Endpoints

#### Get Room Messages
```http
GET /chat/:roomId
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "roomId": "507f1f77bcf86cd799439011",
    "sender": "507f1f77bcf86cd799439012",
    "senderName": "John Doe",
    "text": "Who's ready to study?",
    "createdAt": "2024-05-16T10:35:00.000Z"
  }
]
```

---

### PDF Endpoints

#### Upload PDF
```http
POST /pdf/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "pdf": <file>,
  "roomId": "507f1f77bcf86cd799439011"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "roomId": "507f1f77bcf86cd799439011",
  "uploadedBy": "507f1f77bcf86cd799439012",
  "fileName": "Physics_Notes.pdf",
  "filePath": "uploads/pdfs/1715859000000-123456789.pdf",
  "createdAt": "2024-05-16T10:40:00.000Z"
}
```

---

## 🔌 Socket Events

### Connection
```javascript
// Client connects with JWT token
socket.emit('connection', { token: 'jwt_token_here' })
```

### Join Room
```javascript
// Emit
socket.emit('join-room', { roomId: '507f1f77bcf86cd799439011' })

// Listen for active users
socket.on('room-users', (users) => {
  console.log(users)
  // [{ userId: '...', name: 'John Doe' }, ...]
})
```

### Send Message
```javascript
// Emit
socket.emit('send-message', {
  roomId: '507f1f77bcf86cd799439011',
  text: 'Hello everyone!'
})

// Listen for messages
socket.on('receive-message', (message) => {
  console.log(message)
  // { senderName: 'John Doe', text: '...', createdAt: '...' }
})
```

### Disconnect
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server')
})
```

---

## 🗄️ Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  avatar: String (default: ''),
  createdAt: Date,
  updatedAt: Date
}
```

### Room Model
```javascript
{
  _id: ObjectId,
  roomCode: String (required, unique),
  name: String (required),
  head: ObjectId (ref: User, required),
  members: [ObjectId] (ref: User),
  activePdf: ObjectId (ref: Pdf, default: null),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: Room, required),
  sender: ObjectId (ref: User, required),
  senderName: String (required),
  text: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Pdf Model
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: Room, required),
  uploadedBy: ObjectId (ref: User, required),
  fileName: String (required),
  filePath: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📂 Project Structure

```
StudySync/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection
│   │   │   └── multer.js             # File upload config
│   │   │
│   │   ├── controllers/
│   │   │   ├── AuthController.js     # Auth logic
│   │   │   ├── RoomController.js     # Room logic
│   │   │   └── PdfController.js      # PDF logic
│   │   │
│   │   ├── middlewares/
│   │   │   └── AuthMiddleware.js     # JWT verification
│   │   │
│   │   ├── models/
│   │   │   ├── User.js               # User schema
│   │   │   ├── Room.js               # Room schema
│   │   │   ├── Message.js            # Message schema
│   │   │   └── pdf.js                # PDF schema
│   │   │
│   │   ├── routes/
│   │   │   ├── AuthRoute.js          # Auth endpoints
│   │   │   ├── RoomRoute.js          # Room endpoints
│   │   │   ├── ChatRoute.js          # Chat endpoints
│   │   │   └── PdfRoute.js           # PDF endpoints
│   │   │
│   │   ├── sockets/
│   │   │   └── socket.js             # Socket.io handlers
│   │   │
│   │   ├── utils/
│   │   │   └── GenerateRoomCode.js   # Room code generator
│   │   │
│   │   └── app.js                    # Express app setup
│   │
│   ├── Uploads/
│   │   └── pdfs/                     # Uploaded PDFs storage
│   │
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   ├── server.js                     # Entry point
│   ├── socket-test.js                # Socket testing
│   ├── package.json                  # Dependencies
│   └── package-lock.json
│
├── frontend/                         # React app (in development)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md                         # This file
```

---

## 💻 Development

### Code Style
- ES6+ modules
- Async/await for asynchronous operations
- Consistent naming conventions (camelCase for variables/functions)
- Proper error handling with try-catch blocks

### Best Practices
- All sensitive data in `.env` file (never commit)
- JWT tokens validated on every protected route
- Passwords hashed with bcryptjs (salt rounds: 10)
- CORS enabled for frontend communication
- MongoDB connections pooled efficiently

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

---

## 🚀 Deployment

### Prepare for Production

1. **Update `.env`**
   ```env
   NODE_ENV=production
   JWT_SECRET=your_very_long_secret_key_here
   MONGO_URI=mongodb+srv://prod_user:prod_password@prod_cluster...
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Install Production Dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Test Production Build**
   ```bash
   npm start
   ```

### Deploy to Render

1. Push code to GitHub
2. Connect Render to GitHub repo
3. Set environment variables in Render dashboard
4. Deploy

### Deploy to Railway

1. Connect GitHub account
2. Create new project from GitHub
3. Configure environment variables
4. Deploy

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongo_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

---

## 📋 Contributing

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Review Checklist
- [ ] Code follows project style guide
- [ ] Tests added for new features
- [ ] No console.log statements left in code
- [ ] Error handling implemented
- [ ] Documentation updated

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
**Problem:** `MongoDB connection failed`
- Check `.env` file has correct `MONGO_URI`
- Verify MongoDB is running (local) or accessible (Atlas)
- Check firewall/network restrictions
- Test connection: `mongosh "your_connection_string"`

#### JWT Token Errors
**Problem:** `Invalid token` or `Not authorized`
- Ensure token is sent in `Authorization: Bearer <token>` header
- Check token expiration (7 days from generation)
- Verify `JWT_SECRET` matches in `.env`

#### CORS Errors
**Problem:** `Access-Control-Allow-Origin` error
- Update `CORS_ORIGIN` in `.env` to match frontend URL
- For development: use `http://localhost:3000`
- For production: use your domain

#### PDF Upload Fails
**Problem:** `PDF upload failed`
- Ensure `uploads/pdfs` directory exists
- Check file permissions on directory
- Verify only PDF files are being uploaded
- Check file size limits

#### Socket Connection Issues
**Problem:** Socket.io connection fails
- Ensure token is valid and passed on connection
- Check WebSocket is not blocked by proxy/firewall
- Verify Socket.io version compatibility

---

## 🗺️ Future Roadmap

### Phase 1: Enhanced Backend Features
- [ ] PDF annotations and highlighting
- [ ] Message reactions/emoji
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message search
- [ ] Room activity logs
- [ ] User presence tracking

### Phase 2: Frontend Development
- [ ] React application setup
- [ ] Authentication UI
- [ ] Room management interface
- [ ] Real-time chat UI
- [ ] PDF viewer integration
- [ ] User profile page
- [ ] Responsive mobile design

### Phase 3: Advanced Features
- [ ] Video/audio conferencing (Agora SDK)
- [ ] Screen sharing
- [ ] Drawing board
- [ ] Study timers
- [ ] Notes synchronization
- [ ] Study groups/community
- [ ] Analytics dashboard

### Phase 4: Optimization & Security
- [ ] Rate limiting
- [ ] Request validation middleware
- [ ] Data encryption
- [ ] Two-factor authentication
- [ ] Role-based access control
- [ ] API documentation (Swagger)
- [ ] Unit & integration tests
- [ ] Performance monitoring

---

## 📞 Support & Contact

### Getting Help
- 📧 Email: support@studysync.com
- 🐛 Report Issues: [GitHub Issues](https://github.com/yourusername/StudySync/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/StudySync/discussions)

### Documentation
- Full API Docs: [API.md](./API.md)
- Setup Guide: [SETUP.md](./SETUP.md)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - Initial work and backend development

---

## 🙏 Acknowledgments

- Express.js community
- Socket.io documentation
- MongoDB documentation
- All contributors and testers

---

<div align="center">

Made with ❤️ by StudySync Team

[⬆ back to top](#studysync-)

</div>