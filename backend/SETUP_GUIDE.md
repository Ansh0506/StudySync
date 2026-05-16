# Backend Setup Guide

## ✅ Fixes Applied

### 1. **Fixed Multer Path** ✓
- **Issue**: Code referenced `uploads/pdfs` but actual directory is `Uploads/pdfs`
- **Fix**: Updated `backend/src/config/multer.js` line 5
- **Changed**: `"uploads/pdfs"` → `"Uploads/pdfs"`

### 2. **Fixed Socket Initialization** ✓
- **Issue**: Socket initialization wasn't returning io instance
- **Fix**: Updated `backend/server.js` to properly capture io instance
- **Result**: Socket events now properly initialized

### 3. **Created .gitignore** ✓
- **Added**: Protects sensitive `.env` file from being committed
- **Location**: `backend/.gitignore`

### 4. **Created .env.example** ✓
- **Added**: Template for environment variables
- **Location**: `backend/.env.example`
- **Purpose**: Safe to commit, shows structure without secrets

---

## 🚀 Quick Start

### Option 1: Using the Setup Script (Recommended)
```bash
cd backend
chmod +x run.sh
./run.sh
```

### Option 2: Manual Start
```bash
cd backend
npm run dev
```

### Option 3: Production Mode
```bash
cd backend
npm start
```

---

## 📋 Pre-Start Checklist

### 1. Verify Environment
```bash
# Check Node version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version
```

### 2. Verify Dependencies
```bash
cd backend
npm list
# All packages should be listed without errors
```

### 3. Verify .env File
```bash
cd backend
cat .env
```

**Should contain:**
- ✅ PORT=5000
- ✅ MONGO_URI=mongodb+srv://... (with valid credentials)
- ✅ JWT_SECRET=studysync_secret (or your secret)

### 4. Verify Directory Structure
```bash
cd backend
ls -la
# Should show:
# src/
# Uploads/
# node_modules/
# .env
# .gitignore
# .env.example
# package.json
# server.js
```

### 5. Verify Uploads Directory
```bash
cd backend
mkdir -p Uploads/pdfs
ls -la Uploads/
# Should show: pdfs/
```

---

## 🧪 Test Your Setup

### 1. Test MongoDB Connection
```bash
cd backend
npm run dev
# Look for: ✅ MongoDB connected
```

### 2. Test API Health
```bash
# In another terminal
curl http://localhost:5000/
# Should return: StudySync Backend is running 🚀
```

### 3. Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected response (201):
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "id": "...",
#     "name": "Test User",
#     "email": "test@example.com"
#   }
# }
```

### 4. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected response (200):
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {...}
# }
```

---

## 🛠️ Troubleshooting

### Problem: "MongoDB connection failed"
**Solution:**
1. Check MongoDB URI in `.env`
2. Verify internet connection
3. Check MongoDB Atlas IP whitelist
4. Test connection: `mongosh "your_connection_string"`

### Problem: "Port 5000 already in use"
**Solution:**
```bash
# Find process on port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Problem: "Cannot find module"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: "uploads/pdfs doesn't exist"
**Solution:**
```bash
mkdir -p Uploads/pdfs
# OR the script creates it automatically
./run.sh
```

### Problem: "No token" in Socket
**Solution:**
- Ensure JWT token is passed in Socket connection
- Check `JWT_SECRET` matches in `.env`

---

## 📝 File Fixes Summary

| File | Issue | Fix | Status |
|------|-------|-----|--------|
| multer.js | Wrong path case | `uploads/pdfs` → `Uploads/pdfs` | ✅ |
| server.js | Socket not returned | Capture `io` instance | ✅ |
| .gitignore | Missing | Created to protect .env | ✅ |
| .env.example | Missing | Created as template | ✅ |
| run.sh | Missing | Created setup script | ✅ |

---

## 🔐 Security Checklist

- ✅ .env file added to .gitignore
- ✅ .env.example file created for safe sharing
- ✅ JWT_SECRET should be changed in production
- ✅ MongoDB credentials protected in .env
- ✅ Sensitive files not committed to git

---

## 📞 Still Having Issues?

1. **Check logs** - Look for error messages in terminal
2. **Verify .env** - Make sure all variables are set
3. **Check MongoDB** - Test connection directly
4. **Check ports** - Ensure port 5000 is available
5. **Check Node version** - Should be 18+
6. **Run setup script** - `./run.sh` handles most issues

---

## ✨ You're All Set!

Your backend is now properly configured. Run:
```bash
cd backend
./run.sh
# OR
npm run dev
```

Happy coding! 🚀
