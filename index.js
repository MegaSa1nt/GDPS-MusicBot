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
var mediaQueue = [];
var events = require('events');
var eventEmitter = new events.EventEmitter();
let client = new Revolt.Client();
const connection = revoice.join(config.voice).then(conn => {
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
			currentSong.emit('end');
			message.reply("You skipped a song! (*It can be delayed a bit*)", true);
			break;
		case config.prefix+"stop":
			media.stop();
			mediaQueue = [];
			message.reply("You stopped playing songs!", true);
			break;
	}
});

var musicEvent = async function(songs, message) {
	for(var song in songs) {
		song = songs[song];
		if(!media) media = new MediaPlayer();
		await mediaPlay(song, message);
		console.log('ses');
	}
}
eventEmitter.on('musicPlay', musicEvent);

async function gcsPlay(message, search, type = 0) {
	songs = await getSongs(search);
	if(!songs.success) return message.reply("Nothing found!", true);
	if(!songs.numeric) {
		songs.songs.forEach(song => {
			mediaQueue.push(song);
		})
	} else mediaQueue.push(songs.song);
	eventEmitter.emit('musicPlay',  mediaQueue, message);
}

function mediaPlay(song, message) {
	return new Promise(resolve => {
		const readableStream = fetch(song.download).then(r => {
			currentSong = Readable.fromWeb(r.body);
			media.playStream(currentSong).then(g => {
				message.reply("**"+song.author+"** — **"+song.name+"** is playing!", false);
			});
			media.finished = () => {resolve(true);};
			promiseFunc = () => {resolve(true);};
			currentSong.on('error', e => {console.log(e);});
		});
	});
}

function getSongs(search, full = false) {
	return new Promise(resolve => {
		url = config.songAPI+"songs.php"; 
		if(!full) data = {search: encodeURIComponent(search)} 
		else data = {search: "MySongs", mysongs: full}
		res = axios.post(url, data).then(res => {
			resolve(res.data);
		});
	})
}

client.loginBot(token);