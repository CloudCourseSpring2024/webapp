#!/bin/bash

# Set MySQL database configuration
DB_USERNAME=root
# DB_PASSWORD=root
NEW_PASSWORD=root
DB_NAME=cloudcourse

# Install MySQL Server
echo "Installing MySQL Server..."
sudo dnf install @mysql -y

# Start MySQL Service
sudo systemctl start mysqld

# Enable MySQL to start on boot
sudo systemctl enable mysqld

# Wait for MySQL to start
sleep 5

# Secure MySQL Installation
echo "Securing MySQL Installation..."
mysql -u $DB_USERNAME  -e "ALTER USER '$DB_USERNAME'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';"

echo "MySQL Installation Completed."

# Create database if it doesn't exist
# if ! mysql -u $DB_USERNAME -p$NEW_PASSWORD -e "USE $DB_NAME"; then
#     echo "Creating database $DB_NAME..."
#     mysql -u $DB_USERNAME -p$NEW_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
#     echo "Database $DB_NAME created."
# else
#     echo "Database $DB_NAME already exists."
# fi

#echo "MySQL installation and configuration completed."
