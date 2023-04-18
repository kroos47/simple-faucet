import { SlashCommandBuilder } from '@discordjs/builders';
import ApiInstance from "./../lib/faucet.js"
const api = new ApiInstance();
export const data = new SlashCommandBuilder()
					.setName('send')
					.setDescription('sends 1 AVL to the address')
					.addStringOption(option =>
						option.setName('address')
						.setDescription('Address which the AVL to be deposited')
						.setRequired(true)
					);

export async function execute( interaction ){
	console.log(`interaction is ${interaction}`, interaction);
	const address = String(interaction).split(':')?.[1]
	console.log(address)
	let msg = await api.send(address);
	await interaction.reply(msg);
}