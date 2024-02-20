#!/bin/bash

# Commands executed as root before switching to csye6225 user

# Update system packages and install unzip and zip
# sudo dnf update -y
sudo dnf install -y unzip zip

# Create csye6225 group (force if it already exists)
sudo groupadd -f csye6225

# Create 6225 user with no login shell
sudo useradd -g csye6225 -s /usr/sbin/nologin -d /home/csye6225 csye6225

# Copy application artifact to /home directory
# Replace "/temp/application.zip" with the actual path to your application artifact
sudo cp /tmp/application.zip /home/application.zip

# Unzip application to /home directory
sudo unzip /home/application.zip -d /home/csye6225

# Change ownership and permissions of application directory to csye6225:csye6225
sudo chown -R csye6225:csye6225 /home/csye6225
sudo chmod -R 750 /home/csye6225

# Switch to csye6225 user and execute commands as that user
sudo -u csye6225 bash <<'EOF'
# Commands to be executed as csye6225 user
# Navigate to the application directory
cd /home/csye6225

# Set up MySQL credentials
echo "Setting up MySQL credentials..."
echo "export DB_DIALECT=mysql" > .env 
echo "export DB_HOST=127.0.0.1" > .env
echo "export DB_USERNAME=root" > .env
echo "export DB_PASSWORD=root" > .env
echo "export DB_NAME=health_check_db" > .env
EOF
