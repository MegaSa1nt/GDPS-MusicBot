const { SlashCommandBuilder } = require('discord.js');
const { Player, QueryType, useQueue, useMasterPlayer } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('See queue')
		.addIntegerOption(option =>
			option.setName('page')
			.setDescription('Queue page (unnecessary)')),
	async execute(interaction, gcs) {
		await interaction.deferReply();
		const queue = useQueue(interaction.guild.id);
		var query = interaction.options.getInteger('page', false); 
		if(!query) query = 1;
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
		var tracks = queue.tracks.toArray();
		arr = '';
		x = (query-1)*8;
		pages = ' (*of '+Math.ceil((tracks.length+1)/8)+'*)';
		if(x > tracks.length) {
			x = tracks.length-8;
			query = "last";
			pages = '';
		}
		if(x < 0) x = 0;
		tracks = tracks.slice(x, x+8);
		tracks.forEach(el => {
			x++;
			el = '**'+ el.author + '** — **' + el.title + '** ([**'+el.description+'**]('+gcs.dashboard+'stats/songList.php?search='+el.description+'))';
			arr = arr + '`' + x + ':` ' + el + "\n";
		});
		if(!arr.length) arr = "*Queue is empty!*";
		field = [ { name: 'Current song', value: '[**'+queue.currentTrack.author+' — '+queue.currentTrack.title+'**]('+gcs.dashboard+'stats/songList.php?search='+queue.currentTrack.description+")" }, { name: 'Next songs', value: arr } ];
		messageEmbed = gcs.embed(gcs.mainEmbedColor, 
		'Queue!', 
		gcs.mainEmbedURL, 
		gcs.gdps, 
		gcs.authorEmbedIconURL,
		gcs.authorEmbedURL, 
		'**You\'re on '+query+' page**'+pages, 
		gcs.listThumbnailURL, 
		field, 
		false, 
		gcs.gdps+', thanks for using me!', 
		gcs.mainEmbedFooterIcon);
		interaction.followUp({ embeds: [messageEmbed] });
	},
};