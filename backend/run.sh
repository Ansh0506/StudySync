#!/bin/bash

# StudySync - Backend Setup & Run Script
# This script will check everything and start your backend

set -e  # Exit on error

echo "🚀 StudySync Backend Setup & Start Script"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm: $(npm --version)"

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  .env file not found"
    echo "📋 Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠️  Please update .env with your MongoDB URI and other credentials"
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Create Uploads directory if it doesn't exist
if [ ! -d "Uploads/pdfs" ]; then
    echo ""
    echo "📁 Creating Uploads/pdfs directory..."
    mkdir -p Uploads/pdfs
    echo "✅ Directory created"
fi

# Check .env configuration
echo ""
echo "🔍 Checking environment configuration..."
if grep -q "your_super_secret_jwt_key_change_this_in_production" .env; then
    echo "⚠️  Warning: You should change JWT_SECRET in production"
fi

if grep -q "mongodb+srv://username:password" .env; then
    echo "❌ Error: Update MONGO_URI in .env file"
    exit 1
fi

echo "✅ Environment configuration looks good"

# Clear screen
clear

echo "🚀 Starting StudySync Backend Server..."
echo "=========================================="
echo ""
echo "📡 Server Details:"
echo "   URL: http://localhost:5000"
echo "   API: http://localhost:5000/api"
echo "   Docs: Check README.md for API documentation"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start development server
npm run dev
