#!/bin/bash

###############################################################################
# FlowForge AI - AWS Deployment Script (Option 1: Hybrid - S3 + CloudFront)
# This script deploys the frontend to AWS S3 and CloudFront
# Backend remains on Supabase for simplicity
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="flowforge-ai"
AWS_REGION="${AWS_REGION:-us-east-1}"
BUCKET_NAME="${BUCKET_NAME:-$APP_NAME-app}"
CLOUDFRONT_COMMENT="FlowForge AI Application"

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install it first."
        echo "Visit: https://aws.amazon.com/cli/"
        exit 1
    fi
    print_success "AWS CLI found: $(aws --version)"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install it first."
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install it first."
        exit 1
    fi
    print_success "npm found: $(npm --version)"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured."
        echo "Run: aws configure"
        exit 1
    fi
    print_success "AWS credentials configured"
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_info "AWS Account ID: $ACCOUNT_ID"
    print_info "AWS Region: $AWS_REGION"
}

# Check environment variables
check_env_vars() {
    print_header "Checking Environment Variables"
    
    if [ -z "$VITE_SUPABASE_URL" ]; then
        print_error "VITE_SUPABASE_URL not set"
        echo "Please set: export VITE_SUPABASE_URL='your-supabase-url'"
        exit 1
    fi
    print_success "VITE_SUPABASE_URL is set"
    
    if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        print_error "VITE_SUPABASE_ANON_KEY not set"
        echo "Please set: export VITE_SUPABASE_ANON_KEY='your-anon-key'"
        exit 1
    fi
    print_success "VITE_SUPABASE_ANON_KEY is set"
    
    if [ -z "$VITE_SUPABASE_PROJECT_ID" ]; then
        print_error "VITE_SUPABASE_PROJECT_ID not set"
        echo "Please set: export VITE_SUPABASE_PROJECT_ID='your-project-id'"
        exit 1
    fi
    print_success "VITE_SUPABASE_PROJECT_ID is set"
}

# Build the application
build_app() {
    print_header "Building Application"
    
    print_info "Installing dependencies..."
    npm ci
    
    print_info "Building production bundle..."
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not found"
        exit 1
    fi
    
    print_success "Build completed successfully"
}

# Create S3 bucket
create_s3_bucket() {
    print_header "Setting Up S3 Bucket"
    
    # Check if bucket exists
    if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
        print_info "Creating S3 bucket: $BUCKET_NAME"
        
        if [ "$AWS_REGION" = "us-east-1" ]; then
            aws s3 mb "s3://$BUCKET_NAME"
        else
            aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION"
        fi
        
        print_success "S3 bucket created"
    else
        print_info "S3 bucket already exists: $BUCKET_NAME"
    fi
    
    # Enable static website hosting
    print_info "Configuring static website hosting..."
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html
    
    # Set bucket policy for public read access
    print_info "Setting bucket policy..."
    cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket "$BUCKET_NAME" \
        --policy file:///tmp/bucket-policy.json
    
    rm /tmp/bucket-policy.json
    
    print_success "S3 bucket configured"
}

# Upload files to S3
upload_to_s3() {
    print_header "Uploading Files to S3"
    
    # Sync all files except index.html with cache headers
    print_info "Uploading static assets..."
    aws s3 sync dist/ "s3://$BUCKET_NAME" \
        --delete \
        --cache-control "public, max-age=31536000, immutable" \
        --exclude "index.html" \
        --exclude "*.map"
    
    # Upload index.html separately with no-cache headers
    print_info "Uploading index.html..."
    aws s3 cp dist/index.html "s3://$BUCKET_NAME/index.html" \
        --cache-control "no-cache, no-store, must-revalidate" \
        --content-type "text/html"
    
    print_success "Files uploaded to S3"
}

# Create CloudFront distribution
create_cloudfront() {
    print_header "Setting Up CloudFront Distribution"
    
    # Check if distribution already exists
    EXISTING_DIST=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Comment=='$CLOUDFRONT_COMMENT'].Id" \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_DIST" ]; then
        print_info "CloudFront distribution already exists: $EXISTING_DIST"
        DISTRIBUTION_ID="$EXISTING_DIST"
        
        # Invalidate cache
        print_info "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
            --distribution-id "$DISTRIBUTION_ID" \
            --paths "/*" > /dev/null
        
        print_success "CloudFront cache invalidated"
    else
        print_info "Creating CloudFront distribution..."
        
        # Create distribution config
        cat > /tmp/cloudfront-config.json << EOF
{
  "CallerReference": "$APP_NAME-$(date +%s)",
  "Comment": "$CLOUDFRONT_COMMENT",
  "DefaultRootObject": "index.html",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF
        
        DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution \
            --distribution-config file:///tmp/cloudfront-config.json \
            --output json)
        
        DISTRIBUTION_ID=$(echo "$DISTRIBUTION_OUTPUT" | grep -o '"Id": "[^"]*' | head -1 | cut -d'"' -f4)
        
        rm /tmp/cloudfront-config.json
        
        print_success "CloudFront distribution created: $DISTRIBUTION_ID"
        print_info "Distribution is deploying... This may take 15-20 minutes."
    fi
    
    # Get distribution domain
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id "$DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text)
    
    print_success "CloudFront domain: $CLOUDFRONT_DOMAIN"
}

# Print deployment summary
print_summary() {
    print_header "Deployment Complete! 🚀"
    
    echo ""
    echo -e "${GREEN}Your FlowForge AI application is now live!${NC}"
    echo ""
    echo -e "${YELLOW}📍 S3 Bucket:${NC} s3://$BUCKET_NAME"
    echo -e "${YELLOW}📍 CloudFront Distribution:${NC} $DISTRIBUTION_ID"
    echo -e "${YELLOW}📍 Application URL:${NC} https://$CLOUDFRONT_DOMAIN"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Wait for CloudFront deployment to complete (~15-20 minutes)"
    echo "  2. Visit: https://$CLOUDFRONT_DOMAIN"
    echo "  3. (Optional) Set up custom domain with Route53"
    echo "  4. (Optional) Add SSL certificate with AWS Certificate Manager"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "  • To redeploy: run this script again"
    echo "  • To invalidate cache manually:"
    echo "    aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'"
    echo "  • To view CloudFront status:"
    echo "    aws cloudfront get-distribution --id $DISTRIBUTION_ID"
    echo ""
    echo -e "${GREEN}Happy deploying! 🎉${NC}"
}

# Main execution
main() {
    echo ""
    print_header "FlowForge AI - AWS Deployment"
    echo ""
    
    check_prerequisites
    check_env_vars
    build_app
    create_s3_bucket
    upload_to_s3
    create_cloudfront
    print_summary
}

# Run main function
main
