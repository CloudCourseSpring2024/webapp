#!/bin/bash

# Specify the name of your systemd service file
SERVICE_FILE="nodeapp.service"

# Copy your systemd service file to /etc/systemd/system
sudo cp "$SERVICE_FILE" /etc/systemd/system/

# Reload systemd to pick up the changes
sudo systemctl daemon-reload

# Enable your service to start on boot
sudo systemctl enable "$SERVICE_FILE"

sudo systemctl start "$SERVICE_FILE"

sudo systemctl status "$SERVICE_FILE"
