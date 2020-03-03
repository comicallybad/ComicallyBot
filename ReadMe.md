ComicallyBot2.0 is a bot that uses a permission and status structure. Commands can be toggled on or off by server. Roles and Users can also be given permission to access certain commands by server. ComicallyBot2.0 has many moderation commands, fun commands, informational commands, and an economy system.
________________________________________________________________________________
To clone and use ComicallyBot2.0 you will have to do a few things:
1. Install mongodb and compass for mongodb (needed for database storage)
2. Create a .env file with a "TOKEN" for a discord token, "FORTNITE" for a fortnite API key, and "STEAM" for steam API key
3. npm install
4. node .
5. Commands will default to disabled, so in discord use _toggle, _togglecat, or _toggleall to toggle commands/categories. Use _help {command} for more information
6. Create a discord text channel named "mods-log" for logging moderator command uses
7. Use _help {command} to view information on a command. Use _status to show the status of commands
8. Use _addmember {@role | roleID | @user | userID} to add a role/user to access member commands
9. Use _addmod {@role | roleID | @user | userID} to add a role/user to access mod commands
10. Administrator commands can only be accessed by server administrators
