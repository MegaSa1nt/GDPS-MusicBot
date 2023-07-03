const { SlashCommandBuilder } = require('discord.js');
const { Player, QueryType, useQueue, useMainPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Add song(s) to queue')
		.addStringOption(option =>
			option.setName('song')
			.setDescription('Song (or its ID), which you want to play')
			.setRequired(true)),
	async execute(interaction, gcs) {
		await interaction.deferReply();
		const player = useMainPlayer();
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
		var query = '';
		if(interaction.options) query = interaction.options.getString('song', true); 
		else query = interaction.values[0];
		var song = await gcs.getSongs(query);
		if(song.success) {
			try {
				if(song.numeric) {
					song = song.song;
					const { track } = await player.play(channel, song.download, {
						searchEngine: QueryType.AUTO,
						afterSearch: (result) => {
							result.tracks.forEach(track => {
								track.title = song.name;
								track.author = song.author;
								track.description = song.ID;
							});
							return result;
						},
						nodeOptions: {
							metadata: interaction
						}
					});
					messageEmbed = gcs.embedShort(gcs.mainEmbedColor, `${song.author} — ${song.name} in queue!`, gcs.authorEmbedIconURL, gcs.authorEmbedURL);
					return interaction.followUp({ embeds: [messageEmbed] });
				}
				else {
					song.songs.forEach(async function(sng) {
						const { track } = await player.play(channel, sng.download, {
							searchEngine: QueryType.AUTO,
							afterSearch: (result) => {
								result.tracks.forEach(track => {
									track.title = sng.name;
									track.author = sng.author;
									track.description = sng.ID;
								});
								return result;
							},
							nodeOptions: {
								metadata: interaction
							}
						});
					})
					ldig = song.count % 10;
					if(ldig < 5 && ldig != 1) skipped = song.count+' songs'; else if(ldig > 4 || (song.count > 9 && song.count < 20)) skipped = song.count+' songs'; else skipped = song.count+' song';
					messageEmbed = gcs.embedShort(gcs.mainEmbedColor, `${skipped} in queue!`, gcs.authorEmbedIconURL, gcs.authorEmbedURL);
					return interaction.followUp({ embeds: [messageEmbed] });
				}
			} catch (e) {
				console.error(e);
				messageEmbed = gcs.embedShort(gcs.errorEmbedColor, gcs.errorSomethingWentWrong, gcs.authorEmbedIconURL, gcs.authorEmbedURL);
				return interaction.followUp({ embeds: [messageEmbed] });
			}
		} else {
			errors = ['Type something to search!', 'Song was not found! (*Or you tried to play Newgrounds song*)', 'Nothing found!'];
			if(errors[song.error]) messageEmbed = gcs.embedShort(gcs.errorEmbedColor, errors[song.error], gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			else messageEmbed = gcs.embedShort(gcs.errorEmbedColor, errors[song.error], gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			interaction.followUp({ embeds: [messageEmbed] });
		}
	},
};