# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4] - YYYY-MM-DD

### Added
- Created a detailed `README.md` with project overview, setup instructions, and tech stack information.
- Added this `changelog.md` to track project versions and changes.
- Implemented a `release.yml` GitHub Actions workflow to automate the creation of GitHub releases.
- Added `release:tag` script to `package.json` for version tagging.

### Changed
- Improved session management by refactoring Supabase client creation and middleware logic.
- Centralized all route protection and redirection logic into `src/middleware.ts`.
- Enhanced `useAuthForm` hook to correctly use `FormData` and handle role-based redirection after sign-in.
- Corrected the `handle_new_user` SQL function to sync user roles to `app_metadata` on creation, fixing redirects for new users.
- Added a "Sync All User Roles" feature for administrators to fix redirection for existing users.
- Updated `db.sql` to ensure user roles are synced on both insert and update operations.

### Fixed
- Fixed a rendering error in the Header component by making it a Client Component.
- Resolved an issue where an inline Server Action was incorrectly defined inside a Client Component.
- Ensured that Supabase sends a verification email on user sign-up by setting `email_confirm: true`.
- Corrected the post-verification redirect logic in `/auth/callback` to be role-based.
- Cleaned up redundant and nested `app` directory structure.

### Removed
- Removed all code related to Google Sign-In and Google One-Tap to simplify the authentication flow.

## [0.1.0] - YYYY-MM-DD

### Added
- Initial project setup with Next.js App Router.
- Integrated Supabase for database, authentication, and storage.
- Implemented core authentication features: sign-up, sign-in, sign-out.
- Created basic layouts for client and admin dashboards.
- Styled with Tailwind CSS and shadcn/ui components.
- Set up initial data actions for fetching and creating data.
