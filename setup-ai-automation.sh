#!/bin/bash
# setup-ai-automation.sh
# Setup script for AI automation on your website

set -e

echo "🚀 Setting up AI Automation for YT Studio Website"
echo "=================================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js $(node --version) detected"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Google Gemini API
GOOGLE_API_KEY=your_api_key_here

# OpenAI API (optional)
OPENAI_API_KEY=your_api_key_here

# Hugging Face (optional)
HUGGINGFACE_API_KEY=your_api_key_here

# Database Connection (optional)
DATABASE_URL=

# Node Environment
NODE_ENV=development
EOF
    echo "✓ .env file created. Update with your API keys."
else
    echo "✓ .env file already exists"
fi

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install @google/generative-ai openai cohere-ai dotenv

# Create GitHub Actions workflow
echo ""
echo "📋 Creating GitHub Actions workflow..."
mkdir -p .github/workflows

cat > .github/workflows/auto-enhance.yml << 'EOF'
name: Auto-Enhance Website Content

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday 2 AM UTC
  workflow_dispatch:

jobs:
  enhance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run AI Enhancement
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: node scripts/auto-enhance.js
      
      - name: Commit enhanced content
        run: |
          git config --local user.email "ai-automation@github.com"
          git config --local user.name "AI Automation Bot"
          git add enhanced-episodes.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "chore: auto-enhanced episodes with AI

- Generated SEO-optimized titles
- Created engaging descriptions
- Extracted keywords
- Generated recommendations
- Updated meta descriptions" && git push)
EOF

echo "✓ GitHub Actions workflow created at .github/workflows/auto-enhance.yml"

# Create package.json scripts if not present
echo ""
echo "📜 Adding npm scripts..."
npm set-script "enhance" "node scripts/auto-enhance.js"
npm set-script "enhance:watch" "watch 'npm run enhance' data/"

echo ""
echo "✅ AI Automation setup complete!"
echo ""
echo "Next steps:"
echo "1. Get API keys from:"
echo "   - Google Gemini: https://aistudio.google.com/apikey"
echo "   - OpenAI (optional): https://platform.openai.com/api-keys"
echo "   - Hugging Face (optional): https://huggingface.co/settings/tokens"
echo ""
echo "2. Update .env file with your API keys"
echo ""
echo "3. Test locally:"
echo "   npm run enhance"
echo ""
echo "4. Add secrets to GitHub:"
echo "   - Go to Settings → Secrets and variables → Actions"
echo "   - Add GOOGLE_API_KEY, OPENAI_API_KEY"
echo ""
echo "5. Push to trigger automation:"
echo "   git push"
echo ""
echo "For manual testing:"
echo "   node scripts/auto-enhance.js"
echo ""
echo "For weekly automation:"
echo "   Check GitHub Actions → Auto-Enhance Website Content"
echo ""
echo "=================================================="
