const { SlashCommandBuilder } = require('discord.js');
const { Player, QueryType, useQueue, useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip a song')
		.addIntegerOption(option =>
			option.setName('count')
			.setDescription('How much songs you want to skip (unnecessary)')),
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
		const query = interaction.options.getInteger('count', false); 
		if(!query) {
			messageEmbed = gcs.embedShort(gcs.mainEmbedColor, 'You skipped '+queue.currentTrack.author+' — '+queue.currentTrack.title+'!', gcs.authorEmbedIconURL, gcs.dashboard+'stats/songList.php?search='+queue.currentTrack.description);
			queue.node.skip();
		}
		else {
			const tracks = queue.tracks.toArray();
			if(!tracks.length || tracks.length == 1) {
				messageEmbed = gcs.embedShort(gcs.mainEmbedColor, 'You skipped '+queue.currentTrack.author+' — '+queue.currentTrack.title+'!', gcs.authorEmbedIconURL, gcs.dashboard+'stats/songList.php?search='+queue.currentTrack.description);
				queue.node.skip();
			} else {
				skipping = Math.min(tracks.length, Math.max(0, query));
				ldig = skipping % 10;
				if(ldig < 5 && ldig != 1) skipped = skipping+' songs'; else if(ldig > 4 || (skipping > 9 && skipping < 20)) skipped = skipping+' songs'; else skipped = skipping+' song';
				messageEmbed = gcs.embedShort(gcs.mainEmbedColor, 'You skipped '+skipped+'!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
				queue.node.skipTo(tracks[skipping-1]);
			}
		}
		interaction.followUp({ embeds: [messageEmbed] });
	},
};