#!/bin/bash

# Install Node.js
sudo yum install -y nodejs

# Install MySQL
sudo yum install -y mysql-server

# Enable MySQL to start on boot
sudo systemctl enable mysqld 

# Start MySQL service
sudo systemctl start mysqld

# Create a local user csye6225 with primary group csye6225 and nologin shell
sudo useradd -M -s /usr/sbin/nologin -g csye6225 csye6225

# Reload systemd to recognize the new service file
sudo systemctl daemon-reload

# Set up the application by copying artifacts and configuration files
# Example: sudo cp /path/to/artifacts /destination/path

# Change ownership of application artifacts and configuration files to csye6225:csye6225
# Example: sudo chown -R csye6225:csye6225 /path/to/artifacts /path/to/configuration

# Copy your systemd service file to /etc/systemd/system
# Example: sudo cp /path/to/service_file.service /etc/systemd/system/

# Enable your systemd service to start on boot
# Example: sudo systemctl enable <service_name>
