const { SlashCommandBuilder } = require('discord.js');
const { Player, QueryType, useQueue, useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop playing'),
	async execute(interaction, gcs) {
		await interaction.deferReply();
		const queue = useQueue(interaction.guild.id);
		if(!queue) {
			messageEmbed = gcs.embedShort(gcs.errorEmbedColor, 'There is nothing in queue!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			interaction.followUp({ embeds: [messageEmbed] });
			return;
		}
		const channel = interaction.member.voice.channel;
		if(!channel) {
			messageEmbed = gcs.embedShort(gcs.errorEmbedColor, 'Join voice channel!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			interaction.followUp({ embeds: [messageEmbed] });
			return;
		}
		if(queue && queue.channel.id !== channel.id) {
			messageEmbed = gcs.embedShort(gcs.errorEmbedColor, 'I\'m playing in different voice channel!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			interaction.followUp({ embeds: [messageEmbed] });
			return;
		}
		queue.delete();
		messageEmbed = gcs.embedShort(gcs.errorEmbedColor, 'Bot stopped playing songs!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
		interaction.followUp({ embeds: [messageEmbed] });
	},
};