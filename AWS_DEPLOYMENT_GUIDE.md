# 🚀 FlowForge AI - AWS Deployment Guide

## Overview

This guide will help you deploy FlowForge AI to AWS using a modern, scalable architecture.

---

## 📋 Architecture Overview

### **Recommended AWS Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │  CloudFront  │─────▶│   S3 Bucket  │  (Frontend)         │
│  │     (CDN)    │      │  (React App) │                     │
│  └──────────────┘      └──────────────┘                     │
│         │                                                     │
│         │                                                     │
│  ┌──────▼───────────────────────────────────┐               │
│  │         API Gateway (REST/HTTP)          │               │
│  └──────────────────┬───────────────────────┘               │
│                     │                                         │
│  ┌─────────────────▼────────────────────────┐               │
│  │     Lambda Functions (Node.js 20.x)      │               │
│  │  - Workspace Management                  │               │
│  │  - AI Command Processing                 │               │
│  │  - Authentication                        │               │
│  │  - Reports & Analytics                   │               │
│  └──────────────────┬───────────────────────┘               │
│                     │                                         │
│  ┌─────────────────▼────────────────────────┐               │
│  │     RDS PostgreSQL (or Supabase)         │               │
│  │  - User data                             │               │
│  │  - Workspaces, Projects, Tasks           │               │
│  │  - KV Store                              │               │
│  └──────────────────────────────────────────┘               │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │        Secrets Manager                   │                │
│  │  - OpenAI API Key                        │                │
│  │  - Database Credentials                  │                │
│  │  - JWT Secret                            │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │        S3 Bucket (Private)               │                │
│  │  - File Storage                          │                │
│  │  - User Uploads                          │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Deployment Options

### **Option 1: Hybrid (Recommended for Quick Start)**
- ✅ Frontend: AWS S3 + CloudFront
- ✅ Backend: Keep Supabase (existing setup)
- ✅ Database: Supabase PostgreSQL
- ✅ Auth: Supabase Auth
- **Pros**: Fastest deployment, minimal changes
- **Cost**: ~$5-10/month (mostly CloudFront)

### **Option 2: Full AWS (Recommended for Production)**
- ✅ Frontend: AWS Amplify or S3 + CloudFront
- ✅ Backend: API Gateway + Lambda
- ✅ Database: RDS PostgreSQL
- ✅ Auth: Cognito or custom JWT
- **Pros**: Full AWS ecosystem, better control
- **Cost**: ~$50-100/month (RDS, Lambda, CloudFront)

### **Option 3: Container-based**
- ✅ Frontend: S3 + CloudFront
- ✅ Backend: ECS Fargate or EKS
- ✅ Database: RDS PostgreSQL or Aurora
- **Pros**: Easiest backend deployment, scalable
- **Cost**: ~$100-200/month

---

## 🚀 Quick Start: Option 1 (Hybrid - Fastest)

### **Step 1: Prerequisites**

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Install Node.js dependencies
npm install
```

### **Step 2: Build Frontend**

```bash
# Update environment variables for production
cat > .env.production << EOF
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
EOF

# Build the app
npm run build
```

### **Step 3: Create S3 Bucket**

```bash
# Create bucket (replace with unique name)
aws s3 mb s3://flowforge-ai-app --region us-east-1

# Enable static website hosting
aws s3 website s3://flowforge-ai-app \
  --index-document index.html \
  --error-document index.html

# Update bucket policy for public access
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::flowforge-ai-app/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket flowforge-ai-app \
  --policy file://bucket-policy.json
```

### **Step 4: Upload to S3**

```bash
# Upload built files
aws s3 sync dist/ s3://flowforge-ai-app \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html separately (no cache)
aws s3 cp dist/index.html s3://flowforge-ai-app/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

### **Step 5: Create CloudFront Distribution**

```bash
# Create CloudFront distribution
cat > cloudfront-config.json << EOF
{
  "CallerReference": "flowforge-$(date +%s)",
  "Comment": "FlowForge AI Application",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-flowforge-ai-app",
        "DomainName": "flowforge-ai-app.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-flowforge-ai-app",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": { "Forward": "none" }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true
}
EOF

aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### **Step 6: Get CloudFront URL**

```bash
# Get the CloudFront domain name
aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].DomainName' \
  --output text
```

✅ **Your app is now live at:** `https://d111111abcdef8.cloudfront.net`

---

## 🏗️ Full AWS Deployment: Option 2

### **Step 1: Set Up Infrastructure**

Create a CloudFormation template:

