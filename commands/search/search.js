const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { Player, QueryType, useQueue, useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search any songs')
		.addStringOption(option =>
			option.setName('search')
			.setDescription('Songs you wish to play')
			.setRequired(true)),
	async execute(interaction, gcs) {
		var notEmpty = true;
		var songsArray = [];
		await interaction.deferReply();
		var query = interaction.options.getString('search', true); 
		const song = await gcs.getSongs(query);
		const queue = useQueue(interaction.guild.id);
		const channel = interaction.member.voice.channel;
		if(queue && queue.channel.id !== channel.id) {
			messageEmbed = gcs.embedShort(gcs.errorEmbedColor, 'I\'m playing in different voice channel!', gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			interaction.followUp({ embeds: [messageEmbed] });
			return;
		}
		var arr = '';
		var x = 0;
		if(!song.success) {
			errors = ['Type something to search!', 'Song was not found! (*Or you tried to play Newgrounds song*)', 'Nothing found!'];
			if(errors[song.error]) messageEmbed = gcs.embedShort(gcs.errorEmbedColor, errors[song.error], gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			else messageEmbed = gcs.embedShort(gcs.errorEmbedColor, errors[2], gcs.authorEmbedIconURL, gcs.authorEmbedURL);
			interaction.followUp({ embeds: [messageEmbed] })
			return;
		}
		if(!song.numeric) tracks = song.songs;
		else tracks = [song.song];
		tracks.forEach(el => {
		if(x >= 8) {return;};
			x++;
			songsArray = songsArray.concat(new StringSelectMenuOptionBuilder()
					.setLabel(el.author + ' — ' + el.name)
					.setDescription('Choose song "'+el.author + ' — ' + el.name + '"')
					.setValue(el.ID));
			el = '**'+ el.author + '** — **' + el.name + '** ([**'+el.ID+'**]('+gcs.dashboard+'stats/songList.php?search='+el.ID+'))';
			arr = arr + '`' + x + ':` ' + el + "\n";
		});
		if(!arr.length) {
			arr = "*Nothing found!*";
			notEmpty = false;
		}
		if(queue) field = [ { name: 'Current song', value: '[**'+queue.currentTrack.author+' — '+queue.currentTrack.title+'**]('+gcs.dashboard+'stats/songList.php?search='+queue.currentTrack.description+")" }, { name: 'Search results', value: arr } ];
		else field = [ { name: 'Search results', value: arr } ];
		messageEmbed = gcs.embed(gcs.mainEmbedColor, 
		'Search!', 
		gcs.mainEmbedURL, 
		gcs.gdps, 
		gcs.authorEmbedIconURL,
		gcs.authorEmbedURL, 
		'You searched: **'+query+'**', 
		gcs.searchThumbnailURL, 
		field, 
		false, 
		gcs.gdps+', thanks for using me!', 
		gcs.mainEmbedFooterIcon);
		if(!notEmpty) interaction.followUp({ embeds: [messageEmbed] });
		else {
			const select = new StringSelectMenuBuilder()
			.setCustomId('song')
			.setPlaceholder('Choose any song!')
			.addOptions(songsArray);
			const row = new ActionRowBuilder().addComponents(select);
			interaction.followUp({ embeds: [messageEmbed], components: [row] });
		}
	},
};