# Database Setup Guide

This document provides instructions for setting up and working with the database for the GIS (Grant Information System) project.

## Database Schema

The database schema is designed to track and manage:

- Donors and their donations
- Campaigns for fundraising
- Projects funded by campaigns
- Beneficiaries of projects
- Financial records for both campaigns and projects
- KPIs to track project performance
- Staff members and their assigned tasks
- Reports for both campaigns and projects

## Setup Instructions

### Prerequisites

- Docker installed and running
- Node.js v18+ and pnpm installed

### Initial Setup

1. **Start the database and set up the schema**

   ```bash
   pnpm db:setup
   ```

   This script will:

   - Start a PostgreSQL container using Docker
   - Apply the Prisma schema to create tables
   - Generate the Prisma client
   - Seed the database with initial data

2. **View the database with Prisma Studio**

   ```bash
   pnpm db:studio
   ```

   This will open a web interface at http://localhost:5555 where you can browse and edit data.

### Manual Database Operations

If you need to perform database operations manually:

- **Start the database container**

  ```bash
  pnpm docker:up
  ```

- **Stop the database container**

  ```bash
  pnpm docker:down
  ```

- **Generate Prisma Client after schema changes**

  ```bash
  pnpm db:generate
  ```

- **Push schema changes to the database**

  ```bash
  pnpm db:push
  ```

- **Seed the database with sample data**
  ```bash
  pnpm db:seed
  ```

## Working with the Database in Code

### Import the Prisma Client

```typescript
import { prisma } from '@/lib/db';
```

### Use Utility Functions

We've created utility functions in `@/lib/db-utils` to make common database operations easier:

```typescript
import {
  donorUtils,
  campaignUtils,
  projectUtils,
  staffUtils,
} from '@/lib/db-utils';

// Example: Get all donors with their total donations
const donors = await donorUtils.getAllDonorsWithTotalDonations();

// Example: Get campaign financial summary
const financialSummary = await campaignUtils.getCampaignFinancialSummary(
  'campaign-id'
);
```

## Database Structure

The database follows a relational design where:

1. **Donors** make **Donations** to **Campaigns**
2. **Campaigns** fund **Projects**
3. **Projects** benefit **Beneficiaries** (many-to-many relationship)
4. **Staff** are assigned **Tasks** for **Projects** (many-to-many relationship)
5. **Financial Records** track financial activities for both campaigns and projects
6. **KPIs** track performance metrics for projects
7. **Reports** document progress for both campaigns and projects

## Environment Variables

The database connection is configured using the `DATABASE_URL` environment variable in the `.env` file:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gis_db?schema=public"
```
