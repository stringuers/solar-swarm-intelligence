# CTF Platform

A modern Capture The Flag (CTF) platform built with Next.js, React, and PostgreSQL.

## Features

- User authentication (email/password + GitHub)
- Team management
- Challenge categories (web, crypto, forensics, etc.)
- Real-time scoreboard
- Flag submission and validation
- Admin panel for challenge management
- Markdown support for challenge descriptions
- File attachments for challenges
- Hints system
- Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Hosting**: Vercel (frontend & backend) + Railway (PostgreSQL)
- **DevOps**: Docker + GitHub Actions

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (optional)
- GitHub account (for OAuth)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ctf-platform.git
   cd ctf-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in the required environment variables in `.env`.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Docker Setup

1. Build the Docker image:
   ```bash
   docker build -t ctf-platform .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 ctf-platform
   ```

## Deployment

1. Set up a PostgreSQL database on Railway
2. Deploy the application to Vercel
3. Configure environment variables in Vercel
4. Set up GitHub Actions secrets for CI/CD

## Development

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── challenges/     # Challenge pages
│   └── scoreboard/     # Scoreboard page
├── components/         # React components
├── lib/               # Utility functions
└── types/             # TypeScript types
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
