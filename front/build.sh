npm run build-only
sudo rm -rf /var/www/residenz-andreew.zollneck.de/front/dist
sudo cp -r ./dist /var/www/residenz-andreew.zollneck.de/front/
sudo chown -R www-data:www-data /var/www/residenz-andreew.zollneck.de/front/dist
sudo service apache2 reload

echo "Deployment für Residenz Andreew erfolgreich abgeschlossen!"