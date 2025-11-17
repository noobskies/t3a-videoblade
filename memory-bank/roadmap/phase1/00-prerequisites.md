# Phase 1: Prerequisites & Infrastructure Setup

## Goal

Set up all external services and credentials needed for VideoBlade MVP (YouTube publishing).

**Estimated Time**: 2-4 hours (mostly account setup and waiting for approvals)

---

## Prerequisites

- [x] T3 Stack foundation complete
- [x] Better Auth with Google OAuth working
- [ ] AWS account (or create one)
- [ ] Inngest account (free tier available)
- [ ] Google Cloud Console project

---

## Tasks

### 1. AWS S3 Setup

- [ ] **Create AWS Account** (if needed)
  - Visit https://aws.amazon.com/
  - Sign up for free tier
- [ ] **Create S3 Bucket**
  - Name: `videoblade-dev-videos` (development)
  - Region: Choose closest to you (e.g., `us-east-1`)
  - Block all public access: ✅ Yes (we'll use presigned URLs)
  - Versioning: Optional (not needed for MVP)
- [ ] **Configure CORS** for bucket
  - Allow uploads from localhost:3000
  - See code snippet below
- [ ] **Create IAM User** for programmatic access
  - User name: `videoblade-s3-uploader`
  - Permissions: AmazonS3FullAccess (or custom policy - see below)
  - Get Access Key ID and Secret Access Key
- [ ] **Save credentials** to `.env`

**S3 CORS Configuration**:

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

**Custom IAM Policy** (more secure than FullAccess):

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

### 2. Inngest Setup

- [ ] **Create Inngest Account**
  - Visit https://www.inngest.com/
  - Sign up with GitHub or email
  - Create workspace: "VideoBlade"
- [ ] **Get Inngest Keys**
  - Event Key (starts with `test_`)
  - Signing Key (for webhook verification)
- [ ] **Install Inngest SDK**
  - Run: `npm install inngest`
- [ ] **Save credentials** to `.env`

**Note**: Inngest's free tier includes:

- 50,000 function runs/month
- Unlimited events
- Perfect for MVP development

### 3. YouTube API Setup

- [ ] **Create Google Cloud Project** (if not exists)
  - Visit https://console.cloud.google.com/
  - Create new project: "VideoBlade"
- [ ] **Enable YouTube Data API v3**
  - Navigate to "APIs & Services" > "Library"
  - Search for "YouTube Data API v3"
  - Click "Enable"
- [ ] **Configure OAuth Consent Screen**
  - External (for testing with real accounts)
  - App name: "VideoBlade"
  - User support email: Your email
  - Developer contact: Your email
  - Scopes: Add YouTube scopes (below)
  - Test users: Add your Google account
- [ ] **Create OAuth 2.0 Credentials**
  - Type: Web application
  - Name: "VideoBlade Dev"
  - Authorized redirect URIs:
    - `http://localhost:3000/api/auth/callback/google`
  - Get Client ID and Client Secret
- [ ] **Save credentials** to `.env`

**Required OAuth Scopes** (already in Better Auth config):

- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube.readonly`

**Important**: YouTube API has daily quota limits. Default is 10,000 units/day.

- Video upload costs ~1,600 units
- Can upload ~6 videos/day with default quota
- Request quota increase if needed

### 4. Vercel Postgres Setup

- [ ] **Create Vercel Account** (if not exists)
  - Visit https://vercel.com/
  - Sign up with GitHub
- [ ] **Create Postgres Database**
  - Go to Storage > Create Database
  - Choose "Postgres"
  - Name: `videoblade-dev`
  - Region: Same as your primary region
  - Free tier available
- [ ] **Get Database URL**
  - Copy connection string (includes host, user, password)
- [ ] **Save to `.env`** as `DATABASE_URL`

**Note**: For local development, you can continue using SQLite. Switch to Postgres when ready for production or preview deployments.

---

## Environment Variables

Update `.env` with all credentials:

```bash
# Database (keep SQLite for now, switch to Postgres later)
DATABASE_URL="file:./db.sqlite"
# For Postgres: DATABASE_URL="postgres://..."

# Better Auth (already configured)
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS S3 (NEW)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET_NAME="videoblade-dev-videos"

# Inngest (NEW)
INNGEST_EVENT_KEY="test_..."
INNGEST_SIGNING_KEY="signkey-..."

# Optional: For production
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Update `src/env.js` to validate new variables:

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    // AWS S3
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_S3_BUCKET_NAME: z.string(),

    // Inngest
    INNGEST_EVENT_KEY: z.string(),
    INNGEST_SIGNING_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,

    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,

    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

---

## Installation

Install required packages:

```bash
npm install inngest @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Package purposes**:

- `inngest` - Background job processing
- `@aws-sdk/client-s3` - AWS S3 operations
- `@aws-sdk/s3-request-presigner` - Generate presigned upload URLs

---

## Testing

### Verify AWS S3 Access

Create `scripts/test-s3.ts`:

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../src/env.js";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3() {
  try {
    const result = await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: "test.txt",
        Body: "Hello from VideoBlade!",
      }),
    );
    console.log("✅ S3 upload successful:", result);
  } catch (error) {
    console.error("❌ S3 upload failed:", error);
  }
}

testS3();
```

Run: `npx tsx scripts/test-s3.ts`

### Verify Inngest Connection

Will test after setting up Inngest integration (next files).

### Verify YouTube API Access

Better Auth already handles OAuth. We'll test YouTube API calls in later steps.

---

## Common Issues

**AWS Credentials Not Working**:

- Ensure IAM user has correct permissions
- Check that credentials are saved in `.env`
- Verify bucket name is correct
- Try AWS CLI: `aws s3 ls s3://videoblade-dev-videos`

**YouTube OAuth Not Working**:

- Verify redirect URI matches exactly (including http/https)
- Ensure test users are added in OAuth consent screen
- Check that YouTube Data API is enabled
- Clear browser cookies and try again

**Inngest Keys Invalid**:

- Make sure you're using the correct workspace
- Event key should start with `test_` for development
- Regenerate keys if needed from Inngest dashboard

---

## Security Notes

⚠️ **Never commit `.env` to Git** - It's already in `.gitignore`

⚠️ **Rotate credentials regularly** in production

⚠️ **Use separate credentials** for dev/staging/production

⚠️ **AWS IAM**: Use least privilege principle (custom policy, not FullAccess)

---

## Checklist Summary

Before moving to database schema:

- [ ] AWS S3 bucket created and accessible
- [ ] AWS credentials in `.env`
- [ ] Inngest account created
- [ ] Inngest keys in `.env`
- [ ] YouTube API enabled
- [ ] Google OAuth configured with YouTube scopes
- [ ] All packages installed
- [ ] `src/env.js` updated and validated
- [ ] S3 test script runs successfully

**Estimated Completion**: ✅ 2-4 hours

---

## Next Step

Once all prerequisites are complete:

👉 **[01-database-schema.md](./01-database-schema.md)** - Design and implement database models for videos, platforms, and publish jobs
