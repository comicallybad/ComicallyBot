ComicallyBot2.0 is a bot that uses a permission and status structure. Commands can be toggled on or off by server. Roles and Users can also be given permission to access certain commands by server. ComicallyBot2.0 has many moderation commands, fun commands, informational commands, and a leveling system.
________________________________________________________________________________
To clone and use ComicallyBot2.0 you will have to do a few things:
1. Install mongodb and compass for mongodb. Install Java v11 https://www.azul.com/downloads/zulu-community/?version=java-11-lts&os=&os=windows&architecture=x86-64-bit&package=jdk and lavalink from https://www.npmjs.com/package/erela.js. Place lavalink .zip contents into a lavalink folder inside the project.
2. Create a .env file with a "TOKEN" for a discord token, "FORTNITE" for a fortnite API key, and "STEAM" for steam API key, "ERELA" for erela password, and "USERID" for discord User ID for owner commands
3. Create a application.yml file inside lavalink ex: https://github.com/Frederikam/Lavalink/blob/master/LavalinkServer/application.yml.example
4. npm i --save
5. To start the bot correctly use: "start.bat" or open /lavalink/start.bat and then "node ." in project directory
6. Commands will default to enabled. So use `_help Command` for more information
7. Auto-Moderation features will default to disabled. So use `_help Auto-Moderation`  for more information
8. Create a discord text channel named "mod-logs" for logging moderator command uses and "reports" for report command
9. Use _help {command} to view information on a command. Use _status to show the status of commands
10. Use `_addmember {@role | roleID | @user | userID}` to add a role/user to access member commands
11. Use `_addmod {@role | roleID | @user | userID}` to add a role/user to access mod commands
12. Administrator commands can only be accessed by server administrators
________________________________________________________________________________
Differences for Mac/Linux users:
1. Install Java v11 or higher https://www.azul.com/downloads/zulu-community/?&version=java-11-lts&os=&os=macos&architecture=x86-64-bit&package=jdk
2. "Chmod u+x ./start.sh"
3. To start the bot correctly use "./start.sh" then add a new terminal to use "node ."
