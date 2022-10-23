#! /bin/bash
git pull
osascript -e 'tell app "Terminal"
    do script "cd ~/Documents/Projects/comicallybot/lavalink/ && java -jar lavalink.jar"
end tell'
sleep 10
nodemon