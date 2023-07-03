const { SlashCommandBuilder } = require('discord.js');
const { Player, QueryType, useQueue, useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear queue'),
	async execute(interaction, gcs) {
		await interaction.deferReply();
		const queue = useQueue(interaction.guild.id);
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
		if(!queue) {
			messageEmbed = gcs.embedShort(gcs.errorEmbedColor, 'There is nothing in queue!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			interaction.followUp({ embeds: [messageEmbed] });
			return;
		}
		queue.clear();
		messageEmbed = gcs.embedShort(gcs.mainEmbedColor, 'Queue was cleared!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
		interaction.followUp({ embeds: [messageEmbed] });
	},
};