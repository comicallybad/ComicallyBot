#! /bin/bash
git pull
osascript -e 'tell app "Terminal"
    do script "cd ~/Documents/Projects/comicallybot2.0/lavalink/ && java -jar lavalink.jar"
end tell'
sleep 10
nodemon