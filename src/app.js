import { LRUCache } from 'lru-cache'
import DiscordInstance from "./lib/discord.js"
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import ApiInstance from "./lib/faucet.js"
import { fileURLToPath } from 'url';
import * as path from 'path';
import fs from 'fs';
const { DISCORD_TOKEN } = process.env;
// const discord = new DiscordInstance()
// const api = new ApiInstance()
// const options = api.options;
// const cache = new LRUCache(options)
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(DISCORD_TOKEN);

client.commands = new Collection();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, 'commands');
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    import(filePath).then(command => {
        console.log(`command is`)
        console.log(command)

        // Set a new item in the Collection with the key as the command name and the value as the exported module
        // if ('data' in command && 'execute' in command) {
        //     client.commands.set(command.data.name, command);
        // }
        // if ('send' in command && 'deposit' in command){
        //     client.commands.set(command.send.name, command);
        // }
        if (command.data.name){
            client.commands.set(command.data.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    });
}

client.on(Events.InteractionCreate, async interaction => {
    // if (!interaction.isChatInputCommand()) return;
    console.log(`interaction in app ${interaction}`);
    const command = interaction.client.commands.get(interaction.commandName);
    console.log(`command in app is ${interaction.commandName}`)

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        // return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// discord.client.on('interactionCreate', async (interaction) => {
//     console.log("interaction", interaction)

    // try {
    //     switch (interaction.commandName) {
    //         case 'ping':
    //             await interaction.reply('Pong!');
    //             break;
    //         case 'test':
    //             api.apiInit;
    //             await interaction.reply(api);
    //         case 'deposit':
    //             let msg = `Sorry please wait for 2 hours between token requests from the same account!`;
    //             if (!cache.has(interaction.user.id)) {
    //                 msg = await api.send(interaction.options.get('address', true).value);
    //                 cache.set(interaction.user.id, 1, 1000 * 60 * 60 * 2);
    //             }
    //             await interaction.reply(msg);
    //             break;
    //         default:
    //             console.error(`Unknown slash command: ${interaction.content}`);
    //             break;
    //     }
    // } catch (error) {
    //     console.error(error);
    // }

// });