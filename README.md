# Grind Quest 🚀

A gamified social engagement platform for the $GRIND token community. Complete quests, earn points, and climb the leaderboard!

## Features

- 🐦 **Twitter/X Authentication** - Connect with your X account
- 🎯 **Quest System** - Complete daily quests to earn points
- 🏆 **Live Leaderboard** - See top 100 $GRIND earners
- 💰 **Points & Rewards** - Earn points for social engagement
- 📊 **Activity Tracking** - Track your posts and bonus points
- 🌙 **Dark Theme** - Beautiful dark UI with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: Supabase
- **Data Fetching**: SWR
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- Twitter/X Developer account

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Twitter OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Twitter API
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Enable Row Level Security (RLS) policies

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/grind-quest.git
cd grind-quest

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
grind-quest/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── features/          # Feature-specific components
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx      # Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   └── supabase/         # Supabase clients
├── types/                 # TypeScript types
└── supabase/             # Database schema
```

## Quest System

Users can complete various quests to earn points:

- **Follow @grindcoin** - 100 points
- **Post about $GRIND** - 200 points
- **Reply to a $GRIND post** - 50 points
- **Repost $GRIND content** - 75 points

### Bonus Points

- 🔁 **Repost**: +50 points
- 💬 **Reply**: +25 points
- 📝 **Quote**: +120 points
- 🔥 **Viral** (1000+ engagements): +500 points

## API Endpoints

- `GET /api/me` - Get current user data
- `GET /api/leaderboard` - Get leaderboard data
- `POST /api/quests/complete` - Complete a quest

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code
npm run format
```

## Deployment

The app is configured for deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)
