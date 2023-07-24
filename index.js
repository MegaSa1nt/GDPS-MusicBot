const { Revoice, MediaPlayer } = require("revoice.js");
const Revolt = require("revolt.js");
const fs = require("fs");
require('dotenv').config();
const token = process.env.TOKEN;
const config = require('./config.json');
var media = new MediaPlayer();
const revoice = new Revoice(token);
const { Readable } = require('stream');
const axios = require("axios");
var playingSong = null;
var isPaused = false;
var mediaQueue = [];
var events = require('events');
var eventEmitter = new events.EventEmitter();
let client = new Revolt.Client();
const connection = revoice.join(config.voice).then(conn => {
	client.loginBot(token);
	conn.on('join', () => {
		conn.play(media);
	})
});

client.on("messageCreate", async (message) => {
	if(!message.content.startsWith(config.prefix)) return;
	command = message.content.split(" ");
	switch(command[0]) {
		case config.prefix+"play":
			command[0] = null;
			search = command.join(" ").trim();
			gcsPlay(message, search, 0);
			break;
		case config.prefix+"skip":
			if(!checkMusic(message)) break;
			await currentSong.destroy();
			media.stop().then(l => {
				message.reply(iconem(config.gdps, "You skipped [**"+playingSong.author+"** — **"+playingSong.name+"**]("+config.dashboard+"stats/songList.php?search="+playingSong.ID+")!", config.authorEmbedIconURL, config.warnEmbedColor), true).catch(() => {});
				promiseFunc();
			});
			break;
		case config.prefix+"stop":
			if(!checkMusic(message)) break;
			await currentSong.destroy();
			media.stop().then(l => {
				isPaused = false;
				playingSong = null;
				mediaQueue = [];
				message.reply(iconem(config.gdps, "You stopped playing songs!", config.authorEmbedIconURL, config.errorEmbedColor), true).catch(() => {});
			});
			break;
		case config.prefix+"pause":
			if(!checkMusic(message)) break;
			if(!isPaused) {
				media.pause();
				message.reply(iconem(config.gdps, "[**"+playingSong.author+"** — **"+playingSong.name+"**]("+config.dashboard+"stats/songList.php?search="+playingSong.ID+") was paused!", config.authorEmbedIconURL, config.warnEmbedColor), true).catch(() => {});
				isPaused = true;
			} else {
				media.resume();
				message.reply(iconem(config.gdps, "[**"+playingSong.author+"** — **"+playingSong.name+"**]("+config.dashboard+"stats/songList.php?search="+playingSong.ID+") was resumed!", config.authorEmbedIconURL, config.warnEmbedColor), true).catch(() => {});
				isPaused = false;
			}
			break;
		case config.prefix+"queue":
			if(!checkMusic(message)) break;
			arr = '';
			tracks = mediaQueue;
			if(typeof command[1] == "undefined" || command[1] < 1) command[1] = 1;
			page = (Number(command[1]) - 1) * 8;
			if(page >= tracks.length) page = tracks.length - 8;
			tracks = tracks.slice(page, page + 8);
			tracks.forEach(el => {
				page++;
				el = '**'+ el.author + '** — **' + el.name + '** ([**'+el.ID+'**]('+config.dashboard+'stats/songList.php?search='+el.ID+'))';
				arr = arr + '`' + page + ':` ' + el + "\n";
			});
			if(!arr.length) arr = "*Nothing in queue*";
			queueText = "**Current song**\n"+
			'**'+ playingSong.author + '** — **' + playingSong.name + '** ([**'+playingSong.ID+'**]('+config.dashboard+'stats/songList.php?search='+playingSong.ID+'))\n'+
			"\n"+
			"**Next songs**\n"+
			arr.trim()
			message.reply(iconem(config.gdps, queueText, config.authorEmbedIconURL), true).catch(() => {});
			break;
		case config.prefix+"clear":
			if(!checkMusic(message)) break;
			mediaQueue = [];
			message.reply(iconem(config.gdps, "Queue was cleared!", config.authorEmbedIconURL, config.warnEmbedColor), true).catch(() => {});
			break;
		case config.prefix+"help":
			arr = '### Hello! I\'m '+config.gdps+'\'s music bot!\n'+
			'**I play music uploaded to this GDPS!**\n\n'+
			'**/play <name>** — add song to queue\n'+
			'**/queue [page]** — see queue\n'+
			'**/pause** — pause/resume song\n'+
			'**/stop** — stop playing\n'+
			'**/skip** — skip song\n'+
			'**/clear** — clear queue\n'+
			'**/shuffle** — shuffle queue\n'+
			'**/search <search>** — search songs\n\n'+
			'**<necessary>**, **[optional]**';
			message.reply(iconem(config.gdps, arr, config.authorEmbedIconURL), true).catch(() => {});
			break;
		case config.prefix+"shuffle":
			if(!checkMusic(message)) break;
			mediaQueue = mediaQueue.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
			message.reply(iconem(config.gdps, "Queue was shuffled!", config.authorEmbedIconURL), true).catch(() => {});
			break;
		case config.prefix+"search":
			x = 0;
			arr = '';
			command[0] = null;
			search = command.join(" ").trim();
			song = await getSongs(search);
			if(!song.success) return message.reply(iconem(config.gdps, "Nothing found!", config.authorEmbedIconURL, config.errorEmbedColor), true).catch(() => {});
			if(!song.numeric) tracks = song.songs;
			else tracks = [song.song];
			tracks = tracks.slice(0, 8);
			tracks.forEach(el => {
				x++;
				el = '**'+ el.author + '** — **' + el.name + '** ([**'+el.ID+'**]('+config.dashboard+'stats/songList.php?search='+el.ID+'))';
				arr = arr + '`' + x + ':` ' + el + "\n";
			});
			message.reply(iconem(config.gdps, "You searched: **"+search+"**\n\n**Search results**\n"+arr.trim(), config.authorEmbedIconURL), true).catch(() => {});
			break;
	}
});

