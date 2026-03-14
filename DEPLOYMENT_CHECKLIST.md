# 🚀 FlowForge AI - AWS Deployment Checklist

Use this checklist to ensure a smooth deployment to AWS.

---

## 📋 Pre-Deployment Checklist

### 1. AWS Account Setup
- [ ] AWS account created and verified
- [ ] Billing alerts configured
- [ ] IAM user created with appropriate permissions
- [ ] AWS CLI installed locally
- [ ] AWS credentials configured (`aws configure`)
- [ ] Verified AWS credentials work (`aws sts get-caller-identity`)

### 2. Domain & SSL (Optional but Recommended)
- [ ] Domain name registered (Route53 or external)
- [ ] SSL certificate requested in ACM (must be in us-east-1 for CloudFront)
- [ ] DNS records prepared

### 3. Environment Variables
- [ ] Supabase project created (if using Supabase)
- [ ] All environment variables documented
- [ ] `.env.production` file created and populated
- [ ] Secrets stored in AWS Secrets Manager (for Lambda)

### 4. Code Preparation
- [ ] All features tested locally
- [ ] Production build tested (`npm run build`)
- [ ] No console.logs or debug code in production
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Environment-specific configs set

---

## 🛠️ Deployment Steps

### Option 1: Quick Deploy (S3 + CloudFront + Supabase)

#### Step 1: Set Environment Variables
```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
export VITE_SUPABASE_PROJECT_ID="your-project-id"
export BUCKET_NAME="flowforge-ai-app"  # Must be globally unique
export AWS_REGION="us-east-1"
```

- [ ] Environment variables exported
- [ ] Variables verified with `echo $VITE_SUPABASE_URL`

#### Step 2: Run Deployment Script
```bash
chmod +x deploy-to-aws.sh
./deploy-to-aws.sh
```

- [ ] Script executed successfully
- [ ] S3 bucket created
- [ ] Files uploaded to S3
- [ ] CloudFront distribution created
- [ ] Deployment URL obtained

#### Step 3: Wait for CloudFront
- [ ] Waited 15-20 minutes for CloudFront deployment
- [ ] Checked distribution status: `Deployed`
- [ ] Application accessible via CloudFront URL

#### Step 4: Test Application
- [ ] Application loads correctly
- [ ] Login/signup works
- [ ] AI commands work
- [ ] Workspaces can be created
- [ ] Kanban board functions
- [ ] No console errors

---

### Option 2: GitHub Actions CI/CD

#### Step 1: Configure GitHub Secrets
Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_SUPABASE_PROJECT_ID`
- [ ] `S3_BUCKET_NAME`
- [ ] `CLOUDFRONT_DISTRIBUTION_ID`

#### Step 2: Verify Workflow File
- [ ] `.github/workflows/aws-deploy.yml` exists
- [ ] Workflow file reviewed and customized
- [ ] Branch name is correct (main/master)

#### Step 3: Deploy
- [ ] Push to main branch or manually trigger workflow
- [ ] Monitor workflow in GitHub Actions tab
- [ ] Verify successful deployment
- [ ] Check application at CloudFront URL

---

### Option 3: Full AWS (Lambda + RDS)

#### Step 1: Deploy Infrastructure
```bash
aws cloudformation create-stack \
  --stack-name flowforge-ai-production \
  --template-body file://cloudformation-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

- [ ] CloudFormation stack created
- [ ] Stack creation completed (~10-15 minutes)
- [ ] Resources verified in AWS Console

#### Step 2: Configure Database
- [ ] RDS instance accessible
- [ ] Database schema migrated
- [ ] Test connection from Lambda

#### Step 3: Deploy Lambda Function
- [ ] Lambda function code packaged
- [ ] Lambda function deployed
- [ ] Environment variables configured
- [ ] Lambda execution role has correct permissions

#### Step 4: Configure API Gateway
- [ ] API Gateway created
- [ ] Routes configured
- [ ] CORS enabled
- [ ] Lambda integration working

#### Step 5: Deploy Frontend
- [ ] Frontend built with correct API endpoint
- [ ] Uploaded to S3
- [ ] CloudFront distribution created
- [ ] Cache invalidated

---

## 🔒 Security Checklist

### Infrastructure Security
- [ ] S3 bucket is not publicly writable
- [ ] CloudFront uses HTTPS only
- [ ] Security groups properly configured
- [ ] RDS in private subnet (if applicable)
- [ ] Secrets stored in Secrets Manager (not in code)
- [ ] IAM roles follow least privilege principle

