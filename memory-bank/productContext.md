# Product Context: t3a-videoblade

## Why This Project Exists

**VideoBlade** (evolving to MediaBlade) exists to solve the chaos of managing a modern social media presence. Creators and brands are expected to be everywhere—YouTube, TikTok, LinkedIn, X, Instagram—but managing these channels individually is disjointed and inefficient.

### The Problem

1.  **Fragmented Workflows**: Video goes to YouTube, text to LinkedIn, images to Instagram. Each platform has its own interface.
2.  **Planning Chaos**: Spreadsheets and disconnected calendars make it hard to visualize the overall content strategy.
3.  **Posting Fatigue**: Manually logging in to post at specific times breaks focus.
4.  **Engagement Silos**: Comments are scattered across 5+ inboxes.

### The Solution

A **Unified Media Command Center** (Buffer Clone):

1.  **Centralized Planning**: Visual calendar for all content types (Video, Image, Text).
2.  **Smart Scheduling**: "Queue" system where you define slots, and content fills them automatically.
3.  **Unified Engagement**: One inbox for all comments and replies.
4.  **Multi-Format**: First-class support for video, images, and text posts.

## Problems It Solves

### Content Creator Workflow Problems

- **Time Waste**: Eliminates repetitive manual uploads.
- **Context Switching**: managing 5 platforms = 5 different mindsets/UI.
- **Inconsistency**: "Set and forget" queue ensures consistent posting cadence.
- **Missed Engagement**: Unified inbox ensures no comment goes unanswered.

## How It Should Work

### 1. Connect & Setup (Onboarding)

1.  User connects accounts: YouTube, TikTok, Vimeo (Video), LinkedIn, X, Instagram (Social).
2.  **Queue Setup**: User defines "Posting Slots" (e.g., "LinkedIn: Mon/Wed/Fri at 9 AM", "TikTok: Daily at 6 PM").
3.  User sets time zone and default preferences.

### 2. Visual Planning (Calendar)

1.  User opens **Calendar View**.
2.  Sees a drag-and-drop interface of the month/week.
3.  Can drag a "Draft" from the sidebar onto a date.
4.  Can drag an existing scheduled post to a new date/time.
5.  Visual indicators for platform icons (YouTube red, LinkedIn blue, etc.).

### 3. The Queue Workflow (Buffer Style)

1.  User creates a post (Video, Image, or Text).
2.  Selects platforms (e.g., LinkedIn + X).
3.  Clicks **"Add to Queue"**.
4.  System automatically schedules it for the _next available slot_ for each platform.
    - _Example_: LinkedIn slot is tomorrow at 9 AM. X slot is today at 5 PM.
5.  User doesn't need to pick dates manually unless they want to ("Schedule for Specific Time").

### 4. Unified Inbox (Engagement)

1.  User opens **Inbox**.
2.  See a stream of unread comments from all connected platforms.
3.  Click a comment to see context.
4.  Type reply and hit "Send".
5.  Mark as "Done/Resolved" to clear from view.

## User Experience Goals

### MVP (Phase 1-3 - Foundation)

- **Robust**: Reliable video uploading and publishing.
- **Connected**: YouTube, TikTok, Vimeo integration.
- **Insightful**: Basic analytics dashboard.

### Core Buffer Experience (Phase 4)

- **Visual**: "What you see is what you get" calendar planning.
- **Effortless**: "Add to Queue" should feel magical—no date picking required.
- **Flexible**: Handle a 4K video for YouTube and a text thread for X in the same flow.

### Expansion & Engagement (Phase 5-6)

- **Comprehensive**: Support for all major social networks.
- **Responsive**: Real-time comment syncing.
- **Collaborative**: Teams can draft and approve content.

## Target Users

### Primary Persona: The Social Media Manager

**Name**: Alex, Agency SMM

**Background**:

- Manages social for 3 small brands.
- Needs to post 15-20 times a week across various platforms.
- Uses spreadsheets to plan, but hates the disconnect from actual posting.

**Pain Points**:

- Approval delays from clients.
- Manually posting at "best times" (evenings/weekends).
- Missing comments on posts from last week.

**How VideoBlade Helps**:

- **Calendar**: Shows clients exactly what's planned visually.
- **Queue**: Batches work on Monday, system handles posting all week.
- **Inbox**: Never misses a client's customer interaction.

### Secondary Persona: The Video-First Creator

**Name**: Sarah, Educational YouTuber

**Background**:

- Makes deep-dive videos on YouTube.
- Needs to promote them on LinkedIn (text), X (clips), and TikTok (cuts).

**How VideoBlade Helps**:

- Uploads main video once.
- Schedules the "promotion ecosystem" (tweets, LinkedIn posts) to fire after the video goes live.

## Success Metrics

### User Success Metrics

- **Posts per Week**: Increase in posting frequency due to easier tools.
- **Queue Depth**: Average number of items in queue (shows trust in system).
- **Time Saved**: Reduction in scheduling time vs. manual posting.

### Technical Success Metrics

- **Queue Reliability**: 99.9% of queued posts fire within 1 minute of slot time.
- **Media Processing**: Images resized/optimized correctly for each platform.
- **API Quota Management**: Smart handling of daily limits across platforms.

## Future Considerations

### Mobile App

- While web-only for now, a mobile app is often requested for "on the go" photo posting (Instagram style).

### AI Assistance

- "Remix" feature: Turn a video caption into a LinkedIn post automatically.
- "Best Time" suggestions based on engagement data.
