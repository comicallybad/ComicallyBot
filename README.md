# ComicallyBot &middot; ![version badge](https://img.shields.io/badge/version-2.0-orange?style=flat-square)

> A bot that uses a permission and status structure. ComicallyBot is fully modular, server administrators can toggle on and off any command. Roles and Users can also be given permission to use certain commands.

**Features Include**:

- Moderation Commands
- Fun Commands
- Information Commands
- Music Commands
- Leveling System.

<h2 align="center">Setup</h2>

First you need to clone this repository. Next:

1. Install MongoDB, and optionally MongoDB Compass.
2. Install [Java 13](https://www.azul.com/downloads/zulu-community/?version=java-13-mts&os=windows&architecture=x86-64-bit&package=jdk) and make sure it's in your PATH.
3. Rename the `example.env` to `.env`.
    - Make sure to fill in the values according to the comments.
4. Install all dependencies
    - `npm install` for npm users.
    - `yarn` for yarn users.
5. Create an `application.yml` file inside of the lavalink folder. Example: <https://github.com/Frederikam/Lavalink/blob/master/LavalinkServer/application.yml.example>

If you followed these directions you should be able to start lavalink and the bot itself.

- Starting Lavalink:
    - **Windows**: Run `/lavalink/start.bat`.
    - **\*nix**: Run `chmod u+x ./lavalink/start.sh` and then `./lavalink/start.sh`.
- Starting the bot: `node .`

<h2 align="center">Usage</h2>

Commands will default to disabled, so in discord use `_toggle`, `_togglecat`, or `_toggleall` to toggle commands/categories. Use `_help {command}` for more information
Create a discord text channel named "mod-logs" for logging moderator command uses and "reports" for report command.

- Use `_help {command}` to view information on a command. Use _status to show the status of commands. <br/>
- Use `_addmember {@role | roleID | @user | userID}` to add a role/user to access member commands. <br/>
- Use `_addmod {@role | roleID | @user | userID}` to add a role/user to access mod commands. <br/>

> Administrator commands can only be accessed by server administrators.

---
