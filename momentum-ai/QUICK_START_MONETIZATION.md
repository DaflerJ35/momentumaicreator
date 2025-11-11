# Quick Start - Make Money Fast 🚀

## 3-Minute Setup to Start Earning

### Step 1: Sign Up & Complete Onboarding (1 min)
1. Create account
2. Complete onboarding wizard
3. Select your platforms (Instagram, Twitter, OnlyFans, etc.)

### Step 2: Connect Platforms (1 min)
1. Go to Integrations page
2. Click "Connect" on your platforms
3. Authorize access (OAuth)

### Step 3: Create Content (1 min)
1. Go to Neural Multiplier
2. Enter your content
3. Select target platforms
4. Generate content variations

### Step 4: Publish & Monetize (30 sec)
1. Go to Content Publisher
2. Select your content
3. Choose platforms
4. Click "Publish"
5. Start making money! 💰

## Platform Setup

### Social Media Platforms
- **Instagram**: Requires Instagram Business Account + Facebook Page
- **Twitter/X**: Requires Twitter Developer Account
- **LinkedIn**: Requires LinkedIn Developer App
- **Facebook**: Requires Facebook App + Page
- **TikTok**: Requires TikTok Developer Account

### Subscription Platforms
- **OnlyFans**: API access required
- **Fansly**: API access required
- **Fanvue**: API access required
- **Fanplace**: API access required

## Environment Variables Needed

Add these to your `.env` file or Vercel environment variables:

```bash
# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Google/YouTube
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# TikTok
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# API URL (for OAuth callbacks)
API_URL=https://your-domain.com
# or for Vercel: https://your-app.vercel.app
```

## How to Get API Keys

### Instagram
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Get Client ID and Secret
5. Add redirect URI: `https://your-domain.com/api/platforms/instagram/oauth/callback`

### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Enable OAuth 2.0
4. Get Client ID and Secret
5. Add callback URL: `https://your-domain.com/api/platforms/twitter/oauth/callback`

### LinkedIn
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Get Client ID and Secret
4. Add redirect URL: `https://your-domain.com/api/platforms/linkedin/oauth/callback`

### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Get App ID and Secret
5. Add redirect URI: `https://your-domain.com/api/platforms/facebook/oauth/callback`

### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://your-domain.com/api/platforms/youtube/oauth/callback`

## Testing

1. **Test OAuth Flow**
   - Click "Connect" on a platform
   - Complete OAuth authorization
   - Verify token is saved

2. **Test Content Creation**
   - Create content in Neural Multiplier
   - Verify content is generated
   - Check platform-specific formatting

3. **Test Publishing**
   - Publish content to connected platform
   - Verify post is published
   - Check platform for post

## Troubleshooting

### OAuth Not Working
- Check environment variables are set
- Verify redirect URIs match
- Check API URL is correct
- Verify OAuth app settings

### Content Not Publishing
- Check platform is connected
- Verify token is valid
- Check platform API limits
- Review error logs

### Onboarding Not Showing
- Clear browser cache
- Check Firebase database
- Verify user onboarding status
- Check console for errors

## Next Steps

1. **Connect All Platforms** - More platforms = more money
2. **Create Content Daily** - Consistency is key
3. **Monitor Analytics** - Track what works
4. **Optimize Content** - Use AI insights
5. **Scale Up** - Automate and grow

## Support

If you need help:
1. Check documentation
2. Review error logs
3. Contact support
4. Check GitHub issues

## Revenue Tips

1. **Post Consistently** - Daily posts perform better
2. **Use Hashtags** - Increase reach
3. **Engage with Audience** - Build community
4. **Analyze Performance** - Optimize content
5. **Cross-Post** - Repurpose content
6. **Use AI Tools** - Save time, create more

---

**Remember**: The faster you set up, the faster you start making money! 🚀💰

