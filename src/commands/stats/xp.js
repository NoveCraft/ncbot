const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "levelup",
  description: "configurar el sistema de niveles",
  category: "STATS",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "message <nuevo-mensaje>",
        description: "establecer un mensaje personalizado de subida de nivel",
      },
      {
        trigger: "channel <#canal|off>",
        description: "establecer el canal para enviar mensajes de subida de nivel",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "message",
        description: "establecer un mensaje personalizado de subida de nivel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message",
            description: "mensaje para mostrar cuando un usuario sube de nivel",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "channel",
        description: "establecer el canal para enviar mensajes de subida de nivel",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "canal para enviar mensajes de subida de nivel",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    const subcommandArgs = args.slice(1);
    let response;

    // message
    if (sub === "message") {
      const message = subcommandArgs.join(" ");
      response = await setMessage(message, data.settings);
    }

    // channel
    else if (sub === "channel") {
      const input = subcommandArgs[0];
      let channel;

      if (input === "off") channel = "off";
      else {
        const match = message.guild.findMatchingChannels(input);
        if (match.length === 0) return message.safeReply("Canal inválido. Por favor, proporciona un canal válido");
        channel = match[0];
      }
      response = await setChannel(channel, data.settings);
    }

    // invalid
    else response = "Subcomando inválido";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    if (sub === "message") response = await setMessage(interaction.options.getString("message"), data.settings);
    else if (sub === "channel") response = await setChannel(interaction.options.getChannel("channel"), data.settings);
    else response = "Subcomando inválido";

    await interaction.followUp(response);
  },
};

async function setMessage(message, settings) {
  if (!message) return "Mensaje inválido. Por favor, proporciona un mensaje";
  settings.stats.xp.message = message;
  await settings.save();
  return `Configuración guardada. ¡Mensaje de subida de nivel actualizado!`;
}

async function setChannel(channel, settings) {
  if (!channel) return "Canal inválido. Por favor, proporciona un canal";

  if (channel === "off") settings.stats.xp.channel = null;
  else settings.stats.xp.channel = channel.id;

  await settings.save();
  return `Configuración guardada. ¡Canal de subida de nivel actualizado!`;
}
