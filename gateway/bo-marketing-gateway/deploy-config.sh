#!/bin/sh

# This script is used during deploy to copy the config files in the target machine
# We expect to have $ENVIRONMENT and $BRAND defined in the parent script

check_file_existance() {
	# The first arg is the file path to copy, the second arg is the dst file name

	FILE=node_modules/conf-gw/${BRAND}/$1-${ENVIRONMENT}
	if [ -f ${FILE} ]
	then
		echo "Copy ${FILE} --> $2"
		sudo cp -v ${FILE} $2
		return
	fi

	FILE=node_modules/conf-gw/${BRAND}/$1
	if [ -f node_modules/conf-gw${BRAND}$1 ]
	then
		echo "Copy ${FILE} --> $2"
		sudo cp -v ${FILE} $2
		return
	fi

	FILE=node_modules/conf-gw/default/$1-${ENVIRONMENT}
	if [ -f trading-platform-gateway/node_modules/conf-gw/default$1-${ENVIRONMENT} ]
	then
		echo "Copy ${FILE} --> $2"
		sudo cp -v ${FILE} $2
		return
	fi

	FILE=node_modules/conf-gw/default/$1
	if [ -f trading-platform-gateway/node_modules/conf-gw/default$1 ]
	then
		echo "Copy ${FILE} --> $2"
		sudo cp -v ${FILE} $2
		return
	fi

	# The file was not found !!!
	echo "WARN !!! The file $1 could not be found anywhere !"
}

check_file_existance etc/nginx/conf.d/b2c-platform-gateway.conf /etc/nginx/conf.d/b2c-platform-gateway.conf
check_file_existance etc/nginx/nginx.conf /etc/nginx/nginx.conf
check_file_existance etc/hosts /etc/hosts
check_file_existance config.json /var/www/b2c-platform/trading-platform-gateway/config.json
check_file_existance bashrc /root/.bashrc
check_file_existance gwrc /root/.gwrc
check_file_existance etc/nginx/mime.types /etc/nginx/mime.types
check_file_existance apikey.config.json /var/www/b2c-platform/trading-platform-gateway/apikey.config.json

check_file_existance etc/init.d/b2c-platform-gateway /etc/init.d/b2c-platform-gateway
sudo chmod +x /etc/init.d/b2c-platform-gateway

SSL_FILE_NAME=""
if [ ${BRAND} == "ufx-com" ]
then
	SSL_FILE_NAME="ufx"
else
	SSL_FILE_NAME="trade360"
fi

check_file_existance /etc/nginx/ssl/${SSL_FILE_NAME}.com.key /etc/nginx/ssl/ssl.key
check_file_existance /etc/nginx/ssl/${SSL_FILE_NAME}.com.pem /etc/nginx/ssl/ssl.pem
