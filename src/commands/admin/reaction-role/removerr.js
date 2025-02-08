const { removeReactionRole } = require("@schemas/ReactionRoles");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "removerr",
  description: "eliminar la reacción configurada para el mensaje especificado",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#canal> <idMensaje>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "canal",
        description: "canal donde existe el mensaje",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: "id_mensaje",
        description: "id del mensaje para el cual se configuraron roles de reacción",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(`No se encontraron canales que coincidan con ${args[0]}`);

    const targetMessage = args[1];
    const response = await removeRR(message.guild, targetChannel[0], targetMessage);

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("canal");
    const messageId = interaction.options.getString("id_mensaje");

    const response = await removeRR(interaction.guild, targetChannel, messageId);
    await interaction.followUp(response);
  },
};

async function removeRR(guild, channel, messageId) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `Necesitas los siguientes permisos en ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
  } catch (ex) {
    return "No se pudo obtener el mensaje. ¿Proporcionaste un id de mensaje válido?";
  }

  try {
    await removeReactionRole(guild.id, channel.id, targetMessage.id);
    await targetMessage.reactions?.removeAll();
  } catch (ex) {
    return "¡Ups! Ocurrió un error inesperado. Inténtalo de nuevo más tarde";
  }

  return "¡Listo! Configuración actualizada";
}
