const Discord = require('discord.js');
const {prefix, clientId, 
songAPI, dashboard, gdps, 
mainEmbedColor, errorEmbedColor, warnEmbedColor,
mainEmbedURL, authorEmbedIconURL, authorEmbedURL, mainEmbedFooterIcon, 
mainThumbnailURL, musicThumbnailURL, nomusicThumbnailURL, listThumbnailURL, searchThumbnailURL,
errorSomethingWentWrong, errorCommandNotFound,
botVersion} = require('./config.json');
require('dotenv').config();
const token = process.env.TOKEN;
const { Player, QueryType, useQueue, useMasterPlayer } = require('discord-player');
const { AttachmentExtractor } = require('@discord-player/extractor');
const axios = require("axios");
const fs = require('node:fs');
const path = require('node:path');

const client = new Discord.Client({
    intents: [Discord.GatewayIntentBits.GuildVoiceStates, 		
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildMembers]
});
const commands = [];
client.commands = new Discord.Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} else {
			console.log(`${filePath} doesn't exist.`);
		}
	}
}
const rest = new Discord.REST().setToken(token);
(async () => {
	try {
		console.log(`Updating ${commands.length} (/) commands.`);
		const data = await rest.put(
			Discord.Routes.applicationCommands(clientId),
			{ body: commands },
		);
		console.log(`Successfully updated ${data.length} (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

client.on("interactionCreate", async (interaction) => {
	if(interaction.guildId) {
		if(interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if(!command) {
				await interaction.deferReply();
				messageEmbed = embedShort(errorEmbedColor, errorCommandNotFound, authorEmbedIconURL, authorEmbedURL);
				interaction.followUp({ embeds: [messageEmbed] });
				return;
			}
			try {
				await command.execute(interaction, gcs);
			} catch (error) {
				console.error(error);
				messageEmbed = embedShort(errorEmbedColor, errorSomethingWentWrong, authorEmbedIconURL, authorEmbedURL);
				interaction.followUp({ embeds: [messageEmbed] });
			}
		}
		else if(interaction.isStringSelectMenu()) {
			const command = interaction.client.commands.get("play");
			try {
				await command.execute(interaction, gcs);
			} catch (error) {
				console.error(error);
				messageEmbed = embedShort(errorEmbedColor, errorSomethingWentWrong, authorEmbedIconURL, authorEmbedURL);
				interaction.followUp({ embeds: [messageEmbed] });
			}
		}
	}
});
const player = new Player(client);

player.extractors.register(AttachmentExtractor, {});

player.events.on('playerStart', (queue, track) => {
	messageEmbed = embed(mainEmbedColor, 
	track.author+' — '+track.title, 
	dashboard+'stats/songList.php?search='+track.description, 
	gdps, 
	authorEmbedIconURL,
	authorEmbedURL, 
	'[**'+track.author+'** — **'+track.title+'**]('+dashboard+'stats/songList.php?search='+track.description+') started playing!', 
	musicThumbnailURL, 
	false, 
	false, 
	gdps+', thanks for using me!', 
	mainEmbedFooterIcon);
    queue.metadata.channel.send({ embeds: [messageEmbed] });
});
player.events.on('playerSkip', (queue, track) => {
	messageEmbed = embed(warnEmbedColor, 
	track.author+' — '+track.title, 
	dashboard+'stats/songList.php?search='+track.description, 
	gdps, 
	authorEmbedIconURL,
	authorEmbedURL, 
	'Skipping [**'+track.author+'** — **'+track.title+'**]('+dashboard+'stats/songList.php?search='+track.description+')...', 
	nomusicThumbnailURL, 
	false, 
	false, 
	gdps+', thanks for using me!', 
	mainEmbedFooterIcon);
    queue.metadata.channel.send({ embeds: [messageEmbed] });
});
player.events.on('disconnect', (queue) => {
	messageEmbed = embed(mainEmbedColor, 
	'Queue is empty!', 
	dashboard, 
	gdps, 
	authorEmbedIconURL,
	authorEmbedURL, 
	'I left voice channel, because queue is empty', 
	nomusicThumbnailURL, 
	false, 
	false, 
	gdps+', thanks for using me!', 
	mainEmbedFooterIcon);
    queue.metadata.channel.send({ embeds: [messageEmbed] });
});
player.events.on('emptyChannel', (queue) => {
	messageEmbed = embed(errorEmbedColor, 
	'Empty channel!', 
	dashboard, 
	gdps, 
	authorEmbedIconURL,
	authorEmbedURL, 
	'I left voice channel, because it\'s empty.', 
	nomusicThumbnailURL, 
	false, 
	false, 
	gdps+', thanks for using me!', 
	mainEmbedFooterIcon);
    queue.metadata.channel.send({ embeds: [messageEmbed] });
});

function getSongs(search, full = false) {
	return new Promise(resolve => {
		url = songAPI+"songs.php"; 
		if(!full) data = {search: encodeURIComponent(search)} 
		else data = {search: "MySongs", mysongs: full}
		res = axios.post(url, data).then(res => {
			resolve(res.data);
		});
	})
}

function embed(color, title, url, aun, aui, auu, desc = false, thumb = '', fields = false, image = false, ft, fu) {
	const messageEmbed = new Discord.EmbedBuilder()
	.setColor(color)
	.setTitle(title)
	.setURL(url)
	.setAuthor({ name: aun, iconURL: aui, url: auu })
	.setTimestamp()
	.setFooter({ text: ft, iconURL: fu });
	if(fields) messageEmbed.addFields(fields);
	if(image) messageEmbed.setImage(image);
	if(desc) messageEmbed.setDescription(desc);
	if(thumb != '') messageEmbed.setThumbnail(thumb);
	return messageEmbed;
}

function embedShort(color, aun, aui, auu) {
	const messageEmbed = new Discord.EmbedBuilder()
	.setColor(color)
	.setAuthor({ name: aun, iconURL: aui, url: auu });
	return messageEmbed;
}

var gcs = (function() {
	let gcsFunctions = {};
	gcsFunctions.embedShort = function(color, aun, aui, auu) {
		return embedShort(color, aun, aui, auu);
	}
	gcsFunctions.embed = function(color, title, url, aun, aui, auu, desc = false, thumb = '', fields = false, image = false, ft, fu) {
		return embed(color, title, url, aun, aui, auu, desc, thumb, fields, image, ft, fu);
	}
	gcsFunctions.getSongs = function(search, full = false) {
		return getSongs(search, full);
	}
	gcsFunctions.songAPI = songAPI; 
	gcsFunctions.dashboard = dashboard;
	gcsFunctions.gdps = gdps; 
	gcsFunctions.mainEmbedColor = mainEmbedColor;
	gcsFunctions.errorEmbedColor = errorEmbedColor;
	gcsFunctions.warnEmbedColor = warnEmbedColor;
	gcsFunctions.mainEmbedURL = mainEmbedURL;
	gcsFunctions.authorEmbedIconURL = authorEmbedIconURL;
	gcsFunctions.authorEmbedURL = authorEmbedURL;
	gcsFunctions.mainEmbedFooterIcon = mainEmbedFooterIcon;
	gcsFunctions.mainThumbnailURL = mainThumbnailURL;
	gcsFunctions.musicThumbnailURL = musicThumbnailURL;
	gcsFunctions.nomusicThumbnailURL = nomusicThumbnailURL;
	gcsFunctions.listThumbnailURL = listThumbnailURL;
	gcsFunctions.searchThumbnailURL = searchThumbnailURL;
	gcsFunctions.botVersion = botVersion;
	return gcsFunctions;
})();

client.login(token);
