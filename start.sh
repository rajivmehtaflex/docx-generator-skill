#!/bin/bash

# DocX Generator - Setup and Launch Script

set -e

echo "🚀 DocX Generator Setup"
echo "========================"
echo ""

# Check Python version
echo "📋 Checking Python version..."
python3 --version || { echo "❌ Python 3 is required but not installed."; exit 1; }

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Please run this script from the docx-generator-skill directory"
    exit 1
fi

# Create virtual environment for development (optional)
if [ "$1" == "--dev" ]; then
    echo "🔧 Setting up development environment..."

    if [ ! -d "venv" ]; then
        echo "📦 Creating virtual environment..."
        python3 -m venv venv
    fi

    echo "📦 Activating virtual environment..."
    source venv/bin/activate

    echo "📦 Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt

    echo "✅ Development environment ready!"
    echo ""
fi

# Run tests if requested
if [ "$1" == "--test" ] || [ "$2" == "--test" ]; then
    echo "🧪 Running tests..."
    python3 test_docx_generator.py
    echo ""
fi

# Start the server
echo "🌐 Starting local server..."
echo "📱 Open your browser to: http://localhost:8000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Try different Python commands
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "❌ Neither python nor python3 command found"
    exit 1
fi