# ComicallyBot

<div align="center">
  <img src="https://i.imgur.com/99mnwjg.png" alt="ComicallyBot" width="200">
  <p>
    <b>A feature-rich Discord bot built with TypeScript to enhance your server experience.</b>
  </p>
  <p>
    <a href="https://github.com/comicallybad/ComicallyBot/blob/master/LICENSE"><img src="https://img.shields.io/github/license/comicallybad/ComicallyBot?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/comicallybad/ComicallyBot/issues"><img src="https://img.shields.io/github/issues/comicallybad/ComicallyBot?style=for-the-badge" alt="Issues"></a>
    <a href="https://github.com/comicallybad/ComicallyBot/watchers"><img src="https://img.shields.io/github/watchers/comicallybad/ComicallyBot?style=for-the-badge&logo=github&label=Watch" alt="Watchers"></a>
    <a href="https://github.com/comicallybad/ComicallyBot/forks"><img src="https://img.shields.io/github/forks/comicallybad/ComicallyBot?style=for-the-badge&logo=github&label=Forks" alt="Forks"></a>
    <a href="https://github.com/comicallybad/ComicallyBot"><img src="https://img.shields.io/github/stars/comicallybad/ComicallyBot?style=for-the-badge" alt="Stars"></a>
  </p>
</div>

## ✨ Features

ComicallyBot is packed with features to make your Discord server more engaging and manageable.

| Category          | Description                                                                                             |
| :---------------- | :------------------------------------------------------------------------------------------------------ |
| **😂 Fun**        | A variety of entertaining commands to keep your community engaged.                                      |
| **👋 Welcoming**  | Greet new members with customizable welcome messages and designated channels.                           |
| **🛡️ Moderation** | A suite of moderation tools to keep your server safe and clean.                                         |
| **🎧 Music**      | High-quality music playback with an equalizer, volume controls, and more.                               |
| **ℹ️ Info**       | Get detailed information about your server, roles, and members.                                         |
| **🙋‍♂️ Helpful**    | A collection of useful commands to assist with various tasks.                                           |
| **👑 Owner**      | Exclusive commands for the bot owner to manage the bot.                                                 |
| **🎭 Selection Roles** | Creates a message with a selection role menu.                                                         |
| **❤️ Support**    | Get help and support for the bot.                                                                       |

## 🚀 Getting Started

