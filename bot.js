import 'dotenv/config';
import 'module-alias/register';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Define estas constantes al principio de tu archivo
const ERROR_CHANNEL_ID = process.env.ERROR_CHANNEL_ID; // Define esto en tu .env

//////////////////////////////


//////////////////////////////
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Importa los extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

validateConfiguration();

// Inicializa el cliente
const client = new BotClient();
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

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

// Manejo de promesas no manejadas
process.on("unhandledRejection", (err) => console.error(`Unhandled exception`, err));

(async () => {
  // Verifica actualizaciones
  await checkForUpdates();

  // Inicia el dashboard
  if (client.config.DASHBOARD.enabled) {
    console.log("Lanzando dashboard");
    try {
      // Deja que el dashboard inicialice la base de datos
      const { launch } = require("@root/dashboard/app");
      await launch(client);
    } catch (error) {
      console.error("Error al lanzar el dashboard:", error);
    }
  }

  // Inicializa la base de datos
  await initializeMongoose();

  // Inicia el cliente
  await client.login(process.env.BOT_TOKEN);
})().catch(error => {
  console.error("Error al iniciar el cliente:", error);
});
