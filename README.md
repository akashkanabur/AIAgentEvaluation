# AIAgentEvaluation

#Project Overview

A production-ready Next.js web application for evaluating AI agent performance with multi-tenant architecture, real-time analytics, and comprehensive data management capabilities.

#Technical Architecture

Frontend: Next.js 14, React, TypeScript, Tailwind CSS
Backend: Next.js API Routes
Database: Supabase (PostgreSQL) with Row Level Security
Charts: Recharts for data visualization
Deployment: Vercel-ready configuration

#Features Implimented

1]Multi-tenant Supabase Auth with RLS policies
2]Hybrid authentication (Supabase + local fallback)
3]Protected routes and session management
4]User isolation (each user sees only their data)

#API and Data Ingestion

1]POST /api/evals/ingest endpoint
2]Automatic sampling based on configuration
3]Daily limit enforcement

├── app/                    # Next.js app directory
│   ├── api/evals/ingest/   # API endpoint
│   ├── dashboard/          # Main dashboard
│   ├── config/             # Configuration page
│   └── evaluation/[id]/    # Detail drill-down
├── components/             # React components
├── lib/                    # Utilities (Supabase clients)
├── supabase/              # Database schema
└── scripts/               # Seed data generator


The framework is fully functional, scalable, and ready for production deployment with comprehensive error handling, fallback mechanisms, and professional-grade architecture.

<img width="1166" height="852" alt="Screenshot 2025-10-22 112124" src="https://github.com/user-attachments/assets/1f9fbfd1-9d96-4d37-a862-418a4934fff8" />

<img width="1549" height="672" alt="Screenshot 2025-10-22 114427" src="https://github.com/user-attachments/assets/d4f22959-d9eb-4727-b5d5-582062097bec" />







