/*
Axel Cazorla
9/21/2023

This file will be for the action of "Skip" in our music bot
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()     //We create the slash command to skip ("/skip")
        .setName("skip")
        .setDescription("Skips the current song."),
    execute: async ({client, interaction}) => {

        const queue = client.player.getQueue(interaction.guild);

        if (!queue) {                                               //First we check if there is a song playing
            await interaction.reply("There is no song playing.");   //if there iusnt we let the user know
            return;
        }

        const currentSong = queue.current;

        queue.skip();                                           //if there is song playing we simply call the skip function

        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription('Skipped **${currentSong.title}**')     //When the command executes it will let us know the song we skipped
                    .setThumbnail(currentSong.thumbnail)
            ]
        })
    }
}