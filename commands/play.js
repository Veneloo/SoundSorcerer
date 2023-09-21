/*
Axel Cazorla
9/21/2023
This file will be for the action of "Play" in our music bot
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()     //We are gonna add our slash commands
        .setName("play")                
        .setDescription("Plays a song.")    //This first one activates by using "/play" and will play a song
        .addSubcommand(subcommand => {
            subcommand
                .setName("search")
                .setDescription("Searches for a song.")     //Additionally we can add "/play search" this will promp the follwowing
                .addStringOption(option => {
                    option
                        .setName("searchterms")
                        .setDescription("search keywords")  //This will add the searchterms box, which wil look for the keyword term you want to look for i.e song
                        .setRequired(true);
                })
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName("playlist")                        //We can look for a playlist using "/playlist"
                .setDescription("Plays Playlist from Youtube")
                .addStringOption(option => {
                    option
                        .setName("url")
                        .setDescription("playlist url")  //This will prompt you to enter the URL from the playlist in Youtube
                        .setRequired(true);
                })
        })
        .addSubcommand(subcommand => {
            subcommand
                .setName("song")                            //Here we can jus use "/song" to play a single song 
                .setDescription("Plays a song from Youtube.")
                .addStringOption(option => {
                    option
                        .setName("url")
                        .setDescription("url of the song")  //This will prompt you to enter the URL from the song in Youtube
                        .setRequired(true);
                })
        }),
        execute: async ({client, interaction}) => {         //This will actually execute our commands
            if (!interaction.member.voice.channel)
            {
                await interaction.reply("You must be in a voice channel to use this command")   //First we check if the user is in a voice channel if not, we will prompt a message that he needs to join
                return;
            }

            const queue = await client.player.createQueue(interaction.guild);

            if(!queue.connection) await queue.connect(interaction.member.voice.channel)

            let embed = new MessageEmbed();
            if(interaction.options.getSubcommand() === "song")          //if the user picked the song command it will wait for the url of the desired song
            {
                let url = interaction.options.getString("url");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO,          //it will expect a youtube video url
                });

                if(result.tracks.length === 0)
                {
                    await interaction.reply("no results found/invalid choice")      //in case the duration of the song is 0 or is not available it will send a message letting the user know about the error
                    return
                }

                const song = result.tracks[0]                           
                await queue.addTrack(song);

                embed
                    .setDescription(`Added **[${song.title}](${song.url})** to queue`)  //This will add the songs to the queue
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Duration: ${song.duration}`});
            }
            else if(interaction.options.getSubcommand() === "playlist")     //If the user picked the playlist command it will wait for the playlist url
            {
                let url = interaction.options.getString("url");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_PLAYLIST,           //It expects to recieve a youtube playlist link
                });

                if(result.tracks.length === 0)
                {
                    await interaction.reply("no playlist found/invalid choice")     //If the playlist has no content or is not available it will let the user know
                    return
                }

                const playlist = result.playlist;
                await queue.addTracks(song);

                embed
                    .setDescription(`Added **[${playlist.title}](${playlist.url})** to queue`)  //This simply adds the playlist to the queue
                    .setThumbnail(playlist.thumbnail)
                    .setFooter({text: `Duration: ${playlist.duration}`});
            }
            else if(interaction.options.getSubcommand() === "search")       //in case the user chose the search command it will expect a keyword
            {
                let url = interaction.options.getString("searchterms");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO,               //The auto will look for any keyword matching the word from the input
                });

                if(result.tracks.length === 0)
                {
                    await interaction.reply("no results found/invalid choice")  //if the search was invalid or not available it will let the user know
                    return
                }

                const song = result.tracks[0];
                await queue.addTracks(song);

                embed
                    .setDescription(`Added **[${song.title}](${song.url})** to queue`)  //This simply adds the song to the queue
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: `Duration: ${song.duration}`});
            }
            //here we actually start playing the music
            if(!queue.playing) await queue.play();  //We first check that if there isnt music already playing we start playing music

            await interaction.reply({       //This simply just takes the embeded entries from the interactions to start playing 
                embeds: [embed]
            })

        }
}