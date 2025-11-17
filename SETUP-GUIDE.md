# VideoBlade Setup Guide - Phase 1 Prerequisites

This guide will walk you through setting up all the external services needed for VideoBlade MVP.

**Time Required**: 2-4 hours (mostly waiting for approvals)

---

## ✅ Already Complete

- [x] npm packages installed (inngest, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
- [x] Environment configuration files updated (.env.example, src/env.js)
- [x] S3 test script created (scripts/test-s3.ts)

---

## 🔧 Setup Steps

### Step 1: AWS S3 Setup (30-45 minutes)

#### 1.1 Create AWS Account (if needed)

1. Visit https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card, but free tier available)

#### 1.2 Create S3 Bucket

1. Sign in to AWS Console: https://console.aws.amazon.com/
2. Search for "S3" in the top search bar
3. Click "Create bucket"
4. Configure:
   - **Bucket name**: `videoblade-dev-videos` (must be globally unique, add suffix if needed)
   - **AWS Region**: Choose closest to you (e.g., `us-east-1`)
   - **Block all public access**: ✅ ENABLED (we'll use presigned URLs)
   - **Bucket Versioning**: Disabled (not needed for MVP)
   - **Encryption**: Default (SSE-S3)
5. Click "Create bucket"

#### 1.3 Configure CORS for Bucket

1. Go to your bucket → Permissions tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Click "Edit"
4. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

5. Click "Save changes"

#### 1.4 Create IAM User for Programmatic Access

1. Search for "IAM" in AWS Console
2. Go to Users → Add users
3. **User name**: `videoblade-s3-uploader`
4. **Select AWS credential type**: Access key - Programmatic access
5. Click "Next: Permissions"
6. Choose "Attach existing policies directly"
7. **Option A (Simple)**: Search and select `AmazonS3FullAccess`
   - ⚠️ Less secure, but easier for development
8. **Option B (Recommended)**: Create custom policy:
   - Click "Create policy"
   - Click JSON tab
   - Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::videoblade-dev-videos/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::videoblade-dev-videos"
    }
  ]
}
```

- Click "Next: Tags" → "Next: Review"
- **Name**: `VideoBlade-S3-Access`
- Click "Create policy"
- Go back to user creation, refresh policies, and select your new policy

9. Click "Next: Tags" (optional) → "Next: Review"
10. Click "Create user"
11. **IMPORTANT**: Copy your credentials:
    - Access key ID
    - Secret access key
    - ⚠️ You won't be able to see the secret again!

#### 1.5 Add AWS Credentials to .env

```bash
# Copy .env.example to .env if you haven't already
cp .env.example .env
```

Edit `.env` and add:

```env
AWS_REGION="us-east-1"  # or your chosen region
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"  # your access key
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"  # your secret
AWS_S3_BUCKET_NAME="videoblade-dev-videos"  # your bucket name
```

#### 1.6 Test S3 Connection

```bash
npx tsx scripts/test-s3.ts
```

Expected output:

```
Testing S3 connectivity...
Region: us-east-1
Bucket: videoblade-dev-videos
✅ S3 upload successful!
ETag: "abc123..."
```

---

### Step 2: Inngest Setup (15-20 minutes)

#### 2.1 Create Inngest Account

1. Visit https://www.inngest.com/
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

#### 2.2 Create Workspace

1. After signing in, create a workspace
2. **Name**: "VideoBlade" or "videoblade-dev"
3. Click "Create workspace"

#### 2.3 Get API Keys

1. In Inngest dashboard, go to Settings (or Keys/API section)
2. You'll see two keys:
   - **Event Key**: Starts with `test_` for development
   - **Signing Key**: Starts with `signkey-` for webhook verification
3. Copy both keys

#### 2.4 Add Inngest Keys to .env

Edit `.env` and add:

```env
INNGEST_EVENT_KEY="test_abc123xyz..."
INNGEST_SIGNING_KEY="signkey-prod-abc123..."
```

#### 2.5 Note About Inngest Testing

We'll test Inngest in Step 7 (Inngest Setup) after we create the API endpoint. For now, having the keys is sufficient.

---

### Step 3: YouTube API Setup (30-60 minutes)

**Note**: You may already have Google OAuth configured for Better Auth. We need to verify it includes YouTube scopes.

#### 3.1 Google Cloud Console Project

1. Visit https://console.cloud.google.com/
2. If you already have a project from Better Auth setup:
   - Select it from the dropdown
   - Skip to step 3.2
3. If creating new:
   - Click "Select a project" dropdown → "New Project"
   - **Project name**: "VideoBlade"
   - Click "Create"

#### 3.2 Enable YouTube Data API v3

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it
4. Click "Enable"
5. Wait for it to enable (takes a few seconds)

#### 3.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. If already configured, verify it has YouTube scopes (skip to 3.4)
3. If not configured:
   - Choose **External** (unless you have a Google Workspace)
   - Click "Create"
4. Fill in App information:
   - **App name**: VideoBlade
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On "Scopes" page:
   - Click "Add or Remove Scopes"
   - Search for "YouTube"
   - Select these scopes:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/youtube.readonly`
   - Click "Update"
   - Click "Save and Continue"
