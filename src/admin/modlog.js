const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "modlog",
  description: "habilitar o deshabilitar registros de moderación",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#canal|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "canal",
        description: "canales para enviar registros de moderación",
        required: false,
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size === 0) return message.safeReply("Uso incorrecto del comando");
      targetChannel = message.mentions.channels.first();
    }

    const response = await setChannel(targetChannel, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const channel = interaction.options.getChannel("canal");
    const response = await setChannel(channel, data.settings);
    return interaction.followUp(response);
  },
};

async function setChannel(targetChannel, settings) {
  if (!targetChannel && !settings.modlog_channel) {
    return "Ya está deshabilitado";
  }

  if (targetChannel && !targetChannel.canSendEmbeds()) {
    return "¡Ugh! ¿No puedo enviar registros a ese canal? Necesito los permisos de `Escribir Mensajes` y `Insertar Enlaces` en ese canal";
  }

  settings.modlog_channel = targetChannel?.id;
  await settings.save();
  return `¡Configuración guardada! Canal de registros de moderación ${targetChannel ? "actualizado" : "eliminado"}`;
}
