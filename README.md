# The Crawford Team - Luxury Real Estate Platform

A sophisticated real estate platform for The Crawford Team at Keller Williams, specializing in luxury properties in St. Petersburg, Florida.

## 🏡 About

The Crawford Team is a premier real estate group dedicated to providing exceptional service in the luxury property market. Our platform offers:

- **Luxury Property Listings** - Showcase of premium properties with detailed information
- **Member Portal** - Exclusive access for verified members
- **AI-Powered Property Analysis** - Advanced dossier processing and property insights
- **Professional Admin Dashboard** - Comprehensive property management tools
- **Responsive Design** - Optimized for all devices with elegant UI/UX

## ✨ Features

### For Clients
- Browse luxury property listings with high-quality imagery
- Advanced search and filtering capabilities
- Detailed property information and virtual tours
- Contact forms and consultation booking
- Mobile-responsive design

### For Team Members
- Secure member portal with exclusive listings
- Advanced property management tools
- AI-powered property dossier processing
- Analytics and performance tracking
- Content management system

### For Administrators
- Complete property lifecycle management
- Image upload and optimization
- Client relationship management
- Performance analytics dashboard
- API key management and monitoring

## 🛠 Technology Stack

This platform is built with modern web technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui with custom variants
- **Database**: Supabase with PostgreSQL
- **Authentication**: Supabase Auth with Row Level Security
- **File Storage**: Supabase Storage for images and documents
- **AI Integration**: OpenAI GPT-4 Vision for property analysis
- **Animations**: Framer Motion for smooth interactions
- **State Management**: TanStack Query for server state

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project setup

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd crawford-team-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and API keys

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── admin/          # Admin-specific components
├── pages/              # Page components and routing
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── integrations/       # External service integrations
└── assets/            # Static assets and images

supabase/
├── functions/          # Edge functions for AI processing
└── migrations/         # Database migrations
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Authentication** - Secure user authentication with Supabase
- **Protected Routes** - Client-side route protection
- **API Key Management** - Secure storage of sensitive credentials
- **Input Validation** - Comprehensive form and data validation

## 📊 Analytics & Performance

- Real-time analytics dashboard
- Performance monitoring
- User engagement tracking
- Property view analytics
- Lead generation metrics

## 🚀 Deployment

The platform can be deployed on multiple platforms:

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel via GitHub integration
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Custom Server
```bash
npm run build
# Serve dist/ folder with your preferred web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by The Crawford Team. All rights reserved.

## 📞 Contact

**The Crawford Team**
- Website: [thecrawfordteam.com](https://thecrawfordteam.com)
- Email: info@thecrawfordteam.com
- Phone: (727) 555-0123
- Location: St. Petersburg, FL

---

*Built with ❤️ for luxury real estate excellence*
