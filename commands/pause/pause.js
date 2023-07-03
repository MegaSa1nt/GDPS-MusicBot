const { SlashCommandBuilder } = require('discord.js');
const { Player, QueryType, useQueue, useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause/start song'),
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
		if(!queue.node.isPaused()) {
			messageEmbed = gcs.embedShort(gcs.warnEmbedColor, queue.currentTrack.author+' — '+queue.currentTrack.title+' was paused!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			queue.node.setPaused(true);
		} else {
			messageEmbed = gcs.embedShort(gcs.mainEmbedColor, queue.currentTrack.author+' — '+queue.currentTrack.title+' is playing!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			queue.node.setPaused(false);
		}
		interaction.followUp({ embeds: [messageEmbed] });
	},
};