var musicEvent = async function(message) {
	playingSong = mediaQueue.shift();
	await mediaPlay(playingSong, message).catch(() => {});
	playingSong = null;
	if(mediaQueue.length > 0) eventEmitter.emit('musicPlay', message);
	else eventEmitter.emit('queueEnd', message);
}
eventEmitter.on('musicPlay', musicEvent);
eventEmitter.on('queueEnd', (message) => {
	message.channel.sendMessage(iconem(config.gdps, "Queue ended!", config.authorEmbedIconURL, config.warnEmbedColor)).catch(() => {});
});

async function gcsPlay(message, search) {
	songs = await getSongs(search);
	oldQueueLength = mediaQueue.length;
	if(!songs.success) return message.reply(iconem(config.gdps, "Nothing found!", config.authorEmbedIconURL, config.errorEmbedColor), true).catch(() => {});
	if(!songs.numeric) {
		songs.songs.forEach(song => {
			song.message = message;
			mediaQueue.push(song);
		});
		ldig = songs.count % 10;
		if(ldig < 5 && ldig != 1) skipped = songs.count+' songs'; else if(ldig > 4 || (songs.count > 9 && songs.count < 20)) skipped = songs.count+' songs'; else skipped = songs.count+' song';
		message.reply(iconem(config.gdps, "Added "+skipped+" to queue!", config.authorEmbedIconURL, config.errorEmbedColor), true).catch(() => {});
	} else {
		songs.song.message = message;
		mediaQueue.push(songs.song);
		message.reply(iconem(config.gdps, "Added [**"+songs.song.author+"** — **"+songs.song.name+"**]("+config.dashboard+"stats/songList.php?search="+songs.song.ID+") to queue!", config.authorEmbedIconURL, config.errorEmbedColor), true).catch(() => {});
	}
	if(oldQueueLength == 0 && playingSong == null) eventEmitter.emit('musicPlay',  message);
}

function mediaPlay(song, message) {
	return new Promise(async function(resolve) {
		const readableStream = fetch(song.download).then(r => {
			currentSong = Readable.fromWeb(r.body);
			currentSong.on('error', async function(e) {
				await currentSong.destroy();
				media.stop().then(l => {song.message.reply(iconem(config.gdps, "**"+song.author+"** — **"+song.name+"** was skipped for some error!", config.authorEmbedIconURL, config.errorEmbedColor), false).catch(() => {}); promiseFunc();});
			});
			media.playStream(currentSong).then(g => {
				song.message.reply(iconem(config.gdps, "[**"+song.author+"** — **"+song.name+"**]("+config.dashboard+"stats/songList.php?search="+song.ID+") is playing!", config.authorEmbedIconURL), false).catch(() => {});
			});
			media.finished = promiseFunc = () => {resolve(true);};
		}).catch(() => {resolve(true);});
	});
}

function getSongs(search, full = false) {
	return new Promise(resolve => {
		url = config.songAPI+"songs.php"; 
		data = {search: encodeURIComponent(search)} 
		res = axios.post(url, data).then(res => {
			resolve(res.data);
		});
	});
}

function checkMusic(message) {
	if(mediaQueue.length == 0 && playingSong == null) {
		message.reply(iconem(config.gdps, "Nothing is playing now!", config.authorEmbedIconURL, config.errorEmbedColor), true).catch(() => {});
		return false;
	} else return true;
}

function embedify(text = "", color = "#"+config.mainEmbedColor) { // Gently stole embed functions from Remix
    return {
		type: "Text",
		description: "" + text,
		colour: color,
    }
}

function iconem(title, text, img, color = config.mainEmbedColor) {
    let e = embedify(text, "#"+color);
    e.icon_url = img;
    e.title = title;
    return {
		content: "",
		embeds: [e]
	}
}

function bufferToStream(buffer) { 
	var stream = new Readable();
	stream.push(buffer);
	stream.push(null);
	return stream;
}