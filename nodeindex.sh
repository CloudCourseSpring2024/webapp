#!/bin/bash

sudo cp /opt/csye6225/nodeindex.service /etc/systemd/system/

sudo systemctl daemon-reload

sudo systemctl start nodeindex.service

sudo systemctl enable nodeindex.service

sudo systemctl status nodeindex.service
