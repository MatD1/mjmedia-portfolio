# MJ Media - Retro Gaming Portfolio

A full-featured portfolio web application with a retro gaming aesthetic, built with Next.js, TypeScript, and Tailwind CSS. Features GitHub OAuth authentication, admin dashboard, and content management for projects, blogs, stories, and posts.

## 🎮 Features

- **Retro Gaming Theme**: Pixel art aesthetics, neon colors, and CRT screen effects
- **Responsive Design**: Mobile-first approach with smooth animations
- **Content Management**: Full CRUD operations for projects, blogs, stories, and posts
- **Admin Dashboard**: Protected admin area with analytics integration
- **GitHub Authentication**: Secure login with role-based access control
- **Markdown Support**: Rich content editing with live preview
- **SEO Optimized**: Dynamic metadata, Open Graph, and structured data
- **Performance**: Optimized with Next.js Image, ISR, and code splitting

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom retro theme
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with GitHub OAuth
- **API**: tRPC for type-safe API calls
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Markdown**: React Markdown with remark-gfm

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- GitHub account (for OAuth)
- Umami analytics account (optional)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mjmedia-portfolio.git
   cd mjmedia-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables (see Environment Variables section below).

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
# For Railway/serverless add connection pool params:
# DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=20"
DATABASE_URL="postgresql://username:password@localhost:5432/mjmedia_portfolio"

# NextAuth.js
AUTH_SECRET="your-auth-secret-here"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# If you're migrating from NextAuth v4 you can keep NEXTAUTH_SECRET;
# the app will treat it the same as AUTH_SECRET.
# NEXTAUTH_SECRET="your-auth-secret-here"

# Admin Configuration
ADMIN_EMAILS="your-email@example.com,another-admin@example.com"

# Umami Analytics (Optional)
UMAMI_API_URL="https://your-umami-instance.com/api"
UMAMI_API_TOKEN="your-umami-api-token"
UMAMI_WEBSITE_ID="your-umami-website-id"

# Environment
NODE_ENV="development"

# (Optional) Database wake-up tuning
# DB_CONNECT_MAX_ATTEMPTS="10"
# DB_CONNECT_BASE_DELAY_MS="1000"
# DB_CONNECT_MAX_DELAY_MS="15000"
```

### Setting up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: MJ Media Portfolio
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local` file

### Setting up Umami Analytics (Optional)

1. Deploy Umami to your preferred platform or use the hosted version
2. Create a new website in Umami
3. Generate an API token in your Umami settings
4. Add the Umami tracking script to your site (already included in the layout)

## 🐳 Docker Support

If your hosting platform prefers Docker images (or you want to avoid env validation during the build step), you can ship this app via the included `Dockerfile`.

```bash
# Build the production image
docker build -t mjmedia-portfolio .

# Run locally (remember to pass env vars)
docker run --env-file .env.local -p 3000:3000 mjmedia-portfolio
```

`SKIP_ENV_VALIDATION` is set automatically in the build stage so the image can be created without injecting production secrets. You still **must** provide `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, and `DATABASE_URL` (plus any other optional vars) at runtime—Railway does this by exposing them as container environment variables.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── blog/              # Blog pages
│   ├── projects/          # Project pages
│   ├── stories/           # Story pages
│   └── about/             # About page
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── server/                # Server-side code
│   ├── api/               # tRPC routers
│   └── auth/              # Authentication config
├── styles/                # Global styles
└── trpc/                  # tRPC configuration
```

## 🎨 Customization

### Theme Colors

The retro gaming theme uses CSS custom properties defined in `src/styles/globals.css`:

```css
:root {
  --neon-cyan: #00ffff;
  --neon-pink: #ff00ff;
  --neon-green: #00ff00;
  --neon-yellow: #ffff00;
  --neon-orange: #ff8000;
  --neon-red: #ff0040;
  /* ... more colors */
}
```

### Adding New Content Types

1. Add the model to `prisma/schema.prisma`
2. Create a tRPC router in `src/server/api/routers/`
3. Add the router to `src/server/api/root.ts`
4. Create admin pages in `src/app/admin/`
5. Create public pages in `src/app/`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Database Migration

For production deployment, run:

```bash
npx prisma migrate deploy
```

## 📊 Admin Dashboard

Access the admin dashboard at `/admin` (requires admin role):

- **Dashboard**: Overview of content and analytics
- **Projects**: Manage portfolio projects
- **Blog Posts**: Create and edit blog posts
- **Stories**: Manage personal stories
- **Posts**: Handle general posts
- **Analytics**: View Umami analytics (when configured)

## 🎮 Retro Gaming Features

- **CRT Screen Effect**: Animated scanlines for authentic retro feel
- **Pixel Fonts**: Press Start 2P font for headings and UI elements
- **Neon Glows**: CSS effects for buttons and interactive elements
- **Game-style Animations**: Smooth transitions and hover effects
- **Retro Color Palette**: Authentic 8-bit inspired colors

## 🔒 Security

- Role-based access control (RBAC)
- Protected admin routes
- CSRF protection via NextAuth.js
- Input validation with Zod schemas
- SQL injection protection via Prisma

## 📱 Responsive Design

- Mobile-first CSS approach
- Touch-friendly interface
- Responsive typography
- Optimized for all screen sizes

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- High contrast colors

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript checks
- `npm run check` - Run Biome linter
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name your-migration-name

# Reset the database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Prisma](https://prisma.io/) - Database ORM
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) - Pixel font

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/mjmedia-portfolio/issues) page
2. Create a new issue with detailed information
3. Contact me directly at your-email@example.com

---

Built with ❤️ and lots of ☕ by [Your Name](https://github.com/yourusername)