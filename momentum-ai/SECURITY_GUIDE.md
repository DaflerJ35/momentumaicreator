# Security Guide - Credential Rotation

## 🚨 URGENT: Rotate Exposed Credentials

If you have committed live credentials to the repository, follow these steps immediately:

### Step 1: Remove Real Values from `.env` Files

1. **Backup your current `.env` files** (if they contain real values):
   ```bash
   cp momentum-ai/server/.env momentum-ai/server/.env.backup
   cp momentum-ai/.env momentum-ai/.env.backup
   ```

2. **Remove real values and replace with placeholders**:
   - Open `momentum-ai/server/.env`
   - Replace `STRIPE_SECRET_KEY` with `sk_test_your_stripe_secret_key_here`
   - Replace `STRIPE_WEBHOOK_SECRET` with `whsec_your_webhook_secret_here`
   - Replace `GEMINI_API_KEY` with `your_gemini_api_key_here`
   - Replace any other sensitive values with placeholders

3. **Verify `.env` files are in `.gitignore`**:
   - Check that `server/.env` is listed in `.gitignore`
   - The file should already be configured, but verify it's there

### Step 2: Rotate Exposed Keys

#### Stripe Keys
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers > API keys**
3. **Revoke the exposed secret key** (click "Reveal test key" or "Reveal live key", then "Revoke")
4. Create a new secret key
5. Update your deployment environment variables with the new key

#### Stripe Webhook Secret
1. Go to **Developers > Webhooks**
2. Find your webhook endpoint
3. Click on it and go to **Signing secret**
4. Click "Reveal" and copy the new secret
5. Click "Reveal" again to rotate it (this invalidates the old one)
6. Update your deployment environment variables

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Find your API key
3. Click "Delete" to revoke it
4. Create a new API key
5. Update your deployment environment variables

### Step 3: Remove from Git History (if committed)

If you've already committed the `.env` file to git:

```bash
# Remove from git history (CAREFUL: This rewrites history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch momentum-ai/server/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This will rewrite remote history)
git push origin --force --all
git push origin --force --tags
```

**Alternative (safer)**: Use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/):
```bash
bfg --delete-files server/.env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 4: Verify Secret Scanning

1. The `.github/workflows/security-scan.yml` workflow will automatically scan for secrets on every PR
2. Verify the workflow runs successfully after your changes
3. Check that no secrets are detected in the scan results

### Step 5: Update Deployment Environment Variables

Update your production/staging environment variables with the new rotated keys:
- **Vercel**: Project Settings > Environment Variables
- **Render**: Environment > Environment Variables
- **Heroku**: Settings > Config Vars
- **Other platforms**: Refer to their documentation

## Prevention

1. **Always use `.env.example` files** for documentation
2. **Never commit `.env` files** - they're in `.gitignore`
3. **Use secret scanning in CI/CD** - already configured in `.github/workflows/security-scan.yml`
4. **Rotate keys regularly** - at least every 90 days for production keys
5. **Use different keys for different environments** - dev, staging, production

## Checklist

- [ ] Removed real values from `server/.env`
- [ ] Replaced with placeholders
- [ ] Rotated Stripe secret key
- [ ] Rotated Stripe webhook secret
- [ ] Rotated Gemini API key (if used)
- [ ] Updated deployment environment variables
- [ ] Removed from git history (if committed)
- [ ] Verified `.gitignore` includes `server/.env`
- [ ] Verified secret scanning workflow runs successfully
- [ ] Tested application with new keys

## Need Help?

If you're unsure about any step, consult:
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [Google Cloud Security](https://cloud.google.com/security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

