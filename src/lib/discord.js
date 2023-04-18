import Discord, { GatewayIntentBits } from "discord.js"


const { TOKEN } = process.env

class DiscordInstance {
    constructor() {
        this.client = new Discord.Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildIntegrations
            ]
        });

        this.client.on('ready', () => {
            console.log(`Faucet Bot logged in as ${this.client.user.tag}`);
        });

        this.client.login(TOKEN);
    }
}






export default DiscordInstance