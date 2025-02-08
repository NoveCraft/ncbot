const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "serpiente",
  description: "jugar al juego de la serpiente en discord",
  cooldown: 300,
  category: "DIVERSIÓN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    await message.safeReply("**Iniciando el juego de la serpiente**");
    await startSnakeGame(message);
  },

  async interactionRun(interaction) {
    await interaction.followUp("**Iniciando el juego de la serpiente**");
    await startSnakeGame(interaction);
  },
};

async function startSnakeGame(data) {
  const snakeGame = new SnakeGame({
    title: "Juego de la Serpiente",
    color: "AZUL",
    timestamp: true,
    gameOverTitle: "Juego Terminado",
  });

  await snakeGame.newGame(data);
}
