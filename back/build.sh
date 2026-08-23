npm run build
pm2 stop /opt/residenz-andreew/back/ecosystem.config.js
sudo rm -rf /var/www/residenz-andreew.zollneck.de/back/dist
sudo mkdir -p /var/www/residenz-andreew.zollneck.de/back
sudo cp -r ./dist /var/www/residenz-andreew.zollneck.de/back/
sudo cp -r ./node_modules /var/www/residenz-andreew.zollneck.de/back/
sudo cp ./package.json /var/www/residenz-andreew.zollneck.de/back/
sudo cp ./ecosystem.config.js /var/www/residenz-andreew.zollneck.de/back/
sudo cp ./.env /var/www/residenz-andreew.zollneck.de/back/
sudo chown -R jozollne:jozollne /var/www/residenz-andreew.zollneck.de/back/
pm2 start /var/www/residenz-andreew.zollneck.de/back/ecosystem.config.js
pm2 log
