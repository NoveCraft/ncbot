const { addReactionRole, getReactionRoles } = require("@schemas/ReactionRoles");
const { parseEmoji, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addrr",
  description: "configurar rol de reacción para el mensaje especificado",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#canal> <messageId> <emote> <rol>",
    minArgsCount: 4,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "canal donde existe el mensaje",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: "message_id",
        description: "ID del mensaje al que se deben configurar los roles de reacción",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "emoji",
        description: "emoji a usar",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "role",
        description: "rol a ser asignado para el emoji seleccionado",
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(`No se encontraron canales que coincidan con ${args[0]}`);

    const targetMessage = args[1];

    const role = message.guild.findMatchingRoles(args[3])[0];
    if (!role) return message.safeReply(`No se encontraron roles que coincidan con ${args[3]}`);

    const reaction = args[2];

    const response = await addRR(message.guild, targetChannel[0], targetMessage, reaction, role);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message_id");
    const reaction = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");

    const response = await addRR(interaction.guild, targetChannel, messageId, reaction, role);
    await interaction.followUp(response);
  },
};

async function addRR(guild, channel, messageId, reaction, role) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `Necesitas los siguientes permisos en ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
  } catch (ex) {
    return "No se pudo obtener el mensaje. ¿Proporcionaste un ID de mensaje válido?";
  }

  if (role.managed) {
    return "No puedo asignar roles de bots.";
  }

  if (guild.roles.everyone.id === role.id) {
    return "No puedes asignar el rol de everyone.";
  }

  if (guild.members.me.roles.highest.position < role.position) {
    return "¡Ups! No puedo agregar/quitar miembros a ese rol. ¿Ese rol es más alto que el mío?";
  }

  const custom = parseEmoji(reaction);
  if (custom.id && !guild.emojis.cache.has(custom.id)) return "Este emoji no pertenece a este servidor";
  const emoji = custom.id ? custom.id : custom.name;

  try {
    await targetMessage.react(emoji);
  } catch (ex) {
    return `¡Ups! Falló al reaccionar. ¿Es este un emoji válido: ${reaction}?`;
  }

  let reply = "";
  const previousRoles = getReactionRoles(guild.id, channel.id, targetMessage.id);
  if (previousRoles.length > 0) {
    const found = previousRoles.find((rr) => rr.emote === emoji);
    if (found) reply = "Ya hay un rol configurado para este emoji. Sobrescribiendo datos,\n";
  }

  await addReactionRole(guild.id, channel.id, targetMessage.id, emoji, role.id);
  return (reply += "¡Hecho! Configuración guardada");
}