```yaml
# Save as: cloudformation-template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'FlowForge AI Infrastructure'

Parameters:
  AppName:
    Type: String
    Default: flowforge-ai
    Description: Application name
  
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]

Resources:
  # S3 Bucket for Frontend
  FrontendBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AppName}-frontend-${Environment}'
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false

  # S3 Bucket Policy
  FrontendBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref FrontendBucket
      PolicyDocument:
        Statement:
          - Sid: PublicReadGetObject
            Effect: Allow
            Principal: '*'
            Action: 's3:GetObject'
            Resource: !Sub '${FrontendBucket.Arn}/*'

  # CloudFront Distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        DefaultRootObject: index.html
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt FrontendBucket.DomainName
            S3OriginConfig: {}
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods: [GET, HEAD, OPTIONS]
          CachedMethods: [GET, HEAD]
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
          MinTTL: 0
          DefaultTTL: 86400
          MaxTTL: 31536000
        CustomErrorResponses:
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /index.html
          - ErrorCode: 403
            ResponseCode: 200
            ResponsePagePath: /index.html

  # API Gateway
  ApiGateway:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: !Sub '${AppName}-api-${Environment}'
      ProtocolType: HTTP
      CorsConfiguration:
        AllowOrigins:
          - '*'
        AllowMethods:
          - GET
          - POST
          - PUT
          - DELETE
          - OPTIONS
        AllowHeaders:
          - '*'

  # Lambda Execution Role
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub '${AppName}-lambda-role-${Environment}'
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: 'sts:AssumeRole'
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        - arn:aws:iam::aws:policy/AmazonRDSFullAccess
        - arn:aws:iam::aws:policy/SecretsManagerReadWrite

  # RDS PostgreSQL Database
  DatabaseSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for FlowForge database
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2

  DatabaseSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for FlowForge database
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref LambdaSecurityGroup

  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub '${AppName}-db-${Environment}'
      Engine: postgres
      EngineVersion: '15.4'
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20
      StorageType: gp3
      MasterUsername: flowforge_admin
      MasterUserPassword: !Sub '{{resolve:secretsmanager:${DatabaseSecret}:SecretString:password}}'
      DBSubnetGroupName: !Ref DatabaseSubnetGroup
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      PubliclyAccessible: false
      BackupRetentionPeriod: 7

  # Secrets Manager for Database
  DatabaseSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: !Sub '${AppName}/database/${Environment}'
      GenerateSecretString:
        SecretStringTemplate: '{"username": "flowforge_admin"}'
        GenerateStringKey: 'password'
        PasswordLength: 32
        ExcludeCharacters: '"@/\'

  # Secrets for OpenAI and JWT
  AppSecrets:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: !Sub '${AppName}/app/${Environment}'
      SecretString: !Sub |
        {
          "OPENAI_API_KEY": "your-openai-key-here",
          "JWT_SECRET": "your-jwt-secret-here"
        }

  # VPC Configuration
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true

  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']

  LambdaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for Lambda functions
      VpcId: !Ref VPC

Outputs:
  CloudFrontURL:
    Description: CloudFront Distribution URL
    Value: !GetAtt CloudFrontDistribution.DomainName
  
  ApiGatewayURL:
    Description: API Gateway URL
    Value: !GetAtt ApiGateway.ApiEndpoint
  
  DatabaseEndpoint:
    Description: RDS Database Endpoint
    Value: !GetAtt Database.Endpoint.Address
```

Deploy the stack:

```bash
aws cloudformation create-stack \
  --stack-name flowforge-ai-production \
  --template-body file://cloudformation-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=Environment,ParameterValue=production
```

### **Step 2: Prepare Lambda Functions**

Create a deployment package for your backend:

```bash
# Create deployment directory
mkdir -p lambda-deploy
cd lambda-deploy

# Copy server code
cp -r ../supabase/functions/server/* .

# Create package.json for Lambda
cat > package.json << EOF
{
  "name": "flowforge-lambda",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "postgres": "^3.4.0",
    "openai": "^4.0.0"
  }
}
EOF

# Install dependencies
npm install --production

# Create Lambda handler
cat > lambda-handler.mjs << EOF
import { app } from './index.tsx';

export const handler = async (event, context) => {
  const request = {
    method: event.requestContext.http.method,
    url: \`https://\${event.requestContext.domainName}\${event.rawPath}\`,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : undefined,
  };

  const response = await app.fetch(request);
  
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
};
EOF

# Create deployment package
zip -r ../flowforge-lambda.zip .
cd ..
```

### **Step 3: Deploy Lambda Function**

```bash
# Create Lambda function
aws lambda create-function \
  --function-name flowforge-api \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/flowforge-ai-lambda-role-production \
  --handler lambda-handler.handler \
  --zip-file fileb://flowforge-lambda.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    NODE_ENV=production,
    DATABASE_URL=postgresql://user:pass@endpoint:5432/flowforge
  }"

# Update function code (for subsequent deployments)
aws lambda update-function-code \
  --function-name flowforge-api \
  --zip-file fileb://flowforge-lambda.zip
```

### **Step 4: Configure API Gateway Integration**

```bash
# Get API Gateway ID
API_ID=$(aws apigatewayv2 get-apis \
  --query 'Items[?Name==`flowforge-ai-api-production`].ApiId' \
  --output text)

# Create Lambda integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:flowforge-api \
  --payload-format-version 2.0 \
  --query 'IntegrationId' \
  --output text)

# Create route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key 'ANY /make-server-3acdc7c6/{proxy+}' \
  --target integrations/$INTEGRATION_ID

# Create stage
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name production \
  --auto-deploy
```

