# Laundry Management System - Database Scripts

This directory contains database schema scripts, migration tools, and database utilities for the Laundry Management System.

## Directory Structure

```
database/
├── migrations/              # SQL migration files
│   ├── 01_initial_schema.sql     # Creates all tables and types
│   ├── 02_data_seeding.sql       # Seeds initial data
│   ├── 03_functions_and_triggers.sql  # Database functions and triggers
│   └── 04_views.sql              # Database views for reporting
├── migrate.ts               # Migration script to apply SQL migrations
├── initialize-db.ts         # Database initialization (drops and recreates everything)
├── backup-restore.ts        # Backup and restore utilities
├── test-connection.ts       # Database connection testing utility
└── README.md               # This file
```

## Database Operations

### Running Migrations

To apply the SQL migrations to an existing database:

```bash
npx tsx database/migrate.ts
```

This will run all the SQL migration files in order.

### Initializing the Database

To completely reset the database (drop all tables and recreate from scratch):

```bash
npx tsx database/initialize-db.ts
```

This is useful during development or when setting up a new environment.

### Backing Up the Database

To create a backup of the database:

```bash
npx tsx database/backup-restore.ts backup
```

This will create a timestamped SQL backup file in the `database/backups` directory.

### Restoring from a Backup

To restore the database from a backup file:

```bash
npx tsx database/backup-restore.ts restore ./database/backups/your-backup-file.sql
```

Replace `your-backup-file.sql` with the actual backup filename.

### Testing Database Connection

To test the database connection and check schema integrity:

```bash
npx tsx database/test-connection.ts
```

## Using with Drizzle ORM

The project uses [Drizzle ORM](https://orm.drizzle.team/) for database interactions. The schema is defined in `shared/schema.ts`.

You can use the standard Drizzle commands for schema push:

```bash
npm run db:push
```

## Database Schema

The database schema includes the following main tables:

1. `users` - System users with different roles
2. `departments` - Hospital departments that use laundry services
3. `tasks` - Laundry task requests and their processing status
4. `inventory_items` - Inventory of supplies used in laundry operations
5. `equipment` - Laundry equipment like washers, dryers, etc.
6. `laundry_processes` - Defined laundry process templates
7. `cost_allocations` - Monthly cost allocation by department

Additional tables created by migrations:
- `inventory_alerts` - Automated alerts for low inventory

## Views

Several views are created to simplify reporting:

1. `task_details` - Comprehensive view of tasks with related information
2. `equipment_status_view` - Equipment with maintenance information
3. `inventory_status_view` - Inventory with stock level indicators
4. `department_workload` - Department statistics for task distribution
5. `monthly_cost_report` - Monthly cost reports by department

## Triggers and Functions

The database includes several automated triggers and functions:

1. Task ID generation
2. Automatic completion timestamp setting
3. Inventory level monitoring and alerts
4. Cost per kg calculation
5. Maintenance schedule management

## Troubleshooting

If you encounter issues with database operations:

1. Check that the `DATABASE_URL` environment variable is correctly set
2. Verify that PostgreSQL is running and accessible
3. Check for permission issues with the database user
4. For backup/restore issues, ensure that `pg_dump` and `psql` utilities are installed