To get ComicallyBot up and running on your own server, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16.9.0 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Java](https://www.java.com/en/download/) (Version 17 or higher)
- [Lavalink](https://github.com/lavalink-devs/Lavalink/releases/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/comicallybad/ComicallyBot.git
    cd ComicallyBot
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Lavalink:**
    -   Place the `Lavalink.jar` file in the `src/lavalink` directory.
    -   Create an `application.yml` file in the same directory. You can use the [applicationSkeleton.yml](https://github.com/comicallybad/ComicallyBot/blob/master/src/lavalink/applicationSkeleton.yml) as a template.
4.  **Configure environment variables:**
    -   Create a `.env` file in the root directory of the project. You can use the [.envSkeleton](https://github.com/comicallybad/ComicallyBot/blob/master/.envSkeleton) as a template.
    -   Add the following variables to the `.env` file, replacing the placeholder values with your own:
        ```
        DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
        CLIENT_ID=YOUR_DISCORD_BOT_CLIENT_ID
        DEV_GUILD_ID=YOUR_DEVELOPMENT_SERVER_ID
        BOT_OWNER_ID=YOUR_DISCORD_USER_ID
        DM_CHANNEL_ID=YOUR_DM_CHANNEL_ID_WITH_THE_BOT
        MUSIC=YOUR_LAVALINK_PASSWORD
        ```
5.  **Build the project:**
    ```bash
    npm run build
    ```
6.  **Deploy slash commands:**
    ```bash
    npm run deploy
    ```
7.  **Start the bot:**
    ```bash
    npm run start
    ```

## 🤖 Commands

ComicallyBot uses slash commands for a seamless user experience. Here's a list of available commands:

### Fun

| Command | Description |
| :--- | :--- |
| `/good` | Sends a goodmorning or goodnight message. |
| `/love` | Calculates the love affinity another person has for you. |
| `/meme` | Get a random meme. |
| `/urban` | Gets an urban dictionary definition |

### Helpful

| Command | Description |
| :--- | :--- |
| `/announce` | Make an announcement to a channel. |
| `/avatar` | Responds with an embed of a users avatar. |
| `/define` | Defines a word for you. |
| `/translate` | Translates a message for you. |
| `/vote` | Sends a message users can vote on. |

### Info

| Command | Description |
| :--- | :--- |
| `/invites` | Provides server invite links and information. |
| `/og-members` | Shows a list of earliest users in the discord server. |
| `/ping` | Returns ping and latency of the bot. |
| `/who-is` | Returns user information. |

### Moderation

| Command | Description |
| :--- | :--- |
| `/clear` | Clears messages from a channel. |
| `/create-log-channels` | Create log channels |
| `/delete-reaction` | Manages the delete reaction emoji. |
| `/report` | Reports a member. |
| `/role` | Add, remove, view information, or view users for a role. |
| `/unban` | Unban a member. |
| `/unmute` | Remove timeout from a member. |
| `/warn` | Warns a member. |

### Music

| Command | Description |
| :--- | :--- |
| `/equalizer` | Adjusts the music equalizer. |
| `/pause` | Pause the current song. |
| `/play` | Resume player, move player, or queue a song/playlist from YouTube/SoundCloud/Spotify. |
| `/queue` | Manage or view the current queue. |
| `/repeat` | Repeats the current track or entire queue. |
| `/shuffle` | Shuffles the current queue. |
| `/skip` | Skip ahead, skip to a position, or skip the current song. |
| `/song` | Displays what song is currently playing. |
| `/stop` | Disconnects the bot from the voice channel. |
| `/volume` | Changes the volume of the music player. |

### Owner

| Command | Description |
| :--- | :--- |
| `/clean_dms` | Cleans DM messages from bot to owner (Owner Only). |
| `/eval` | Executes arbitrary JavaScript code (Owner Only). |
| `/usage` | Provides statistics on command usage (Owner Only). |

### Selection Roles

| Command | Description |
| :--- | :--- |
| `/selection-roles` | Create a selection role message. |

### Support

| Command | Description |
| :--- | :--- |
| `/donate` | Provides the donation link. |
| `/github` | Provides a link to the GitHub repository. |
| `/support` | Provides a link to the support server. |

### Welcoming

| Command | Description |
| :--- | :--- |
| `/welcome-channel` | Manage or view the welcome channel. |
| `/welcome-message` | Manage or view the welcome message. |

## 🛠️ Technologies Used

-   [**Discord.js**](https://discord.js.org/) - The official Discord API library for Node.js.
-   [**Discord.js Guide**](https://discordjs.guide/#before-you-begin) - The official Discord.js guide.
-   [**TypeScript**](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript.
-   [**Moonlink.js**](https://moonlink.js.org/) - A powerful Lavalink client for Discord.js
-   [**Lavalink**](https://github.com/lavalink-devs/Lavalink?tab=readme-ov-file#lavalink) - A standalone audio sending node.
-   [**MongoDB**](https://www.mongodb.com/) - A NoSQL database for storing guild configurations.
-   [**Mongoose**](https://mongoosejs.com/) - An ODM for MongoDB and Node.js.

## 🤝 Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue on the [GitHub repository](https://github.com/comicallybad/ComicallyBot/issues).

## 📜 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For bug reports, feature requests, help, and other inquiries, please navigate to the [GitHub Issues Tab](https://github.com/comicallybad/ComicallyBot/issues) and select the appropriate template.