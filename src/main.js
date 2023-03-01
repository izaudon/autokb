import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from "discord.js"
import { config } from "dotenv"
import { handler } from "./handler.js"

config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})



client.on("ready", () => console.log("ready!"))
client.on("messageCreate", handler)

client.login(process.env.TOKEN)
