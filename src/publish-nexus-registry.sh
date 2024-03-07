#!/bin/bash

if [ $# -lt 3 ]; then
		echo "Eksik parametre girildi..."
		echo "Kullanım: $0 registry_url user password"
		exit 1
fi

REPOSITORY=$1
USER=$2
PASSWD=$3

PACKAGES_PATH=./modules/

cd $PACKAGES_PATH

find ./ -name "*.tgz" -print0 | while IFS= read -r -d '' file
do
   echo "Publishing $file ....."
   curl -u $USER:$PASSWD -X POST "${REPOSITORY}service/rest/v1/components?repository=npm-hosted" -H "accept: application/json" -H "Content-Type: multipart/form-data" -F "npm.asset=@$file;type=application/x-compressed"
done
