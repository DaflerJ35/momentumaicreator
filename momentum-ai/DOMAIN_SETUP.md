# 🌐 Custom Domain Setup Guide for Momentum AI Creator

## Quick Summary
**Add your custom domain AFTER your initial Vercel deployment is successful.** This guide walks you through the entire process.

---

## 📋 Prerequisites
- ✅ Your site is successfully deployed on Vercel
- ✅ You have access to your domain registrar account
- ✅ You know where you bought your domain (GoDaddy, Namecheap, etc.)

---

## 🚀 Step-by-Step Domain Setup

### Step 1: Deploy to Vercel First
1. Deploy your project to Vercel (follow the main deployment checklist)
2. Verify everything works on the Vercel URL (e.g., `momentumaicreator.vercel.app`)
3. **Then** proceed to add your custom domain

### Step 2: Add Domain in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project (`momentumaicreator`)

2. **Navigate to Domain Settings**
   - Click on **"Settings"** tab
   - Click on **"Domains"** in the left sidebar

3. **Add Your Domain**
   - Click **"Add Domain"** button
   - Enter your domain:
     - For root domain: `momentumaicreator.com`
     - For www: `www.momentumaicreator.com`
     - Or both!
   - Click **"Add"**

4. **Vercel Will Show DNS Instructions**
   - Vercel will display the DNS records you need to add
   - **Copy these instructions** - you'll need them!

### Step 3: Configure DNS at Your Domain Registrar

You need to add DNS records at wherever you bought your domain. Here's how for popular registrars:

