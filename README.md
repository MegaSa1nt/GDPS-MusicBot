# GDPS-MusicBot
Music bot for your GDPSs for Revolt! (It plays music from your GDPS)

**Before using this bot**:
- This is **VERY** alpha version. For now it only has three commands: `/play`, `/skip` (*doesn't work*) and `/stop`
- This bot doesn't use Embeds now, so Embed configs are unused
- You must use [**my dashboard**](https://github.com/MegaSa1nt/GMDprivateServer) :trollface:
- You should know how to create and host Revolt bot
- You should install node.js (v18.16.0 works fine)
- You should run `npm i` command in bot's folder
- This bot is supposed to run on only one Revolt server

**How to configure**:
- There is **config.json** file, you should open it
- Description for every config variable:
  - "prefix" — prefix of your bot, unused
  - "voice" — Voice channel you want bot to play music in
  - "songAPI" — [your API folder in dashboard](https://gcs.icu/WTFIcons/guides/songAPI.png)
  - "dashboard" — [your main dashboard folder](https://gcs.icu/WTFIcons/guides/dashboard.png)
  - "mainEmbedColor" — [color of almost all bot embeds](https://gcs.icu/WTFIcons/guides/mainEmbedColor.png)
  - "errorEmbedColor" — [embed errors color](https://gcs.icu/WTFIcons/guides/errorEmbedColor.png)
  - "warnEmbedColor" — [embed warn color](https://gcs.icu/WTFIcons/guides/warnEmbedColor.png)
  - "mainEmbedURL" — [URL of embed titles](https://gcs.icu/WTFIcons/guides/mainEmbedURL.png)
  - "authorEmbedIconURL" — [author's icon URL](https://gcs.icu/WTFIcons/guides/authorEmbedIconURL.png)
  - "authorEmbedURL" — [author's URL](https://gcs.icu/WTFIcons/guides/authorEmbedURL.png)
  - "mainEmbedFooterIcon" — [embed footer icon](https://gcs.icu/WTFIcons/guides/mainEmbedFooterIcon.png)
  - "mainThumbnailURL" — thumbnail of almost all bot embeds
  - "musicThumbnailURL" — thumbnail of "playing song" embed message
  - "nomusicThumbnailURL" — thumbnail of "stopped playing" embed message
  - "listThumbnailURL" — thumbnail of queue embed message
  - "searchThumbnailURL" — thumbnail of search embed message
  - "errorSomethingWentWrong" — message text when unexpected error happens
  - "errorCommandNotFound" — message text when command was not found
  - "botVersion" — bot version

Used libraries:
```
"@discord-player/extractor": "^4.3.1",
"axios": "^1.4.0",
"discord-player": "^6.6.0",
"dotenv": "^16.3.1",
"ffmpeg-static": "^5.1.0",
"revoice.js": "^0.1.7537",
"revolt.js": "6.0.20-patch.2",
"ytdl-core": "^4.11.4"
```

Thanks for using it!
