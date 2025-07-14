<div style="display: flex; align-items: flex-start;">
<img src="https://i.imgur.com/99mnwjg.png" alt="ComicallyBot" width="200" style="margin-right: 20px;">

<div>

# ComicallyBotTS

ComicallyBotTS is a Discord bot built with TypeScript that can do just about everything. From moderating your server, providing a modern music player, to keeping a conversation going with its autochat feature, ComicallyBotTS is designed to enhance your Discord experience.

ComicallyBotTS is made and managed by [ComicallyBad](https://github.com/comicallybad).

</div>
</div>

## Features

- **Slash Commands**: Use Discord's new slash commands for a smoother experience.
- **Music Player**: Enjoy music with a new and improved player, complete with an equalizer and music controls.
- **Welcoming**: Welcome new users with a welcome message and channel.
- **Moderation**: Whether you need auto-moderation, or manual, the bot has you covered.
- **Information**: Find helpful information on your guild, roles, and members.
- **Event Logging**: Keep track of what's happening in your server with detailed event logging.
- **And More**: ComicallyBotTS is always improving with new features being added regularly.

## Updates

- **TypeScript Port**: The entire project has been ported from JavaScript to TypeScript for improved maintainability and type safety.
- **Slash Commands**: Slash commands have been implemented for a cleaner and more intuitive user experience.
- **Music Player**: The music player has been modernized to include better track & queue control, an equalizer, and player controls.
- **Event Logging**: Event logging has been improved with centralized error handling and logging to files.
- **More To Come**: Features are always in the works! Suggestions and feedback are greatly appreciated.

## How to Use

To clone and use ComicallyBotTS, follow these steps:

1. Install [mongodb](https://www.mongodb.com/try/download/community)
2. Install [Lavalink](https://github.com/lavalink-devs/Lavalink/releases/)
3. Install the required Java version mentioned [here](https://github.com/lavalink-devs/Lavalink#requirements)
4. Place `lavalink.jar` into `/src/lavalink`.
5. Create an `application.yml` file inside the lavalink folder. An example can be found [here](https://github.com/lavalink-devs/Lavalink/blob/master/LavalinkServer/application.yml.example)
6. Create a `.env` file with:
    - `DISCORD_TOKEN`: Your Discord bot token.
    - `CLIENT_ID`: Your Discord bot's client ID.
    - `MUSIC`: Your Lavalink/Moonlink password.
    - `BOT_OWNER_ID`: Your Discord user ID (for owner-only commands and error DMs).
    - `DMCHANNELID`: The ID of a DM channel with the bot (for `clean_dms` command).
7. Run `npm install` to install the necessary packages.
8. Run `npm run build` to compile the TypeScript code.
9. Run `npm run deploy` to deploy the slash commands to Discord.
10. Run `npm run start` to start the bot.

## Support

For Bug Reports, Feature Requests, Help, and Other inquiries: 

1. Navigate to the [GitHub Issues Tab](https://github.com/comicallybad/ComicallyBot/issues). 
2. Click `New Issue` on the top right.
3. Select `Get Started` from the applicable option.
4. Provide as much information as possible. For extra help:
    - Node.js version: `node --version`
    - Discord.js version: found in `package.json`
    - Java version: `java --version`
5. Click `Submit new issue` and await a response!

## Code Documentation

For help understanding the code and technologies used in this project, you can refer to the following resources:

- **W3Schools JavaScript Tutorial**: [W3Schools JavaScript Tutorial](https://www.w3schools.com/js/default.asp)
- **MDN's JavaScript Guide**: [MDN's JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction)
- **Discord.js Guide**: [Discord.js Guide](https://discordjs.guide/#before-you-begin)
- **Discord.js Documentation**: [Discord.js Documentation](https://discord.js.org)
- **Lavalink Documentation**: [Lavalink Documentation](https://github.com/lavalink-devs/Lavalink?tab=readme-ov-file#lavalink)
- **Moonlink Documentation**: [Moonlink Documentation](https://moonlink.js.org/introduction)

These resources provide comprehensive guides and documentation to help you understand and use JavaScript, Discord.js, Lavalink, and Moonlink.js effectively.