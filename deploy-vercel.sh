#!/bin/bash

echo "🚀 Deploying Momentum AI to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Run: vercel login"
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at the URL shown above"
echo ""
echo "🔧 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Set environment variables (see below)"
echo "3. Configure custom domain if needed"

echo ""
echo "🔐 Required Environment Variables:"
echo "=================================="
echo "Frontend (.env):"
echo "- VITE_USE_SERVER_AI=true"
echo "- VITE_API_URL=https://your-app.vercel.app"
echo "- VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..."
echo ""
echo "Backend (Vercel Environment Variables):"
echo "- NODE_ENV=production"
echo "- FRONTEND_URL=https://your-app.vercel.app"
echo "- AI_PROVIDER=ollama"
echo "- OLLAMA_URL=https://api.ollama.ai"
echo "- OLLAMA_API_KEY=your_ollama_key"
echo "- STRIPE_SECRET_KEY=sk_live_..."
echo "- STRIPE_WEBHOOK_SECRET=whsec_..."
echo "- TOKEN_ENCRYPTION_KEY=64_char_hex_key"
echo "- OAUTH_STATE_SECRET=64_char_hex_key"
echo ""
echo "🔑 Generate secure keys:"
echo "- TOKEN_ENCRYPTION_KEY: openssl rand -hex 32"
echo "- OAUTH_STATE_SECRET: openssl rand -hex 32"
