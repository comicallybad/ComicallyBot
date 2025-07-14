# ComicallyBotTS Project Context

This file provides context for the ComicallyBotTS project.

## Development Guidelines

### User Confirmation Workflow
When proposing significant code changes, refactoring, or any action that alters the codebase, the agent will first present the proposed changes to the user and ask for their agreement before proceeding with the implementation. This ensures user control and alignment with expectations.



### Code Style

- Use double quotation marks (`"`) for all strings, including imports, command data, and variables.
- Use backticks (`) for template literals (strings containing variables).
- Files should not have a blank line as the first line.
- **Import Style:** Strive for the most specific import style possible.
    - Prefer named imports (`import { Client } from "discord.js"`) for clarity and to allow for tree-shaking. For multiple named imports from the same module, especially when the line becomes long, break them into multiple lines within the curly braces, with one import per line for readability (e.g., `import {
        SlashCommandBuilder,
        ChatInputCommandInteraction
    } from "discord.js";`).
    - Use default imports (`import fs from "fs"`) when a module provides a default export.
    - Use namespace imports (`import * as dotenv from "dotenv"`) only when necessary, typically for older CommonJS modules that do not have a default export or suitable named exports.

### Import Order

To maintain consistency and readability, please adhere to the following import order:

1.  **Node.js Built-in Modules:** (e.g., `fs`, `path`)
2.  **External NPM Packages:** (e.g., `discord.js`, `dotenv`)
3.  **Internal Project Modules:** (e.g., `../utils/replyUtils`, `../../types/discord.d.ts`)

### discord.js Best Practices

- **Ephemeral Replies:** The `ephemeral: true` flag is deprecated. Use `flags: MessageFlags.Ephemeral` instead for sending private replies.
- **Fetching Replies:** The `fetchReply: true` option is deprecated. To get the `Message` object from an interaction reply, you must now explicitly call `interaction.fetchReply()` on the line after the reply is sent.
- **Command Context:** The `setDMPermission(false)` method is deprecated. Use `setContexts(InteractionContextType.Guild)` instead to specify that a command is only available in guilds.

### Music (moonlink.js)

The bot will use the `moonlink.js` package for all music-related functionality. An `ExtendedClient` will be created to hold the `moonlink` player manager, which will be accessible throughout the application via `client.music`.

### Embed Best Practices

- **Thumbnails for Music Commands:** When setting a thumbnail for embeds related to the music player, always check for `player.current.thumbnail` first. If it's `null` or `undefined`, use the guild's icon/thumbnail as a fallback.

### JavaScript to TypeScript Port

This project is a port from JavaScript. When encountering JS files or code snippets, they need to be updated to TypeScript.

The old JavaScript code used short-hand function names for replies: `{ r, re, del, delr, er, }`. These correspond to `reply`, `reply ephemeral`, `delete`, `deleteReply`, and `editReply`. In this TypeScript version, these have been replaced by safer and more explicit functions in the utility files (e.g., `sendReply`, `editReply`, `deleteReply`). **Always use the new utility functions over the standard discord.js functions.** These utility functions are designed to handle potential errors, check for permissions, and verify the existence of messages/interactions.

### Code Comments

Comments should be used sparingly. Only add comments if the code's purpose is not immediately clear and the comment can provide essential clarification on *why* a particular implementation was chosen. Avoid comments that explain *what* the code is doing, as the code itself should be self-explanatory.



### Error Handling Strategy

The bot employs a centralized error handling mechanism to provide a consistent user experience and streamlined error management. Custom error classes are used to differentiate between various types of errors.

-   **Custom Error Classes:**
    -   `PermissionError`: Thrown when the bot or a user lacks necessary Discord permissions.
    -   `ValidationError`: Thrown for invalid user input, incorrect command usage, or operational conditions that prevent command execution (e.g., no song playing when one is expected).

-   **Commands:** Commands should **not** handle their own errors with `try...catch` blocks or log errors to the console. Instead, they should `throw` an instance of the appropriate custom error class (e.g., `throw new PermissionError("Missing permissions.");`) when an exceptional situation occurs. This ensures errors are caught by the global error handler.

-   **Global Handler (`interactionCreate` event listener):** The `interactionCreate` event listener acts as the command error handler. It is responsible for catching errors thrown from commands and other interactions.

-   **Error Response Flow:** When an error is caught by the global handler, the following actions are performed based on the error type:
    -   **`PermissionError` or `ValidationError`:**
        1.  An ephemeral reply is sent to the user informing them of the specific issue (e.g., "You do not have permission...", "No song is currently playing...").
        2.  These errors are **not** logged to the console or sent as direct messages to the bot owner, as they represent expected operational conditions or user-related issues.
    -   **Other Errors (Unexpected Code Errors):**
        1.  A generic error message is sent as an ephemeral reply to the user.
        2.  The full error details, including the stack trace, are logged to the console.
        3.  A direct message containing the full error details is sent to the bot owner for immediate attention and debugging.
    -   **Silently Ignore Errors***
        1. To ensure most unecessary errors do not occur, **ALWAYS** use the functions from replyUtils.ts and messageUtils.ts over Discord standard methods
        2. These errors are **not** logged to console or sent as direct messages to the bot owner. They are silently ignored.

### General Guidelines

-   **Unused Imports:** Always remove unused imports to keep the codebase clean and reduce bundle size.
-   **Command Option Examples:** For command options that accept numerical inputs, time durations, or other values where clarity is enhanced by examples, always include an example in the option's description. Use the format `Examples: `<example_value>` or `Examples: `<example1>`, `<example2>``.

### Project Familiarization

Before making any changes or implementing new features, it is crucial to familiarize yourself with the existing codebase and established conventions.

-   **Understand Utility Functions:** Thoroughly review all utility files in `src/utils/`. Understand the purpose and usage of each function, especially `replyUtils.ts`, `preconditions.ts`, `paginationUtils.ts`, `stringUtils.ts`, and `messageUtils.ts`. These utilities are designed to ensure consistency and proper error handling across the application.
-   **Review Existing Commands:** Examine the implementation of existing commands, particularly those in the `music/` folder. These commands serve as excellent examples of how to interact with the Discord API, utilize the `moonlink.js` player, and integrate with the custom utility functions. Pay attention to:
    -   Command structure and data definition.
    -   Error handling patterns.
    -   Usage of `sendReply`, `editReply`, and `deleteReply`.
    -   Interaction with the `client.music` object.
    -   How embeds are constructed and used.

### Music Bot Voice Channel Management

When implementing features that allow users to move the bot between voice channels, consider the following strategies to prevent abuse (e.g., users "stealing" the bot from each other):

1.  **Simple Cooldown:** Implement a cooldown period after a bot move, preventing further moves for a set duration.
2.  **Role-Based Permission:** Restrict bot movement to users with specific Discord roles (e.g., "DJ", "Moderator").
3.  **Session Ownership:** Designate a "session owner" (the user who initiated playback or a move) who has exclusive control over bot movement for a period, or until they leave the channel.
4.  **Confirmation/Voting System:** Require confirmation from users in the current voice channel before the bot can be moved.
5.  **"Queue to Move":** Instead of an immediate move, queue the bot to join the new channel after its current playback session concludes.

## MongoDB Integration

The bot now integrates with MongoDB using Mongoose for persistent storage of guild configurations. The `GuildConfig` model (`src/models/GuildConfig.ts`) defines the schema for storing guild-specific settings. Database operations are handled through `src/utils/dbUtils.ts`.

## Utility Functions Reference

This section provides detailed information on the custom utility functions available in the `src/utils/` directory. Always prefer these functions over direct discord.js API calls for consistency and error handling.

### `activityUtils.ts`

This module provides functions for managing the bot's rotating activities.

-   **`updateActivities(client)`**
    -   **Purpose:** Updates the bot's activity list based on current guild and member counts.
    -   **Parameters:**
        -   `client`: The Discord `Client` object.
    -   **Returns:** `void`

-   **`initializeActivities(client)`**
    -   **Purpose:** Initializes the bot's rotating activities and sets up the `setInterval` to update them.
    -   **Parameters:**
        -   `client`: The Discord `Client` object.
    -   **Returns:** `void`

### `dbUtils.ts`

This module provides functions for interacting with the MongoDB database for guild configurations.

-   **`setupGuilds(client)`**
    -   **Purpose:** Ensures all guilds the bot is currently in have an entry in the database, creating new ones if necessary and updating existing ones.
    -   **Parameters:**
        -   `client`: The Discord `Client` object.
    -   **Returns:** `Promise<void>`

-   **`addGuild(guildId, guildName)`**
    -   **Purpose:** Adds a new guild to the database or updates its name if it already exists.
    -   **Parameters:**
        -   `guildId`: The ID of the guild.
        -   `guildName`: The name of the guild.
    -   **Returns:** `Promise<void>`

-   **`removeGuild(guildId)`**
    -   **Purpose:** Removes a guild's entry from the database.
    -   **Parameters:**
        -   `guildId`: The ID of the guild to remove.
    -   **Returns:** `Promise<void>`

### `replyUtils.ts`

This module provides functions for handling replies to Discord interactions safely and consistently.

-   **`sendReply(interaction, options)`**
    -   **Purpose:** Sends a reply to a Discord interaction. Handles whether the interaction has already been deferred or replied to, ensuring a successful response.
    -   **Parameters:**
        -   `interaction`: The `CommandInteraction`, `MessageComponentInteraction`, or `ModalSubmitInteraction` object.
        -   `options`: An object conforming to `sendReplyOptions` (from `src/types/replyUtils.d.ts`), containing properties like `content`, `embeds`, `components`, `flags`, etc.
    -   **Returns:** A `Promise<Message>` that resolves to the sent message.

-   **`editReply(interaction, options)`**
    -   **Purpose:** Edits an existing reply to a Discord interaction. If no reply exists, it will attempt to send a new one using `sendReply`.
    -   **Parameters:**
        -   `interaction`: The `CommandInteraction`, `MessageComponentInteraction`, or `ModalSubmitInteraction` object.
        -   `options`: An object conforming to `EditReplyOptions` (from `src/types/replyUtils.d.ts`), containing properties to update the message.
    -   **Returns:** `void`

-   **`deleteReply(interaction, options)`**
    -   **Purpose:** Deletes a reply to a Discord interaction after a specified timeout. It also provides buttons for the user to manually save or delete the message.
    -   **Parameters:**
        -   `interaction`: The `CommandInteraction`, `MessageComponentInteraction`, or `ModalSubmitInteraction` object.
        -   `options`: An object conforming to `DeleteReplyOptions` (from `src/types/replyUtils.d.ts`), which can include a `timeout` property (default: 30000ms).
    -   **Returns:** `void`

-   **`deferReply(interaction, ephemeral)`**
    -   **Purpose:** Defers a reply to a Discord interaction, indicating that the bot is processing the command.
    -   **Parameters:**
        -   `interaction`: The `CommandInteraction`, `MessageComponentInteraction`, or `ModalSubmitInteraction` object.
        -   `ephemeral`: A boolean indicating whether the deferred reply should be ephemeral (only visible to the user who invoked the interaction). Defaults to `false`.
    -   **Returns:** `void`

-   **`deferUpdate(interaction)`**
    -   **Purpose:** Defers an update to a message component interaction, indicating that the bot is processing the interaction.
    -   **Parameters:**
        -   `interaction`: The `MessageComponentInteraction` or `ModalSubmitInteraction` object.
    -   **Returns:** `void`

### `paginationUtils.ts`

This module provides a function for handling paginated embeds with navigation buttons.

-   **`pageList(interaction, array, embed, parameter, size, page)`**
    -   **Purpose:** Creates and manages a paginated embed message, allowing users to navigate through a list of items using buttons.
    -   **Parameters:**
        -   `interaction`: The `CommandInteraction`, `MessageComponentInteraction`, or `ModalSubmitInteraction` object.
        -   `array`: The array of items to paginate.
        -   `embed`: An `EmbedBuilder` object to use as the base for the paginated embeds. This embed will be modified to display current page information and fields.
        -   `parameter`: A string prefix for the field names (e.g., "Item #").
        -   `size`: The number of items to display per page.
        -   `page`: The initial page number (0-indexed).

    -   **Returns:** `void`

### `stringUtils.ts`

This module provides utility functions for escaping Markdown characters and other string manipulations.

-   **`escapeMarkdown(text)`**
    -   **Purpose:** Escapes common Markdown characters in a given string to prevent unintended formatting in Discord messages.
    -   **Parameters:**
        -   `text`: The string to escape.

    -   **Returns:** The escaped string.

-   **`formatSongTitle(title, author, url)`**
    -   **Purpose:** Formats a song title and author into a hyperlinked string, with improved logic for checking if the author is already part of the title. It also escapes Markdown characters in the title and author.
    -   **Parameters:**
        -   `title`: The title of the song.
        -   `author`: The author/artist of the song.
        -   `url`: The URL of the song.

    -   **Returns:** The formatted and hyperlinked string.

### `preconditions.ts`

This module provides functions to check preconditions for command execution, ensuring commands are used in appropriate contexts.

-   **`canCommunicate(interaction)`**
    -   **Purpose:** Checks if the bot is able to communicate in the current channel (i.e., not communication-disabled).
    -   **Parameters:**
        -   `interaction`: The `ChatInputCommandInteraction` object.

    -   **Returns:** `Promise<boolean>` - `true` if the bot can communicate, `false` otherwise (and sends an ephemeral reply if not).

## Build, Deploy, and Run

-   **Build:** `npm run build` (This will clean the `dist` directory and then run the TypeScript compiler.)
-   **Deploy Commands:** `npm run deploy` (This builds the project and then deploys the slash commands.)
-   **Run Bot:** `npm run start` (This builds the project and then starts the bot.)

## Deployment Workflow

**Important:** After modifying any command, you **must** run the deploy script (`npm run deploy`) for the changes to take effect on Discord.

## Environment

-   **Operating System:** Windows 11
-   **File Deletion:** Use the `del` command for deleting files (e.g., `del <file_path>`).