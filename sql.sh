#!/bin/bash

DB_USERNAME=root
DB_PASSWORD=root
NEW_PASSWORD=root
DB_NAME=cloudcourse

sudo yum install -y mariadb-server

sudo systemctl start mariadb
sudo systemctl enable mariadb

sleep 5

mysql -u $DB_USERNAME -e "ALTER USER '$DB_USERNAME'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';"

echo "MySQL Installation Completed."

if ! mysql -u $DB_USERNAME -p"$NEW_PASSWORD" -e "USE $DB_NAME"; then
    echo "Creating database $DB_NAME..."
    mysql -u $DB_USERNAME -p"$NEW_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
    echo "Database $DB_NAME created."
else
    echo "Database $DB_NAME already exists."
fi


mysql -u $DB_USERNAME -p"$NEW_PASSWORD" -e "USE $DB_NAME; CREATE TABLE IF NOT EXISTS Users (id CHAR(36) BINARY PRIMARY KEY, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, createdAt DATETIME NOT NULL, updatedAt DATETIME NOT NULL);"

echo "MySQL installation and configuration completed."