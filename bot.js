require("dotenv").config();
require("module-alias/register");

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Agrega estas constantes al principio de tu archivo
const ERROR_CHANNEL_ID = process.env.ERROR_CHANNEL_ID; // Define esto en tu .env

// Manejador de comandos
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignora mensajes de bots

  const userId = message.author.id;
  const userMention = message.author.toString();
  const serverId = message.guild.id;
  const commandUsed = message.content; // Asumiendo que el contenido del mensaje es el comando
  let functionStatus = 'ok'; // Estado por defecto

  try {
    // Aquí iría la lógica para manejar el comando
    // Por ejemplo, si estás usando un comando específico:
    // await handleCommand(message);
  } catch (error) {
    functionStatus = 'err'; // Cambia el estado a error si ocurre una excepción
    console.error(`Error al ejecutar el comando: ${error.message}`);
  } finally {
    // Envía la interacción al canal de errores
    const errorChannel = await client.channels.fetch(ERROR_CHANNEL_ID);
    if (errorChannel) {
      errorChannel.send(`**Interacción del Bot:**\nUsuario: ${userMention} (ID: ${userId})\nServidor: ${serverId}\nComando: ${commandUsed}\nEstado: ${functionStatus}`);
    } else {
      console.error("No se pudo encontrar el canal de errores.");
    }
  }
});




// register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

validateConfiguration();

// initialize client
const client = new BotClient();
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));

(async () => {
  // check for updates
  await checkForUpdates();

  // start the dashboard
  if (client.config.DASHBOARD.enabled) {
    client.logger.log("Launching dashboard");
    try {
      const { launch } = require("@root/dashboard/app");

      // let the dashboard initialize the database
      await launch(client);
    } catch (ex) {
      client.logger.error("Failed to launch dashboard", ex);
    }
  } else {
    // initialize the database
    await initializeMongoose();
  }

  // start the client
  await client.login(process.env.BOT_TOKEN);
})();
