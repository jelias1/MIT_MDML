#!/bin/bash

# This script will add a user and allowable topics to use on the MDML
# First argument is user and second argument is topic
# Topic wildcard is #
# Wildcard must be entered with surrounding quotes "#"
# sudo must be used here 

USER=$1
TOPIC=$2

echo user $USER >> /etc/mosquitto/acl_file.txt
echo "topic MDML/"$TOPIC"/#" >> /etc/mosquitto/acl_file.txt
echo "topic MDML_DEBUG/"$TOPIC"/#" >> /etc/mosquitto/acl_file.txt
echo  >> /etc/mosquitto/acl_file.txt
