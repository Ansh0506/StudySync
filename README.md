# StudySync

StudySync is a full-stack collaborative study platform where students can create shared rooms, upload learning materials, review PDFs together, highlight important sections, and chat in real time. It is built as a React frontend with an Express, MongoDB, and Socket.IO backend.

## What StudySync Does

StudySync is designed around a simple study workflow:

1. A user creates an account and signs in.
2. The user creates a study room or joins an existing room with a room code.
3. Room members upload PDFs such as notes, assignments, papers, or slides.
4. Members read the same material, highlight useful text, and see shared annotations in real time.
5. Members use the room chat to discuss the document while studying.
6. The room keeps track of relevant activity, uploaded documents, members, and collaboration state.

## Core Functions

### Authentication and Profiles

- Users can register, log in, and stay authenticated with JWT-based sessions.
- Passwords are hashed with `bcryptjs` before storage.
- Protected API routes require a valid bearer token.
- Users can update their profile details, change their password, and upload an avatar.
- Invalid or expired tokens are rejected by the backend middleware.

### Study Rooms

- Users can create rooms with unique room codes.
- Other users can join a room by entering its code.
- Each room tracks its creator, permanent owner, temporary owner, members, active PDF, and timestamps.
- The dashboard lists all rooms where the current user is a member.
- A room owner can permanently delete a room for everyone.
- Non-owner members can remove the room from their own dashboard by leaving it.
- Room deletion also cleans related PDFs, messages, annotations, and activity records.

### PDF Workspace

- Room members can upload PDF files to a shared room workspace.
- Uploaded PDFs are stored on the backend and tracked in MongoDB.
- Users can select documents from the room sidebar.
- The PDF viewer supports page navigation, page number input, zoom controls, and scroll-based page detection.
- Users can download stored PDFs through a protected API route.
- PDF removal supports collaborative behavior: a PDF is hidden for a user first and permanently deleted only when all room members have removed it.

### Collaborative Highlights and Annotations

- Users can highlight selected PDF text.
- Highlight data stores page number, color, position rectangles, author details, room ID, and PDF ID.
- New highlights are saved to the database and broadcast to other connected room members with Socket.IO.
- Users can delete or undo their highlights.
- Deleted highlights are removed from the database and synced to other users in the room.

### Real-Time Chat and Presence

- Each room has a real-time chat powered by Socket.IO.
- Messages are stored in MongoDB and recent chat history is loaded when entering a room.
- Connected users are tracked per room.
- Typing indicators show when another member is composing a message.
- Socket connections are authenticated with the same JWT token used by the REST API.

### Activity History

- StudySync stores room activity such as joining, leaving, and uploading PDFs.
- Activity records include the room, user, action type, description, and timestamp.
- The backend exposes recent activity for each room.

### Interface and User Experience

- The frontend is built with React and Vite.
- The interface includes authentication screens, a dashboard, profile page, room workspace, PDF viewer, chat panel, and reusable confirmation modals.
- Room and dashboard delete actions use custom modal dialogs instead of browser default popups.
- The app supports theme switching and responsive layouts.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Socket.IO Client, React PDF |
| Backend | Node.js, Express, Socket.IO, Multer |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| Tooling | ESLint, npm |

## Project Structure

```text
StudySync/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and upload configuration
│   │   ├── controllers/     # Request handlers for API behavior
│   │   ├── middlewares/     # Auth, validation, logging, and error handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # REST API route definitions
│   │   ├── sockets/         # Socket.IO events
│   │   ├── utils/           # Helper functions
│   │   └── app.js           # Express app setup
│   ├── server.js            # HTTP and Socket.IO server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Shared UI and workspace components
│   │   ├── context/         # Auth and theme context providers
│   │   ├── pages/           # Login, register, dashboard, profile, room
│   │   ├── services/        # Axios API client and URL helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── LICENSE
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB, either local or hosted on MongoDB Atlas

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

For production, set `CORS_ORIGIN` to the deployed frontend origin and `VITE_API_URL` to the deployed backend API URL.

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

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The backend defaults to `http://localhost:5000`. The frontend usually runs at `http://localhost:5173`.

