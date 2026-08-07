# Fullstack Healthcare

Fullstack Healthcare is a modern healthcare management web application built with Next.js, TypeScript, Prisma, Clerk authentication, and Tailwind CSS. It is designed to help clinics and hospitals manage patients, doctors, appointments, medical records, billing, and administrative workflows in a single platform.

## Features

- Patient management
- Doctor and staff management
- Appointment booking and tracking
- Medical history and records
- Billing and payment flow
- Admin dashboard and insights

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Clerk Authentication
- Tailwind CSS
- shadcn/ui

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/fullstack-healthcare.git
cd fullstack-healthcare
```

### 2. Install dependencies

```bash
npm install

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Deployment

This project can be deployed easily on Vercel. Make sure to set the same environment variables in the deployment platform.