7. On "Test users" page:
   - Click "Add Users"
   - Add your Google account email (the one you'll test with)
   - Click "Save and Continue"
8. Review and click "Back to Dashboard"

#### 3.4 Create/Verify OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Check if you already have OAuth 2.0 Client ID for VideoBlade/Better Auth
3. If yes:
   - Click on it to edit
   - Verify "Authorized redirect URIs" includes:
     - `http://localhost:3000/api/auth/callback/google`
   - If not, add it and click "Save"
   - Skip to step 3.5
4. If no OAuth credentials exist:
   - Click "Create Credentials" → "OAuth client ID"
   - **Application type**: Web application
   - **Name**: VideoBlade Dev
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "Create"
5. Copy your credentials:
   - Client ID
   - Client Secret

#### 3.5 Add Google Credentials to .env

Edit `.env` and verify/add:

```env
GOOGLE_CLIENT_ID="123456789-abc123xyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123xyz..."
```

**Note**: If you already have these from Better Auth setup, they should work! The OAuth consent screen now includes YouTube scopes.

#### 3.6 Important: YouTube API Quotas

- Default quota: **10,000 units/day**
- Video upload costs: ~1,600 units
- You can upload ~6 videos/day with default quota
- To increase quota:
  1. Go to "APIs & Services" → "YouTube Data API v3"
  2. Click "Quotas"
  3. Click "Request quota increase" (requires verification)
  4. For MVP testing, default quota is sufficient

---

## 📝 Final Checklist

Before proceeding to Step 1 (Database Schema):

- [ ] AWS S3 bucket created and accessible
- [ ] AWS IAM user created with S3 permissions
- [ ] AWS credentials added to `.env`
- [ ] S3 test script passes (`npx tsx scripts/test-s3.ts`)
- [ ] Inngest account created
- [ ] Inngest keys added to `.env`
- [ ] YouTube Data API v3 enabled
- [ ] OAuth consent screen configured with YouTube scopes
- [ ] Google OAuth credentials verified/added to `.env`
- [ ] Test user added to OAuth consent screen

---

## 🔍 Verification Commands

### Test Environment Variables

```bash
# Should not show any errors
npm run dev
# Press Ctrl+C to stop after it starts
```

### Test S3 Connection

```bash
npx tsx scripts/test-s3.ts
```

Expected: ✅ S3 upload successful!

### Verify AWS CLI (optional)

```bash
aws s3 ls s3://videoblade-dev-videos/
```

Should show the test.txt file if test passed.

---

## ⚠️ Troubleshooting

### S3 Test Fails

**Error: "Access Denied"**

- Check IAM user has correct permissions
- Verify credentials in `.env` are correct
- Ensure bucket name matches

**Error: "Bucket does not exist"**

- Verify bucket name in `.env` matches AWS
- Check you're in the correct AWS region

### YouTube API Issues

**Error: "Access Not Configured"**

- Ensure YouTube Data API v3 is enabled
- Wait 1-2 minutes after enabling

**OAuth Error: "Redirect URI Mismatch"**

- Verify redirect URI in Google Console matches exactly:
  `http://localhost:3000/api/auth/callback/google`
- No trailing slash!

**Error: "App not verified"**

- This is normal for development
- Add yourself as a test user in OAuth consent screen
- Click "Advanced" → "Go to VideoBlade (unsafe)" during login

---

## 🎉 Success!

Once all items in the checklist are complete, you're ready for:

**👉 Step 1: Database Schema Design**

See `memory-bank/roadmap/phase1/01-database-schema.md`

---

## 📚 References

- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- Inngest Documentation: https://www.inngest.com/docs
- YouTube Data API v3: https://developers.google.com/youtube/v3
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
