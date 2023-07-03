const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('See help message'),
	async execute(interaction, gcs) {
		await interaction.deferReply();
		arr = '**</play:0> <song>** — add song to queue\n'+
		'**</queue:0> [page]** — see queue\n'+
		'**</pause:0>** — pause/start song\n'+
		'**</stop:0>** — stop playing\n'+
		'**</skip:0> [count]** — skip one or several songs\n'+
		'**</clear:0>** — clear queue\n'+
		'**</shuffle:0>** — shuffle queue\n'+
		'**</loop:0> <mode>** — set loop mode\n'+
		'**</search:0> <search>** — search any songs\n'+
		'||**<necessary>**, **[optional]**||';
		field = { name: 'My commands', value: arr };
		messageEmbed = gcs.embed(gcs.mainEmbedColor, 
		'Помощь!', 
		gcs.mainEmbedURL, 
		gcs.gdps, 
		gcs.authorEmbedIconURL,
		gcs.authorEmbedURL, 
		'### Hi! I\'m '+gcs.gdps+'\'s music bot!\n'+
		'**I play music from this GDPS!**\n', 
		gcs.mainThumbnailURL, 
		field, 
		false, 
		gcs.gdps+', bot version — '+gcs.botVersion+'!', 
		gcs.mainEmbedFooterIcon);
		interaction.followUp({ embeds: [messageEmbed] });
	},
};