/*
Axel Cazorla
9/21/2023

This file will be for the action of "Queue" in our music bot
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const { MessageEmbed, flatten } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()     //We create the slash command to resume ("/resume")
        .setName("queue")
        .setDescription("Shows the first 10 songs in the queue."),
    execute: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guild);

        if (!queue || !queue.playing) {
            await interaction.reply("There is no song playing");
            return;
        }

        const queueString = queue.tracks.slice(0,10).map((song, i) => {
            return `${i + 1}) [${song.duration}]\` ${song.title} - <@${song.RequestedBy.id}>`;
        })
    }
}