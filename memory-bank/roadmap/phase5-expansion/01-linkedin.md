# Phase 5, Step 1: LinkedIn Integration

## Overview

Add support for connecting LinkedIn accounts and publishing content (text, images, video) to LinkedIn profiles.

## Requirements

1.  **Authentication**: Allow users to connect their LinkedIn account via OAuth.
2.  **Publishing**: Support posting text updates, images, and videos.
3.  **Scheduling**: Integrate with the existing scheduling system.

## Technical Implementation

### 1. Database Schema

Update the `Platform` enum in `prisma/schema.prisma` to include `LINKEDIN`.

```prisma
enum Platform {
  YOUTUBE
  RUMBLE
  TIKTOK
  VIMEO
  LINKEDIN // New
}
```

### 2. Environment Variables

Register a new app in the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
Required Env Vars:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

### 3. Authentication (Better Auth)

Configure the LinkedIn provider in `src/server/auth.ts`.

**Scopes Required**:

- `openid`: Use OpenID Connect for identity.
- `profile`: Retrieve name and photo.
- `email`: Retrieve email address.
- `w_member_social`: Create posts on behalf of the member.

### 4. LinkedIn Library (`src/lib/linkedin.ts`)

Create a helper library to interact with the LinkedIn API.

**Key Functions**:

- `getLinkedInProfile(accessToken)`: Fetch user details (URN, name, avatar).
- `publishToLinkedIn(accessToken, content)`: Post content to the feed.
  - Handle text-only posts.
  - Handle media uploads (initialize, upload, finalize) for images/video.

### 5. Background Job (`src/inngest/publish-to-linkedin.ts`)

Create an Inngest function to handle the actual publishing logic asynchronously.

- Fetch post data from DB.
- Retrieve valid access token.
- Call `publishToLinkedIn`.
- Update `PublishJob` status.

### 6. Frontend Updates

- **Platform Card**: Add LinkedIn to the "Connect Platforms" list (`src/app/platforms/client-page.tsx`).
- **Icons**: Add LinkedIn icon to UI components.
- **Post Creator**: Ensure LinkedIn is selectable as a destination.

## API Reference (LinkedIn v2)

- **UserInfo**: `https://api.linkedin.com/v2/userinfo` (OIDC)
- **Post (UGC)**: `https://api.linkedin.com/v2/ugcPosts` (Legacy) or the newer **Posts API** `https://api.linkedin.com/rest/posts`.
  - _Note_: We should check which API is current recommended for `w_member_social`. The "Sign In with LinkedIn using OpenID Connect" product typically pairs with the specific posting API.

## UX Considerations

- LinkedIn posts often have "text" + "media".
- Visibility settings (Public vs Connections) might be relevant, but MVP will default to Public.
