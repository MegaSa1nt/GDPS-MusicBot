const { SlashCommandBuilder } = require('discord.js');
const { Player, QueryType, useQueue, useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Set loop mode')
		.addIntegerOption(option =>
			option.setName('mode')
				.setDescription('Loop mode')
				.setRequired(true)
				.addChoices(
					{ name: 'Off', value: 0 },
					{ name: 'Loop song', value: 1 },
					{ name: 'Loop queue', value: 2 },
				)),
	async execute(interaction, gcs) {
		await interaction.deferReply();
		const queue = useQueue(interaction.guild.id);
		var query = interaction.options.getInteger('mode', true); 
		query = Math.min(2, Math.max(0, query));
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
		loop = ['Off', 'Loop song', 'Loop queue'];
		queue.setRepeatMode(query);
		messageEmbed = gcs.embedShort(gcs.mainEmbedColor, 'Loop mode was changed to '+loop[query]+'!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
		interaction.followUp({ embeds: [messageEmbed] });
	},
};