# HapoHub - Digital Marketing Content Hub

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-green?logo=supabase)](https://supabase.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blueviolet?logo=tailwind-css)](https://tailwindcss.com/)
[![Shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)](https://ui.shadcn.com/)
[![Genkit](https://img.shields.io/badge/Genkit-1.x-orange?logo=google-cloud)](https://firebase.google.com/docs/genkit)

HapoHub is a full-stack Next.js application designed as a centralized content management platform for digital marketing materials. It provides a robust and scalable foundation for both clients and administrators to manage, upload, and organize content efficiently.

## ✨ Features

- **Dual Dashboards**: Separate, feature-rich dashboards for clients and administrators.
- **Secure Authentication**: Built with Supabase Auth, supporting email/password sign-in, magic links, and secure session management.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `client` and `admin` roles, enforced by Supabase's Row Level Security (RLS).
- **Content Management**: A comprehensive system for uploading, viewing, and organizing content like images, videos, and documents.
- **Client & Store Management**: Admins can manage clients, their stores, and view their content libraries.
- **AI-Powered Features**: Integrates Google's Genkit for generative AI capabilities, such as secure link generation.
- **Modern UI**: A sleek, responsive, and accessible user interface built with **shadcn/ui** and **Tailwind CSS**.
- **Theming**: Supports both light and dark modes, which can be switched by the user.

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hapohub.git
cd hapohub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of your project by copying the example file:

```bash
cp .env.example .env
```

You will need to populate this file with your Supabase project credentials. Find these in your Supabase project's dashboard under `Project Settings` > `API`.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Google AI (for Genkit)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 4. Set Up the Database

The project uses Supabase for its database. The required SQL schema, including tables, policies for Row Level Security, and database functions, can be found in `supabase/db.sql`.

1.  Navigate to the **SQL Editor** in your Supabase dashboard.
2.  Copy the entire content of `supabase/db.sql`.
3.  Paste it into a new query and click **RUN**.

This will set up the `profiles`, `stores`, and `content` tables, along with the necessary security policies.

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

- **Client Dashboard**: `http://localhost:3000/dashboard`
- **Admin Dashboard**: `http://localhost:3000/admin`

## 🛠️ Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
- `npm run release:tag`: Creates a Git tag for the current version specified in `package.json`. Used by the release workflow.

## 💻 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **AI Integration**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation

## 📁 Project Structure

The project follows a standard Next.js App Router structure with a top-level `src` directory.

```
/
├── src/
│   ├── app/                # Next.js App Router: pages, layouts, and server actions
│   ├── components/         # Reusable React components (UI, client, admin)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions, Supabase clients, types
│   ├── ai/                 # Genkit flows and AI-related logic
│   └── middleware.ts       # Next.js middleware for session management and route protection
├── public/                 # Static assets
├── supabase/
│   └── db.sql              # Database schema and RLS policies
├── .env                    # Environment variables (gitignored)
├── next.config.js          # Next.js configuration
└── package.json            # Project dependencies and scripts
```

## ☁️ Deployment

This application is configured for deployment on **Firebase App Hosting**. The `apphosting.yaml` file contains the basic configuration. To deploy, you can use the Firebase CLI.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
