while ! mysql -h db -u root -proot -P 3306 -e "SELECT VERSION();SELECT NOW()"; do
    sleep 5;
    echo "mysql is not connected";

done;
echo "starting node"
exec node Server/server.js
