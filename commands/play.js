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
        execute: async ({client, interaction}) => {
            if (!interaction.member.voice.channel)
            {
                await interaction.reply("You must be in a voice channel to use this command")
                return;
            }

            const queue = await client.player.createQueue(interaction.guild);

            if(!queue.connection) await queue.connect(interaction.member.voice.channel)

            let embed = new MessageEmbed();
            if(interaction.options.getSubcommand() === "song")
            {
                let url = interaction.options.getString("url");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO,
                });

                if(result.tracks.length === 0)
                {
                    await interaction.reply("no results found/invalid choice")
                    return
                }

                const song = result.tracks[0]
                await queue.addTrack(song);

                embed
                    .setDescription('Added **[${song.title}](${song.url})** to queue')
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: 'Duration: ${song.duration}'});
            }
            else if(interaction.options.getSubcommand() === "playlist")
            {
                let url = interaction.options.getString("url");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_PLAYLIST,
                });

                if(result.tracks.length === 0)
                {
                    await interaction.reply("no playlist found/invalid choice")
                    return
                }

                const playlist = result.playlist;
                await queue.addTracks(song);

                embed
                    .setDescription('Added **[${playlist.title}](${playlist.url})** to queue')
                    .setThumbnail(playlist.thumbnail)
                    .setFooter({text: 'Duration: ${playlist.duration}'});
            }
            else if(interaction.options.getSubcommand() === "search")
            {
                let url = interaction.options.getString("searchterms");

                const result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO,
                });

                if(result.tracks.length === 0)
                {
                    await interaction.reply("no results found/invalid choice")
                    return
                }

                const song = result.tracks[0];
                await queue.addTracks(song);

                embed
                    .setDescription('Added **[${song.title}](${song.url})** to queue')
                    .setThumbnail(song.thumbnail)
                    .setFooter({text: 'Duration: ${song.duration}'});
            }

            if(!queue.playing) await queue.play();

            await interaction.reply({
                embeds: [embed]
            })

        }
}