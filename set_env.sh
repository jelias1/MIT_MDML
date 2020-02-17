#!/bin/bash

# Change these lines as necessary
export MDML_HOST="146.139.77.100"
export PRIVATE_KEY_PATH="/etc/pki/nginx/private/server.key"
export CERT_PATH="/etc/pki/nginx/server.crt"

# All admin passwords are retrieved from AWS' Secrets Manager.
# Change the passwords here as necessary
SECRETS=$(aws secretsmanager get-secret-value --secret-id MDML/merfpoc | jq --raw-output '.SecretString')
export MDML_INFLUXDB_SECRET=$(echo $SECRETS | jq -r '.influxdb_secret')
export MDML_GRAFANA_SECRET=$(echo $SECRETS | jq -r '.grafana_secret')
export MDML_MINIO_SECRET=$(echo $SECRETS | jq -r '.minio_secret')
export MDML_GRAFDB_SECRET=$(echo $SECRETS | jq -r '.grafdb_secret')
export MDML_GRAFDB_ROOT_SECRET=$(echo $SECRETS | jq -r '.grafdb_root_secret')
export MDML_NODE_RED_PASS=$(echo $SECRETS | jq -r '.node_red_admin')

# Create credentials config file for the Minio object store
python3 ./mdml_register/create_minio_config.py $MDML_MINIO_SECRET

# Create credentials file for Node-RED Admin - Requires npm to be installed with either the bcryptjs module 
export NODE_PATH=/usr/lib/node_modules # needed as bcryptjs module was not being found
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 8));" $MDML_NODE_RED_PASS | tr -d '\n' > ./node_red/data/node_red_admin_creds.txt