### Application Security
- [ ] Environment variables not exposed to client
- [ ] API authentication implemented
- [ ] CORS properly configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention implemented
- [ ] CSRF protection in place

### Monitoring & Logging
- [ ] CloudWatch Logs enabled
- [ ] CloudWatch Alarms configured
- [ ] Error tracking set up (e.g., Sentry)
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented
- [ ] Log retention policy set

---

## 📊 Post-Deployment Checklist

### Immediate Verification (Day 1)
- [ ] Application loads on all major browsers
- [ ] Login/signup flow works
- [ ] AI commands generate workspaces
- [ ] Kanban board drag & drop works
- [ ] Reports & analytics display correctly
- [ ] Mobile responsive design works
- [ ] No JavaScript errors in console
- [ ] All API endpoints respond correctly

### Performance Testing
- [ ] Lighthouse score checked (aim for 90+ on Performance)
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] CloudFront cache hit ratio monitored
- [ ] Lambda cold start times acceptable
- [ ] Database query performance optimized

### Monitoring Setup
- [ ] CloudWatch dashboard created
- [ ] Alarms configured for:
  - [ ] Lambda errors
  - [ ] API Gateway 5xx errors
  - [ ] High latency
  - [ ] Database connection issues
  - [ ] CloudFront error rate
- [ ] Notification email/Slack configured

### Backup & Recovery
- [ ] RDS automated backups enabled (if applicable)
- [ ] Backup retention period set
- [ ] Disaster recovery plan documented
- [ ] Restore procedure tested

### Cost Optimization
- [ ] AWS Cost Explorer reviewed
- [ ] Budget alerts configured
- [ ] Unused resources identified and removed
- [ ] Right-sizing of RDS/Lambda considered
- [ ] CloudFront cache strategy optimized

---

## 🔄 Ongoing Maintenance Checklist

### Weekly
- [ ] Check CloudWatch metrics
- [ ] Review error logs
- [ ] Monitor costs
- [ ] Check for AWS service updates

### Monthly
- [ ] Review and update dependencies
- [ ] Security patches applied
- [ ] Performance metrics analyzed
- [ ] Cost optimization review
- [ ] Backup restoration test

### Quarterly
- [ ] Architecture review
- [ ] Security audit
- [ ] Disaster recovery drill
- [ ] User feedback analysis
- [ ] Feature usage analytics review

---

## 🆘 Troubleshooting Checklist

### Application Not Loading
- [ ] CloudFront distribution status is "Deployed"
- [ ] S3 bucket contains index.html
- [ ] Bucket policy allows public read
- [ ] CloudFront cache invalidated
- [ ] Browser cache cleared
- [ ] Check CloudWatch logs for errors

### API Errors
- [ ] API Gateway endpoint correct in frontend
- [ ] Lambda function running without errors
- [ ] Environment variables set correctly
- [ ] Database accessible from Lambda
- [ ] CORS headers present in responses
- [ ] Check API Gateway logs

### Slow Performance
- [ ] CloudFront cache working (check cache hit ratio)
- [ ] Lambda memory size appropriate
- [ ] Database queries optimized
- [ ] Large assets compressed
- [ ] CDN serving static assets
- [ ] Check Lambda concurrent executions

### High AWS Costs
- [ ] Check CloudWatch metrics for usage spikes
- [ ] Review CloudFront data transfer
- [ ] Check Lambda invocations and duration
- [ ] Review RDS instance hours
- [ ] Check S3 storage and requests
- [ ] Identify and remove unused resources

---

## 📞 Support Resources

### AWS Documentation
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Getting Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html)
- [Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)

### AWS Support
- AWS Support Center (if you have a support plan)
- AWS Forums: https://forums.aws.amazon.com/
- Stack Overflow: Tag your questions with `amazon-web-services`

### FlowForge Resources
- Documentation: See `AWS_DEPLOYMENT_GUIDE.md`
- Quick Start: See `QUICK_START.md`
- Testing Commands: See `TESTING_COMMANDS.md`

---

## ✅ Deployment Sign-Off

Once all checks are complete, sign off here:

**Deployed by:** ___________________
**Date:** ___________________
**Environment:** Production / Staging / Development
**CloudFront URL:** ___________________
**Custom Domain (if any):** ___________________

**Notes:**
___________________________________________________________
___________________________________________________________
___________________________________________________________

---

**🎉 Congratulations on deploying FlowForge AI to AWS!**
