# 🎬 VideoBlade

**The Ultimate Content Creator Platform**

VideoBlade is a comprehensive SaaS platform designed for content creators to streamline their video publishing workflow. Upload once, schedule everywhere, and manage your content across multiple social media platforms.

## 📚 Documentation

For complete project documentation, please see the `/docs` directory:

- **[📖 Project Overview & Setup](docs/README.md)** - Complete project documentation, features, and installation guide
- **[📋 Development Roadmap](docs/TODO.md)** - Detailed development checklist with 500+ granular tasks
- **[📡 API Documentation](docs/API.md)** - Complete API reference for tRPC procedures and REST endpoints

## 🚀 Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

3. **Set up the database**

   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers
- **API**: tRPC for type-safe APIs
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## ✅ Current Status

**Phase 1: MVP Foundation** - Setting up core infrastructure

See [docs/README.md](docs/README.md) for verified working features and [docs/TODO.md](docs/TODO.md) for detailed development progress.

## 🤝 Contributing

1. Read the [development rules](.clinerules) for coding standards
2. Check [docs/TODO.md](docs/TODO.md) for available tasks
3. Follow the documentation-driven development approach
4. Update docs when adding features

---

**Built with ❤️ for content creators worldwide**
