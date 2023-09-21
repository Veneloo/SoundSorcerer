/*
Axel Cazorla
9/21/23
This is the main file for our music bot
*/

require("dotenv").config();
const {REST} = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents, Collection } = require("discord.js");
const { Player } = require("discord-player");

const fs = require("node:fs")
const path = require("node:path");

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILDS_MESSAGES, 
        Intents.FLAGS.GUILDS_VOICE_STATES]
});

//Load all the commands
const commands = [];                //The array is gonna hold all our commands
client.commands = new Collection(); //And the "client.commad" will store it in Collection

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles)
{
    const filePath = path.join(commandsPath, file);
    const command = require (filePath);

    client.commands.set(command.data.name, command);
    commands.push(command)

}

//This is the Player to play all the music 
client.player = new Player(client,{     //We store it inside the client object so all the commands are accesible
    ytdlOptions: {
        quality: "highestaudio",        //We give it the best audio
        highWaterMark: 1 << 25
    }
});

//We register all the commands with the api and the TOKEN ID
client.on("ready", () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);

    const rest = new REST({version: "9"}).setToken(process.env.TOKEN);
    for (const guildId of guild_ids)
    {
        rest.put(Routes.applicationGuildCommand(process.env.CLIENT_ID, guildId), {
            body: commands
        })
        .then(() => console.log('Added commands to ${guildId}'))
        .catch(console.error);
    }
});

//This is an interaction tab that handles all commands
client.on("interactionCreate", async interaction => {               //first we check if its a command if its not we simply ignore it
    if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);   //if it is a command (stored in our client) it will simply activate
    if(!command) return;

    try
    {
        await command.execute({client, interaction});               //here we actually execute the command by accessing the player 
    }
    catch(err)
    {
        console.error(err);
        await interaction.reply('An error ocurred while executing that command');   //This sends a error message in case theres an error
    }
});

//Lastly we log in our bot
client.login(process.env.TOKEN)