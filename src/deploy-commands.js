import { REST, Routes } from 'discord.js';
const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env
import fs from 'node:fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const commands = [];
// Grab all the command files from the commands directory you created earlier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
// for (const file of commandFiles) {
//     const filePath = path.join(commandsPath, file);
// 	// const command = require(`./commands/${file}`);
// 	// commands.push(command.data.toJSON());
//     import(filePath).then(command => {
//         commands.push(command.data.toJSON());
//     });
// }

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(DISCORD_TOKEN);

// and deploy your commands!
(async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        // const command = require(`./commands/${file}`);
        // commands.push(command.data.toJSON());
        try {
            const command = await import(filePath)
            commands.push(command.data);
        }
        catch (e) {
            console.log(e)
        }
    }
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();