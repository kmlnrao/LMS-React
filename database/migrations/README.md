# Database Migrations

This directory contains SQL migration files for the Laundry Management System database.

## Migration File Naming

Files should be named with a sequence number prefix followed by a descriptive name:

```
01_initial_schema.sql
02_add_inventory_alerts.sql
03_create_reporting_views.sql
```

## Running Migrations

Migrations are applied in numeric order when the following command is run:

```bash
npx tsx database/migrate.ts
```

## Creating New Migrations

To create a new migration:

1. Create a new SQL file in this directory with the next sequence number
2. Add SQL statements to create, alter, or modify database objects
3. Test the migration locally before committing
4. Use explicit statements with IF EXISTS/IF NOT EXISTS to make migrations idempotent

## Migration Best Practices

- Make migrations idempotent (can be run multiple times without error)
- Keep migrations focused on a single change
- Include comments describing the purpose of the migration
- Test migrations thoroughly before deploying to production
