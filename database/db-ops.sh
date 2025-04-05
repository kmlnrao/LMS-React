#!/bin/bash
# Database operations script for Laundry Management System

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display the menu
show_menu() {
  echo -e "${BLUE}======================================${NC}"
  echo -e "${BLUE}   Laundry Management System DB Ops   ${NC}"
  echo -e "${BLUE}======================================${NC}"
  echo ""
  echo -e "${YELLOW}1.${NC} Test Database Connection"
  echo -e "${YELLOW}2.${NC} Run Migrations"
  echo -e "${YELLOW}3.${NC} Initialize Database (DESTRUCTIVE)"
  echo -e "${YELLOW}4.${NC} Backup Database"
  echo -e "${YELLOW}5.${NC} Restore Database"
  echo -e "${YELLOW}6.${NC} Exit"
  echo ""
  echo -n "Enter your choice [1-6]: "
}

# Test database connection
test_connection() {
  echo -e "${BLUE}Testing database connection...${NC}"
  npx tsx database/test-connection.ts
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Connection test completed successfully.${NC}"
  else
    echo -e "${RED}Connection test failed.${NC}"
  fi
  read -p "Press enter to continue..."
}

# Run migrations
run_migrations() {
  echo -e "${BLUE}Running database migrations...${NC}"
  npx tsx database/migrate.ts
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Migrations completed successfully.${NC}"
  else
    echo -e "${RED}Migrations failed.${NC}"
  fi
  read -p "Press enter to continue..."
}

# Initialize database (DESTRUCTIVE)
initialize_db() {
  echo -e "${RED}WARNING: This will drop all tables and recreate the database!${NC}"
  read -p "Are you sure you want to continue? (y/n): " confirm
  if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo -e "${BLUE}Initializing database...${NC}"
    npx tsx database/initialize-db.ts
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Database initialization completed successfully.${NC}"
    else
      echo -e "${RED}Database initialization failed.${NC}"
    fi
  else
    echo -e "${YELLOW}Database initialization cancelled.${NC}"
  fi
  read -p "Press enter to continue..."
}

# Backup database
backup_db() {
  echo -e "${BLUE}Backing up database...${NC}"
  npx tsx database/backup-restore.ts backup
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database backup completed successfully.${NC}"
  else
    echo -e "${RED}Database backup failed.${NC}"
  fi
  read -p "Press enter to continue..."
}

# Restore database
restore_db() {
  echo -e "${BLUE}Available backups:${NC}"
  ls -l database/backups/ 2>/dev/null || mkdir -p database/backups
  
  echo ""
  read -p "Enter backup file name (or path): " backup_file
  
  if [ -z "$backup_file" ]; then
    echo -e "${RED}No backup file specified.${NC}"
    read -p "Press enter to continue..."
    return
  fi
  
  # Check if the file exists
  if [ ! -f "$backup_file" ] && [ ! -f "database/backups/$backup_file" ]; then
    echo -e "${RED}Backup file not found.${NC}"
    read -p "Press enter to continue..."
    return
  fi
  
  # If only filename was provided, prepend the path
  if [ ! -f "$backup_file" ]; then
    backup_file="database/backups/$backup_file"
  fi
  
  echo -e "${RED}WARNING: This will overwrite the current database with the backup!${NC}"
  read -p "Are you sure you want to continue? (y/n): " confirm
  if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo -e "${BLUE}Restoring database from $backup_file...${NC}"
    npx tsx database/backup-restore.ts restore "$backup_file"
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Database restore completed successfully.${NC}"
    else
      echo -e "${RED}Database restore failed.${NC}"
    fi
  else
    echo -e "${YELLOW}Database restore cancelled.${NC}"
  fi
  read -p "Press enter to continue..."
}

# Main loop
while true; do
  clear
  show_menu
  read choice
  
  case $choice in
    1) test_connection ;;
    2) run_migrations ;;
    3) initialize_db ;;
    4) backup_db ;;
    5) restore_db ;;
    6) 
      echo -e "${GREEN}Goodbye!${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid option. Please try again.${NC}"
      read -p "Press enter to continue..."
      ;;
  esac
done