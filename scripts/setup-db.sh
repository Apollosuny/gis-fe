#!/bin/bash

# filepath: /Users/trungtran/Workspace/gis/gis-fe/scripts/setup-db.sh

# Ensure script is executed from project root
if [ ! -f "package.json" ]; then
  echo "Please run this script from the project root directory"
  exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

echo "=== Setting up GIS Database ==="

# Start the PostgreSQL container
echo "Starting PostgreSQL container..."
pnpm docker:up

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Push Prisma schema to the database
echo "Applying Prisma schema to the database..."
pnpm db:push

# Generate Prisma Client
echo "Generating Prisma Client..."
pnpm db:generate

# Seed the database
echo "Seeding the database with initial data..."
tsx prisma/seed.ts

echo "=== Database setup complete! ==="
echo "You can now run 'pnpm db:studio' to open Prisma Studio and explore your database"
