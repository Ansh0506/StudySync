# StudySync

StudySync is a real-time collaborative study workspace for creating shared rooms, uploading PDFs, highlighting study material, and chatting with teammates in the same session.

## Features

- JWT authentication with protected API routes
- User registration, login, profile updates, password changes, and avatar uploads
- Study room creation, room-code joining, leaving, and owner-controlled deletion
- Real-time chat, typing indicators, room presence, and Socket.IO authentication
- PDF upload, listing, viewing, downloading, and per-user removal
- Collaborative PDF highlights with real-time sync and undo/delete support
- Activity history for room events
- Responsive React interface with light/dark theme support

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Socket.IO Client, React PDF |
| Backend | Node.js, Express, Socket.IO, Multer |
| Database | MongoDB, Mongoose |
| Auth | JSON Web Tokens, bcryptjs |
| Tooling | ESLint, npm |

## Project Structure

```text
StudySync/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and upload configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth, validation, logging, and errors
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # REST API routes
│   │   ├── sockets/         # Socket.IO server events
│   │   └── app.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB database, either local or hosted on MongoDB Atlas

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/studysync
JWT_SECRET=replace_with_a_long_random_secret
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=50mb
UPLOAD_DIR=Uploads
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, set `CORS_ORIGIN` to the deployed frontend URL and `VITE_API_URL` to the deployed backend API URL.

## Installation

```bash
git clone <your-repository-url>
cd StudySync

cd backend
npm install

cd ../frontend
npm install
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on Vite's local dev URL, usually `http://localhost:5173`. The backend defaults to `http://localhost:5000`.

## Available Scripts

Backend:

```bash
npm start      # Run the Express server
npm run dev    # Run with nodemon
```

Frontend:

```bash
npm run dev      # Start Vite development server
npm run build    # Create production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## API Overview

All protected routes require an `Authorization: Bearer <token>` header.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile, password, or avatar |
| POST | `/api/rooms/create` | Create a room |
| POST | `/api/rooms/join` | Join a room by code |
| GET | `/api/rooms/user` | Get rooms for current user |
| GET | `/api/rooms/:id` | Get room details |
| DELETE | `/api/rooms/:id` | Delete or leave a room |
| POST | `/api/rooms/:id/leave` | Leave a room |
| GET | `/api/chat/:roomId` | Get recent room messages |
| POST | `/api/pdf/upload` | Upload a PDF |
| GET | `/api/pdf/room/:roomId` | List room PDFs |
| GET | `/api/pdf/download/:id` | Download a PDF |
| GET | `/api/pdf/:id` | Get PDF metadata |
| DELETE | `/api/pdf/:id` | Hide or permanently delete a PDF |
| POST | `/api/annotations/save` | Save a PDF annotation |
| GET | `/api/annotations/pdf/:pdfId` | Get annotations for a PDF |
| DELETE | `/api/annotations/:id` | Delete an annotation |
| GET | `/api/activity/room/:roomId` | Get room activity |

## Socket Events

The Socket.IO connection requires the JWT token in `auth.token`.

| Event | Direction | Purpose |
| --- | --- | --- |
| `join-room` | Client to server | Join a collaborative room |
| `room-users` | Server to client | Broadcast active room users |
| `send-message` | Client to server | Send a chat message |
| `receive-message` | Server to client | Receive a chat message |
| `typing` | Client to server | Start typing indicator |
| `stop-typing` | Client to server | Stop typing indicator |
| `user-typing` | Server to client | Show typing state |
| `user-stopped-typing` | Server to client | Clear typing state |
| `draw-annotation` | Client to server | Share a new highlight |
| `receive-annotation` | Server to client | Receive a new highlight |
| `delete-annotation` | Client to server | Remove a highlight |
| `remove-annotation` | Server to client | Sync highlight removal |

## Verification

Before publishing, run:

```bash
cd frontend
npm run lint
npm run build

cd ../backend
node --check server.js
```

## Deployment Notes

- Use a strong `JWT_SECRET` in production.
- Set `NODE_ENV=production` for the backend.
- Configure `CORS_ORIGIN` to the exact frontend deployment origin.
- Configure `VITE_API_URL` before building the frontend.
- Ensure the backend has persistent storage for the `Uploads` directory, or move uploads to cloud storage for production.
- Keep MongoDB credentials out of source control.

## License

No license file is currently included. Add one before publishing if you want to define reuse permissions.
