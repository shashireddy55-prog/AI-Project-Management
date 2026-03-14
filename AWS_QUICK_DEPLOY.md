# ⚡ FlowForge AI - 5-Minute AWS Deployment

The **fastest way** to deploy FlowForge to AWS.

---

## 🎯 Prerequisites (2 minutes)

```bash
# 1. Install AWS CLI (if not installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 2. Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, and region (us-east-1)
```

---

## 🚀 Deploy in 3 Steps

### Step 1️⃣: Set Environment Variables (30 seconds)

```bash
export VITE_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key-here"
export VITE_SUPABASE_PROJECT_ID="xxxxxxxxxxxx"
export BUCKET_NAME="flowforge-ai-$(date +%s)"  # Unique bucket name
```

### Step 2️⃣: Run Deployment Script (2 minutes)

```bash
chmod +x deploy-to-aws.sh
./deploy-to-aws.sh
```

### Step 3️⃣: Wait & Access (15-20 minutes)

The script will output your CloudFront URL:
```
https://d111111abcdef8.cloudfront.net
```

✅ **Done!** Your app is deploying.

---

## 🎨 What Gets Deployed?

```
┌─────────────────────────────────────┐
│  CloudFront CDN (Global)            │
│  ↓                                   │
│  S3 Bucket (Your React App)         │
│  ↓                                   │
│  Supabase (Backend - Already setup) │
└─────────────────────────────────────┘
```

---

## 💰 Cost

**~$5-10/month**
- S3 Storage: ~$0.50
- CloudFront: ~$5-10 (1000 requests/day)
- Supabase: Free tier or $25/month

---

## 🔄 Redeploy After Changes

```bash
# Just run the script again!
./deploy-to-aws.sh
```

---

## 🌐 Add Custom Domain (Optional)

### 1. Get SSL Certificate
```bash
# Request certificate in us-east-1 (required for CloudFront)
aws acm request-certificate \
  --domain-name flowforge.yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

### 2. Add to CloudFront
```bash
# Get your distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].Id' \
  --output text)

# Update distribution with custom domain
# (Use AWS Console - easier for this step)
```

### 3. Add DNS Record in Route53
```bash
# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://dns-change.json
```

---

## 🆘 Quick Troubleshooting

### Issue: Blank page
```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Issue: Environment variables not working
```bash
# Check if they're set
echo $VITE_SUPABASE_URL

# Rebuild with correct variables
npm run build
```

### Issue: Slow deployment
```bash
# Check CloudFront status
aws cloudfront get-distribution \
  --id YOUR_DIST_ID \
  --query 'Distribution.Status'

# Status should be "Deployed" when ready
```

---

## 📊 Monitoring Your App

### View CloudWatch Logs
```bash
# CloudFront access logs
aws cloudfront get-distribution \
  --id YOUR_DIST_ID \
  --query 'Distribution.DistributionConfig.Logging'
```

### Check Costs
```bash
# Get month-to-date costs
aws ce get-cost-and-usage \
  --time-period Start=2024-03-01,End=2024-03-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

---

## 🎯 Next Steps

1. ✅ **Wait 15-20 min** for CloudFront to deploy
2. ✅ **Test your app** at the CloudFront URL
3. ✅ **Add custom domain** (optional)
4. ✅ **Set up CI/CD** with GitHub Actions
5. ✅ **Enable monitoring** with CloudWatch

---

## 📞 Need Help?

- 📖 **Full Guide**: See `AWS_DEPLOYMENT_GUIDE.md`
- ✅ **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- 🧪 **Testing**: See `TESTING_COMMANDS.md`

---

## 🔑 Remember Your URLs

After deployment, save these:

| Resource | URL/ID |
|----------|--------|
| CloudFront URL | `https://______________.cloudfront.net` |
| S3 Bucket | `s3://_______________` |
| Distribution ID | `E_______________` |
| AWS Region | `us-east-1` |

---

**That's it! You're live on AWS! 🎉**

Need the full power? Check out `AWS_DEPLOYMENT_GUIDE.md` for Lambda, RDS, and advanced features.
