#!/bin/bash

# it installs Node.js on CentOS

curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -


sudo yum install -y nodejs

# Verify if it is installed or not
node --version
npm --version