#### 🔵 GoDaddy
1. Log into [GoDaddy](https://www.godaddy.com)
2. Go to **"My Products"**
3. Find your domain and click **"DNS"**
4. Add these records:

   **For Root Domain (momentumaicreator.com):**
   - Type: **A Record**
     - Name: `@`
     - Value: `76.76.21.21`
     - TTL: 600 (or Auto)
   
   - Type: **CNAME Record**
     - Name: `www`
     - Value: `cname.vercel-dns.com.`
     - TTL: 600 (or Auto)

5. Click **"Save"**
6. Wait 15-30 minutes for DNS propagation

#### 🔵 Namecheap
1. Log into [Namecheap](https://www.namecheap.com)
2. Go to **"Domain List"**
3. Click **"Manage"** next to your domain
4. Go to **"Advanced DNS"** tab
5. Add these records:

   **For Root Domain:**
   - Type: **A Record**
     - Host: `@`
     - Value: `76.76.21.21`
     - TTL: Automatic
   
   - Type: **CNAME Record**
     - Host: `www`
     - Value: `cname.vercel-dns.com.`
     - TTL: Automatic

6. Click the **"Save"** icon
7. Wait 15-30 minutes for DNS propagation

#### 🔵 Google Domains
1. Log into [Google Domains](https://domains.google.com)
2. Click on your domain
3. Go to **"DNS"** section
4. Scroll to **"Custom resource records"**
5. Add these records:

   **For Root Domain:**
   - Name: `@`
   - Type: **A**
   - Data: `76.76.21.21`
   - TTL: 3600
   
   - Name: `www`
   - Type: **CNAME**
   - Data: `cname.vercel-dns.com.`
   - TTL: 3600

6. Click **"Add"**
7. Wait 15-30 minutes for DNS propagation

#### 🔵 Cloudflare
1. Log into [Cloudflare](https://dash.cloudflare.com)
2. Select your domain
3. Go to **"DNS"** → **"Records"**
4. Add these records:

   **For Root Domain:**
   - Type: **A**
   - Name: `@`
   - IPv4 address: `76.76.21.21`
   - Proxy status: **Proxied** (orange cloud)
   - TTL: Auto
   
   - Type: **CNAME**
   - Name: `www`
   - Target: `cname.vercel-dns.com.`
   - Proxy status: **Proxied** (orange cloud)
   - TTL: Auto

5. Click **"Save"**
6. Wait 15-30 minutes for DNS propagation

#### 🔵 Other Registrars
The process is similar:
1. Find your DNS/Domain Management section
2. Add an **A Record** pointing to `76.76.21.21` for root domain
3. Add a **CNAME Record** pointing to `cname.vercel-dns.com.` for www
4. Save and wait for propagation

### Step 4: Wait for DNS Propagation

- ⏱️ **Typical wait time:** 15-30 minutes
- ⏱️ **Maximum wait time:** 48 hours (rare)
- ✅ **Check status:** Vercel dashboard will show when DNS is configured

**How to check if DNS is ready:**
1. Go back to Vercel Dashboard → Your Project → Settings → Domains
2. You'll see the domain status change from "Invalid Configuration" to "Valid"
3. Vercel will automatically issue an SSL certificate (free!)

### Step 5: Verify Your Domain

Once DNS propagates:

1. **Check DNS Resolution**
   ```bash
   # In terminal/command prompt
   ping yourdomain.com
   # or
   nslookup yourdomain.com
   ```

2. **Test Your Site**
   - Visit `https://yourdomain.com` in your browser
   - Visit `https://www.yourdomain.com`
   - Verify SSL certificate (green lock icon)
   - Test all pages work correctly

3. **Verify SSL Certificate**
   - Vercel automatically provides free SSL certificates
   - Should be active within minutes of DNS propagation
   - Check for green lock icon in browser

### Step 6: Configure Redirects (Optional)

Vercel can automatically redirect:
- `www` → non-`www` (or vice versa)
- HTTP → HTTPS (automatic)

**To configure redirects:**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click on your domain
3. Configure redirect preferences
4. Or add to `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "www.yourdomain.com"
        }
      ],
      "destination": "https://yourdomain.com/:path*",
      "permanent": true
    }
  ]
}
```

### Step 7: Update Firebase Auth Domains

If you're using Firebase Authentication, add your custom domain:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your custom domain (e.g., `momentumaicreator.com`)
6. Add www version if needed (e.g., `www.momentumaicreator.com`)
7. Save

### Step 8: Update Environment Variables (If Needed)

If you have any hardcoded URLs or need to update OAuth redirect URIs:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update any URLs that reference the old Vercel domain
3. Redeploy if necessary

---

## 🔍 Troubleshooting

### Issue: Domain shows "Invalid Configuration"
**Solutions:**
- Double-check DNS records are correct
- Wait longer for DNS propagation (can take up to 48 hours)
- Verify you added records at the correct domain registrar
- Check for typos in DNS records

### Issue: SSL Certificate not working
**Solutions:**
- Wait a few minutes after DNS propagation
- Vercel automatically issues SSL certificates
- Check Vercel dashboard for SSL status
- Try accessing `https://` version explicitly

### Issue: Site not loading on custom domain
**Solutions:**
- Verify DNS records are correct
- Check DNS propagation status
- Clear browser cache
- Try incognito/private browsing mode
- Check Vercel deployment logs

### Issue: www redirect not working
**Solutions:**
- Configure redirects in Vercel Dashboard
- Or add redirect rules to `vercel.json`
- Verify both domains are added in Vercel

### Issue: Firebase Auth not working
**Solutions:**
- Add custom domain to Firebase Authorized domains
- Update Firebase environment variables
- Redeploy application
- Check Firebase console for errors

---

## ✅ Domain Setup Checklist

- [ ] Site deployed successfully on Vercel
- [ ] Domain added in Vercel Dashboard
- [ ] DNS records added at domain registrar
- [ ] DNS propagation completed (verified in Vercel)
- [ ] SSL certificate issued and active
- [ ] Site accessible at custom domain
- [ ] www redirect configured (if desired)
- [ ] Firebase Auth domains updated
- [ ] All pages working on custom domain
- [ ] SSL certificate valid (green lock)

---

## 📞 Need Help?

If you run into issues:
1. Check Vercel's [Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
2. Check your domain registrar's DNS documentation
3. Verify DNS records using online tools like [whatsmydns.net](https://www.whatsmydns.net)
4. Contact Vercel support if DNS is configured but not working

---

## 🎉 You're Done!

Once your domain is set up, your site will be live at your custom domain with:
- ✅ Free SSL certificate (automatic)
- ✅ Global CDN (automatic)
- ✅ Fast performance
- ✅ Professional domain name

Your Momentum AI Creator platform is now ready for the world! 🚀

