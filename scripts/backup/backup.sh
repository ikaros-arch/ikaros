#!/bin/bash

set -e

# Redirect output to a log file when running in cron
LOG_FILE=${BACKUP_DIR:-/backups}/backup.log
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[$(date)] Starting backup script..."

BACKUP_DIR=${BACKUP_DIR:-/backups}
HOURLY_DIR="$BACKUP_DIR/hourly"
DAILY_DIR="$BACKUP_DIR/daily"
WEEKLY_DIR="$BACKUP_DIR/weekly"
MONTHLY_DIR="$BACKUP_DIR/monthly"
FULL_BACKUP_DIR="$BACKUP_DIR/full"

# Ensure the backup directory is writable
if [ ! -w "$BACKUP_DIR" ]; then
  echo "[$(date)] ERROR: Backup directory $BACKUP_DIR is not writable. Exiting." >&2
  exit 1
fi

# Export PGPASSWORD for passwordless authentication
export PGPASSWORD="${POSTGRES_PASSWORD}"

# Parse databases from environment variable
IFS=',' read -r -a DATABASES <<< "${BACKUP_DATABASES}"

# Create directories if they don't exist
mkdir -p "$HOURLY_DIR" "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR" "$FULL_BACKUP_DIR"

# Perform hourly backups for specific databases
TIMESTAMP=$(date +%Y%m%d%H%M%S)
for DB in "${DATABASES[@]}"; do
  echo "[$(date)] Backing up database: $DB"
  if pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$DB" > "$HOURLY_DIR/${DB}_backup_$TIMESTAMP.sql"; then
    echo "[$(date)] Successfully backed up database: $DB"
  else
    echo "[$(date)] Error backing up database: $DB" >&2
  fi
done

# Retention policy for hourly backups
echo "[$(date)] Applying retention policy for hourly backups..."
find "$HOURLY_DIR" -type f -mtime +1 -exec rm {} \; # Keep 24 hourly backups

# Perform daily full server backup at midnight
if [ "$(date +%H)" == "00" ]; then
  echo "[$(date)] Performing daily full server backup..."
  if pg_dumpall -h "$POSTGRES_HOST" -U "$POSTGRES_USER" > "$FULL_BACKUP_DIR/full_backup_$TIMESTAMP.sql"; then
    cp "$FULL_BACKUP_DIR/full_backup_$TIMESTAMP.sql" "$DAILY_DIR/"
    echo "[$(date)] Successfully performed daily full server backup."
  else
    echo "[$(date)] Error performing daily full server backup." >&2
  fi
fi

# Retention policy for daily, weekly, and monthly backups
echo "[$(date)] Applying retention policy for daily, weekly, and monthly backups..."
find "$DAILY_DIR" -type f -mtime +7 -exec rm {} \;  # Keep 7 daily backups
find "$WEEKLY_DIR" -type f -mtime +28 -exec rm {} \; # Keep 4 weekly backups
find "$MONTHLY_DIR" -type f -mtime +365 -exec rm {} \; # Keep 12 monthly backups

# Rotate backups
if [ "$(date +%u)" == "7" ]; then
  echo "[$(date)] Rotating weekly backups..."
  LATEST_DAILY_BACKUP=$(ls -t "$DAILY_DIR" | head -n 1)
  if [ -n "$LATEST_DAILY_BACKUP" ]; then
    cp "$DAILY_DIR/$LATEST_DAILY_BACKUP" "$WEEKLY_DIR/"
    echo "[$(date)] Weekly backup rotated from $LATEST_DAILY_BACKUP"
  else
    echo "[$(date)] No daily backup found to rotate to weekly." >&2
  fi
fi

if [ "$(date +%d)" == "01" ]; then
  echo "[$(date)] Rotating monthly backups..."
  LATEST_WEEKLY_BACKUP=$(ls -t "$WEEKLY_DIR" | head -n 1)
  if [ -n "$LATEST_WEEKLY_BACKUP" ]; then
    cp "$WEEKLY_DIR/$LATEST_WEEKLY_BACKUP" "$MONTHLY_DIR/"
    echo "[$(date)] Monthly backup rotated from $LATEST_WEEKLY_BACKUP"
  else
    echo "[$(date)] No weekly backup found to rotate to monthly." >&2
  fi
fi

# Restore daily backup (only at midnight)
if [ "$(date +%H)" == "00" ]; then
  echo "[$(date)] Restoring daily backup..."
  DAILY_BACKUP=$(ls -t "$HOURLY_DIR" | grep "${RESTORE_DATABASE}_backup" | head -n 1)
  if [ -n "$DAILY_BACKUP" ]; then
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS $RESTORE_DB_DAILY;"
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -c "CREATE DATABASE $RESTORE_DB_DAILY;"
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$RESTORE_DB_DAILY" -f "$HOURLY_DIR/$DAILY_BACKUP"
    echo "[$(date)] Daily backup restored from $DAILY_BACKUP"
  else
    echo "[$(date)] No daily backup found to restore." >&2
  fi
fi

# Restore weekly backup (only on Sundays at midnight)
if [ "$(date +%u)" == "7" ] && [ "$(date +%H)" == "00" ]; then
  echo "[$(date)] Restoring weekly backup..."
  WEEKLY_BACKUP=$(ls -t "$HOURLY_DIR" | grep "${RESTORE_DATABASE}_backup" | head -n 1)
  if [ -n "$WEEKLY_BACKUP" ]; then
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS $RESTORE_DB_WEEKLY;"
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -c "CREATE DATABASE $RESTORE_DB_WEEKLY;"
    psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$RESTORE_DB_WEEKLY" -f "$HOURLY_DIR/$WEEKLY_BACKUP"
    echo "[$(date)] Weekly backup restored from $WEEKLY_BACKUP"
  else
    echo "[$(date)] No weekly backup found to restore." >&2
  fi
fi

echo "[$(date)] Backup script completed."
