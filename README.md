# Projectant Management

Next.js + Prisma management system for admins, mentors, students, companies, units, and departments.

## What was fixed

- Synced the Prisma migration history with the current `User` model fields (`createdById`, `college`, `profileImage`).
- Added Prisma seed support for the required roles: `ADMIN`, `MENTOR`, `STUDENT`.
- Added initial-system bootstrap support at `/setup` and `/api/auth/bootstrap`.
- Fixed user-management authorization so mentors can only manage student accounts in their own hierarchy.
- Changed user delete behavior to **disable** instead of hard-delete.
- Fixed stale roles returned from user edit.
- Secured profile image upload with auth + type/size validation.
- Secured the UploadThing route middleware.
- Fixed the broken ESLint config.
- Added missing dashboard pages to avoid 404s from the sidebar.
- Removed the committed `.env` and replaced it with `.env.example`.

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy environment variables

```bash
cp .env.example .env
```

3. Run Prisma migrations

```bash
npx prisma migrate deploy
```

4. Seed the required roles

```bash
npm run db:seed
```

5. Start the app

```bash
npm run dev
```

## First-time initialization

After the app is running, open:

```text
http://localhost:3000/setup
```

Create the first `ADMIN` user there.

## Notes

- The first admin receives the temporary password from `DEFAULT_TEMP_PASSWORD`.
- The first login still forces a password change.
- User disable is implemented via `isActive = false`.