---

## 🐳 Container Deployment: Option 3

### **Step 1: Create Dockerfile**

```dockerfile
# Save as: Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Step 2: Create nginx.conf**

```nginx
# Save as: nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### **Step 3: Build and Push to ECR**

```bash
# Create ECR repository
aws ecr create-repository --repository-name flowforge-ai

# Get login command
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS \
  --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t flowforge-ai .

# Tag image
docker tag flowforge-ai:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/flowforge-ai:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/flowforge-ai:latest
```

### **Step 4: Deploy to ECS Fargate**

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name flowforge-cluster

# Create task definition (save as task-definition.json)
cat > task-definition.json << EOF
{
  "family": "flowforge-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "flowforge-frontend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/flowforge-ai:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true
    }
  ]
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster flowforge-cluster \
  --service-name flowforge-service \
  --task-definition flowforge-task \
  --desired-count 2 \
  --launch-type FARGATE
```

---

## 🔒 Security Configuration

### **1. Secrets Manager**

```bash
# Store OpenAI API Key
aws secretsmanager create-secret \
  --name flowforge/openai-key \
  --secret-string "your-openai-api-key"

# Store Database credentials
aws secretsmanager create-secret \
  --name flowforge/database-url \
  --secret-string "postgresql://user:pass@host:5432/db"

# Store JWT Secret
aws secretsmanager create-secret \
  --name flowforge/jwt-secret \
  --secret-string "your-super-secret-jwt-key"
```

### **2. IAM Policies**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:*:*:secret:flowforge/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::flowforge-ai-storage/*"
      ]
    }
  ]
}
```

---

## 📊 Monitoring & Logging

### **1. CloudWatch**

```bash
# Create log group
aws logs create-log-group --log-group-name /aws/lambda/flowforge-api

# Set retention
aws logs put-retention-policy \
  --log-group-name /aws/lambda/flowforge-api \
  --retention-in-days 30
```

### **2. CloudWatch Alarms**

```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name flowforge-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

---

## 🚀 CI/CD Pipeline

### **GitHub Actions Workflow**

```yaml
# Save as: .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  S3_BUCKET: flowforge-ai-app
  CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ env.S3_BUCKET }} \
            --delete \
            --cache-control "public, max-age=31536000" \
            --exclude "index.html"
          
          aws s3 cp dist/index.html s3://${{ env.S3_BUCKET }}/index.html \
            --cache-control "no-cache, no-store, must-revalidate"
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
      
      - name: Deploy Lambda (if backend changed)
        run: |
          cd lambda-deploy
          zip -r function.zip .
          aws lambda update-function-code \
            --function-name flowforge-api \
            --zip-file fileb://function.zip
```

---

## 💰 Cost Estimation

### **Option 1: Hybrid (S3 + Supabase)**
- S3 Storage: ~$0.50/month
- CloudFront: ~$5-10/month (1000 requests)
- Supabase: Free tier or $25/month
- **Total: $5-35/month**

### **Option 2: Full AWS**
- S3 + CloudFront: ~$5-10/month
- API Gateway: ~$3.50 per million requests
- Lambda: ~$0.20 per million requests + compute
- RDS (db.t3.micro): ~$15-20/month
- Secrets Manager: ~$0.40/secret/month
- **Total: $50-100/month**

### **Option 3: ECS Fargate**
- S3 + CloudFront: ~$5-10/month
- Fargate (2 tasks): ~$30-40/month
- RDS: ~$15-20/month
- Load Balancer: ~$20/month
- **Total: $70-100/month**

---

## 🎯 Post-Deployment Checklist

- [ ] Test frontend URL (CloudFront)
- [ ] Test API endpoints
- [ ] Verify database connection
- [ ] Check authentication flow
- [ ] Test AI commands
- [ ] Monitor CloudWatch logs
- [ ] Set up CloudWatch alarms
- [ ] Configure custom domain (Route53)
- [ ] Enable SSL certificate (ACM)
- [ ] Set up backup strategy
- [ ] Configure auto-scaling
- [ ] Test disaster recovery

---

## 🆘 Troubleshooting

### **Issue: CloudFront shows blank page**
```bash
# Check if index.html exists
aws s3 ls s3://flowforge-ai-app/index.html

# Check bucket policy
aws s3api get-bucket-policy --bucket flowforge-ai-app

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### **Issue: Lambda timeout**
```bash
# Increase timeout
aws lambda update-function-configuration \
  --function-name flowforge-api \
  --timeout 60

# Increase memory
aws lambda update-function-configuration \
  --function-name flowforge-api \
  --memory-size 1024
```

### **Issue: CORS errors**
- Check API Gateway CORS configuration
- Verify Lambda response includes CORS headers
- Check CloudFront cache behavior

---

## 📚 Additional Resources

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [RDS PostgreSQL Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [API Gateway HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)

---

**Ready to deploy? Start with Option 1 for the quickest path to production!** 🚀
