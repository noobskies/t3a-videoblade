# 🎬 VideoBlade

**The Ultimate Content Creator Platform**

VideoBlade is a comprehensive SaaS platform designed for content creators to streamline their video publishing workflow. Upload once, schedule everywhere, and manage your content across multiple social media platforms with powerful editing tools and analytics.

## ✨ Features

### 🎯 Core Features (MVP)

- **Multi-Platform Publishing**: Schedule videos to YouTube, TikTok, Instagram, Facebook, and more
- **Smart Scheduling**: Calendar and list views with drag-and-drop capabilities
- **Video Management**: Organize, preview, and manage your video library
- **YouTube Integration**: Seamless connection with YouTube channels

### 🚀 Advanced Features (Coming Soon)

- **Video Editing Suite**: Clip videos, add subtitles, and basic editing tools
- **Live Streaming**: Go live on multiple platforms simultaneously
- **Analytics Dashboard**: Track performance across all platforms
- **Bulk Operations**: Schedule multiple videos at once
- **Team Collaboration**: Share access with team members

### 💰 Subscription Tiers

- **Free**: 5 videos/month, 1 platform
- **Pro ($2.99/month)**: 50 videos/month, all platforms, basic editing
- **Premium ($9.99/month)**: Unlimited videos, advanced features, live streaming

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers
- **Styling**: Tailwind CSS
- **API**: tRPC for type-safe APIs
- **File Storage**: Vercel Blob / AWS S3
- **Video Processing**: FFmpeg / Mux API
- **Payments**: Stripe
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (for YouTube integration)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/videoblade.git
   cd videoblade
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/videoblade"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth (for YouTube)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # File Storage
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

   # YouTube API
   YOUTUBE_API_KEY="your-youtube-api-key"

   # Stripe (for payments)
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
   ```

4. **Set up the database**

   ```bash
   npm run db:push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Protected routes (requires login)
│   │   ├── dashboard/            # Main dashboard
│   │   ├── videos/               # Video management
│   │   ├── calendar/             # Scheduling calendar
│   │   ├── analytics/            # Performance analytics
│   │   ├── settings/             # User settings
│   │   └── billing/              # Subscription management
│   ├── (public)/                 # Public routes
│   │   ├── pricing/              # Pricing page
│   │   ├── features/             # Features showcase
│   │   └── about/                # About page
│   └── api/                      # API routes
│       ├── auth/                 # Authentication
│       ├── videos/               # Video operations
│       ├── upload/               # File upload handling
│       ├── youtube/              # YouTube API integration
│       ├── scheduling/           # Post scheduling
│       └── webhooks/             # External webhooks
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (buttons, inputs, etc.)
│   ├── forms/                   # Form components
│   ├── video/                   # Video-related components
│   ├── calendar/                # Calendar components
│   ├── dashboard/               # Dashboard-specific components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
│   ├── youtube-api.ts           # YouTube API wrapper
│   ├── video-processing.ts     # Video processing utilities
│   ├── upload-handler.ts       # File upload logic
│   ├── scheduler.ts             # Scheduling logic
│   ├── payments.ts              # Stripe integration
│   └── platforms/               # Platform-specific integrations
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
├── utils/                       # Helper functions
└── styles/                      # Global styles
```

## 🗄 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts and subscription info
- **Channel**: Connected social media channels
- **Video**: Uploaded video files and metadata
- **ScheduledPost**: Scheduled publications
- **VideoClip**: Video clips and edits

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma client

### Code Style

- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict mode enabled
- **Tailwind CSS**: Utility-first styling

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- Database connection string
- OAuth credentials
- API keys
- Stripe keys
- File storage credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.videoblade.com](https://docs.videoblade.com)
- **Discord**: [Join our community](https://discord.gg/videoblade)
- **Email**: support@videoblade.com

## ✅ Verified Working Features

### 🏗️ Project Foundation

- [x] T3 Stack setup with Next.js 15, TypeScript, Tailwind CSS
- [x] Prisma database schema with comprehensive models
- [x] NextAuth.js authentication configuration
- [x] TypeScript type definitions for all entities
- [x] Utility functions and constants
- [x] Environment configuration setup
- [x] Project directory structure

### 🔐 Authentication System

- [x] Google OAuth integration
- [x] YouTube API authentication
- [x] User profile management
- [x] Subscription tier validation (basic implementation)

### 🎬 Video Management

- [x] Video file upload with progress tracking
- [x] Video metadata form and validation
- [x] Video library interface with grid view
- [x] Video statistics and usage tracking
- [x] Video deletion with soft delete
- [x] Search and filtering by title, description, tags
- [x] Sorting by date, title, duration, file size
- [x] Infinite scroll pagination
- [ ] Video metadata extraction (FFmpeg)
- [ ] Video preview and player
- [ ] Thumbnail generation

### 📺 YouTube Integration

- [ ] YouTube channel connection
- [ ] Video upload to YouTube
- [ ] Metadata synchronization
- [ ] API rate limit handling

### 📅 Scheduling System

- [ ] Basic scheduling interface
- [ ] Calendar view
- [ ] Scheduled post management
- [ ] Multi-platform publishing

### 🎨 UI/UX

- [x] Basic dashboard layout
- [x] Video upload component with progress
- [x] Video library grid interface
- [x] Responsive navigation
- [x] Loading states and error handling
- [x] Tab-based navigation
- [ ] Design system components
- [ ] Advanced UI components

### 🗄️ Backend API

- [x] Complete tRPC video router with CRUD operations
- [x] File upload API with Vercel Blob integration
- [x] Input validation with Zod schemas
- [x] Error handling and user feedback
- [x] Subscription tier limits enforcement
- [x] Usage tracking and statistics
- [ ] YouTube API integration
- [ ] Scheduling system backend

## 🗺 Roadmap

See our [TODO.md](TODO.md) file for detailed development roadmap and current progress.

---

**Built with ❤️ for content creators worldwide**