## Available Scripts

Backend:

```bash
npm start      # Run the Express server
npm run dev    # Run the backend with nodemon
```

Frontend:

```bash
npm run dev      # Start Vite development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## API Overview

All protected routes require an `Authorization: Bearer <token>` header.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Authenticate a user and return a JWT |
| GET | `/api/auth/me` | Return the current authenticated user |
| PUT | `/api/auth/profile` | Update profile fields, password, or avatar |
| POST | `/api/rooms/create` | Create a new study room |
| POST | `/api/rooms/join` | Join a study room with a room code |
| GET | `/api/rooms/user` | List rooms for the current user |
| GET | `/api/rooms/:id` | Get room details |
| DELETE | `/api/rooms/:id` | Delete a room as owner or leave as member |
| POST | `/api/rooms/:id/leave` | Leave a room |
| GET | `/api/chat/:roomId` | Load recent room chat messages |
| POST | `/api/pdf/upload` | Upload a PDF to a room |
| GET | `/api/pdf/room/:roomId` | List visible PDFs for a room |
| GET | `/api/pdf/download/:id` | Download a PDF file |
| GET | `/api/pdf/:id` | Get PDF metadata |
| DELETE | `/api/pdf/:id` | Hide or permanently delete a PDF |
| POST | `/api/annotations/save` | Save a PDF annotation |
| GET | `/api/annotations/pdf/:pdfId` | Get annotations for a PDF |
| DELETE | `/api/annotations/:id` | Delete an annotation |
| GET | `/api/activity/room/:roomId` | Get recent room activity |

## Socket Events

The Socket.IO connection expects the JWT token in `auth.token`.

| Event | Direction | Purpose |
| --- | --- | --- |
| `join-room` | Client to server | Join the socket channel for a room |
| `room-users` | Server to client | Broadcast active room users |
| `send-message` | Client to server | Send a chat message |
| `receive-message` | Server to client | Receive a chat message |
| `typing` | Client to server | Notify others that the user is typing |
| `stop-typing` | Client to server | Clear typing state |
| `user-typing` | Server to client | Display a typing indicator |
| `user-stopped-typing` | Server to client | Remove a typing indicator |
| `draw-annotation` | Client to server | Broadcast a new PDF highlight |
| `receive-annotation` | Server to client | Receive a new PDF highlight |
| `delete-annotation` | Client to server | Broadcast highlight deletion |
| `remove-annotation` | Server to client | Remove a highlight from other clients |

## Data Models

- `User`: stores account details, hashed password, and avatar path.
- `Room`: stores room code, name, owner fields, members, and active PDF.
- `Pdf`: stores room association, uploader, file name, file path, and per-user deletion state.
- `Message`: stores room chat messages and sender details.
- `Annotation`: stores PDF highlights and flexible annotation data.
- `Activity`: stores room activity events and descriptions.

## Verification

Before publishing or deploying, run:

```bash
cd frontend
npm run lint
npm run build

cd ../backend
node --check server.js
```

You can also syntax-check backend source files:

```bash
find backend/src -name *.js -exec node --check {} +
```

## Deployment Notes

- Use a strong, private `JWT_SECRET` in production.
- Set `NODE_ENV=production` for the backend.
- Configure `CORS_ORIGIN` to the exact deployed frontend origin.
- Configure `VITE_API_URL` before building the frontend.
- Make sure the backend has persistent storage for the `Uploads` directory.
- Consider moving uploads to cloud storage for production deployments that do not preserve local files.
- Keep MongoDB credentials and `.env` files out of source control.

## License

StudySync is licensed under the MIT License. See [LICENSE](LICENSE) for details.
