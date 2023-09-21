/*
Axel Cazorla
9/21/2023

This file will be for the action of "Exit" in our music bot
*/

const {SlashCommandBuilder} = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()     //We create the slash command to exit ("/exit")
        .setName("pause")
        .setDescription("Pauses the current song."),
    execute: async ({client, interaction}) => {

        const queue = client.player.getQueue(interaction.guild);

        if (!queue) {                                               //First we check if there is a song playing
            await interaction.reply("There is no song playing.");   //if there isnt we let the user know
            return;
        }


        queue.destroy();                                           //if there is song playing we simply call the destroy function to terminate all actions

        await interaction.reply("Why do you hate me :(? :nerdass: .");   //when the command is executed we let the user know the bot was killed :(
    }
}