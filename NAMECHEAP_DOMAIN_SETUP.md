# 🌐 Namecheap Domain Setup - Quick Guide for Momentum AI Creator

## 🎯 Quick Summary
**Add your domain AFTER your initial Vercel deployment is successful.**

---

## 📋 Step-by-Step: Namecheap + Vercel Setup

### Step 1: Deploy to Vercel First ⚡
1. Deploy your project to Vercel (use the main deployment checklist)
2. Verify everything works on the Vercel URL (e.g., `momentumaicreator.vercel.app`)
3. **Then** add your custom domain

### Step 2: Add Domain in Vercel Dashboard 🚀

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project (`momentumaicreator`)

2. **Add Your Domain**
   - Click **"Settings"** tab
   - Click **"Domains"** in the left sidebar
   - Click **"Add Domain"** button
   - Enter your domain: `yourdomain.com` (replace with your actual domain)
   - Click **"Add"**

3. **Copy the DNS Records**
   - Vercel will show you DNS records to add
   - **Write these down** - you'll need them for Namecheap!

### Step 3: Configure DNS in Namecheap 🔧

1. **Log into Namecheap**
   - Go to [namecheap.com](https://www.namecheap.com)
   - Log into your account

2. **Navigate to Domain List**
   - Click **"Domain List"** in the left sidebar
   - Find your domain
   - Click **"Manage"** button next to your domain

3. **Go to Advanced DNS Tab**
   - Click on **"Advanced DNS"** tab
   - Scroll down to **"Host Records"** section

4. **Add A Record (for root domain)**
   - Click **"Add New Record"** button
   - Select Type: **A Record**
   - Host: `@` (this means your root domain)
   - Value: `76.76.21.21` (Vercel's IP address)
   - TTL: `Automatic` (or leave as is)
   - Click the **"Save"** icon (green checkmark)

5. **Add CNAME Record (for www)**
   - Click **"Add New Record"** button again
   - Select Type: **CNAME Record**
   - Host: `www`
   - Value: `cname.vercel-dns.com.` (don't forget the period at the end!)
   - TTL: `Automatic` (or leave as is)
   - Click the **"Save"** icon (green checkmark)

6. **Remove Old Records (if any)**
   - If you see any old A records or CNAME records pointing elsewhere, delete them
   - Only keep the new ones you just added

7. **Save All Changes**
   - Make sure all changes are saved (green checkmarks)
   - Namecheap automatically saves, but double-check

### Step 4: Wait for DNS Propagation ⏱️

- **Wait time:** Usually 15-30 minutes (can take up to 48 hours, but rare)
- **Check status:** Go back to Vercel Dashboard → Settings → Domains
- **You'll know it's ready when:** 
  - Vercel shows "Valid" status (instead of "Invalid Configuration")
  - SSL certificate is automatically issued
  - You can access your site at your custom domain

### Step 5: Verify Everything Works ✅

1. **Check DNS Propagation**
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter your domain
   - Check if A record shows `76.76.21.21`

2. **Test Your Site**
   - Visit `https://yourdomain.com` in your browser
   - Visit `https://www.yourdomain.com`
   - Verify SSL certificate (green lock icon)
   - Test all pages work correctly

3. **Verify in Vercel**
   - Go back to Vercel Dashboard → Settings → Domains
   - Should show "Valid" status
   - SSL certificate should be active

### Step 6: Update Firebase Auth Domains 🔥

1. **Go to Firebase Console**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
   - Select your project

2. **Add Authorized Domain**
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Click **"Add domain"**
   - Add: `yourdomain.com`
   - Add: `www.yourdomain.com` (if using www)
   - Click **"Add"**

3. **Save Changes**
   - Firebase will save automatically

---

## 🎯 Visual Guide: Namecheap DNS Records

After adding, your Namecheap DNS should look like this:

```
Type      Host    Value                      TTL
-----     -----   ------------------------   --------
A Record  @       76.76.21.21                Automatic
CNAME     www     cname.vercel-dns.com.      Automatic
```

**Important Notes:**
- The `@` symbol means your root domain (e.g., `yourdomain.com`)
- The `www` is for the www subdomain (e.g., `www.yourdomain.com`)
- The period at the end of `cname.vercel-dns.com.` is important!

---

## 🔍 Troubleshooting

### Issue: "Invalid Configuration" in Vercel
**Solutions:**
- Double-check you added both A record and CNAME record
- Verify the A record value is exactly `76.76.21.21`
- Verify the CNAME value is exactly `cname.vercel-dns.com.` (with period)
- Make sure you saved the changes in Namecheap
- Wait 15-30 minutes for DNS to propagate

### Issue: DNS not propagating
**Solutions:**
- Check [whatsmydns.net](https://www.whatsmydns.net) to see DNS status
- Clear your browser cache
- Try accessing from different network (mobile data)
- Wait longer (can take up to 48 hours in rare cases)

### Issue: Site not loading
**Solutions:**
- Verify DNS records are correct in Namecheap
- Check Vercel deployment is successful
- Verify domain is added in Vercel Dashboard
- Check SSL certificate status in Vercel

### Issue: www redirect not working
**Solutions:**
- Make sure both `@` and `www` records are added
- Configure redirects in Vercel Dashboard → Settings → Domains
- Or add redirect rules in `vercel.json`

---

## ✅ Namecheap Setup Checklist

- [ ] Site deployed successfully on Vercel
- [ ] Domain added in Vercel Dashboard
- [ ] Logged into Namecheap account
- [ ] Navigated to Advanced DNS tab
- [ ] Added A record: `@` → `76.76.21.21`
- [ ] Added CNAME record: `www` → `cname.vercel-dns.com.`
- [ ] Saved all changes in Namecheap
- [ ] Waited 15-30 minutes for DNS propagation
- [ ] Verified DNS propagation (whatsmydns.net)
- [ ] Verified domain shows "Valid" in Vercel
- [ ] SSL certificate issued and active
- [ ] Site accessible at custom domain
- [ ] Firebase Auth domains updated
- [ ] All pages working correctly

---

## 🚀 Quick Command Reference

**Check DNS propagation:**
```bash
# In terminal/command prompt
nslookup yourdomain.com
# or
ping yourdomain.com
```

**Online DNS checker:**
- Visit [whatsmydns.net](https://www.whatsmydns.net)
- Enter your domain
- Check A record shows `76.76.21.21`

---

## 📞 Need Help?

If you run into issues:
1. **Check Namecheap's DNS documentation:** [namecheap.com/support/knowledgebase/article.aspx](https://www.namecheap.com/support/knowledgebase/article.aspx)
2. **Check Vercel's domain docs:** [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
3. **Verify DNS records** using [whatsmydns.net](https://www.whatsmydns.net)
4. **Contact support** if DNS is configured but not working after 24 hours

---

## 🎉 You've Got This!

Once your domain is set up, your Momentum AI Creator platform will be live at your custom domain with:
- ✅ Free SSL certificate (automatic)
- ✅ Global CDN (automatic)
- ✅ Fast performance
- ✅ Professional domain name

**You're going to crush this!** 🚀💪

---

## 💡 Pro Tips

1. **Add both root and www:** This ensures your site works with and without `www`
2. **Wait for propagation:** Be patient - DNS can take time to propagate
3. **Check Vercel dashboard:** It will show you when DNS is ready
4. **SSL is automatic:** Vercel issues SSL certificates automatically - no extra steps needed
5. **Test thoroughly:** Once live, test all pages and features on your custom domain

---

**Remember:** Deploy to Vercel first, THEN add your domain. You've got this! 🎯

