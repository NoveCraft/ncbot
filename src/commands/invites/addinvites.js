const { getEffectiveInvites, checkInviteRewards } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "agregarinvitaciones",
  description: "agregar invitaciones a un miembro",
  category: "INVITE",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<@miembro|id> <invitaciones>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "usuario",
        description: "el usuario al que dar invitaciones",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "invitaciones",
        description: "el número de invitaciones a dar",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    const amount = parseInt(args[1]);

    if (!target) return message.safeReply("Sintaxis incorrecta. Debes mencionar un objetivo");
    if (isNaN(amount)) return message.safeReply("La cantidad de invitaciones debe ser un número");

    const response = await agregarInvitaciones(message, target.user, parseInt(amount));
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("invitaciones");
    const response = await agregarInvitaciones(interaction, usuario, cantidad);
    await interaction.followUp(response);
  },
};

async function agregarInvitaciones({ guild }, usuario, cantidad) {
  if (usuario.bot) return "¡Ups! No puedes agregar invitaciones a bots";

  const miembroDb = await getMember(guild.id, usuario.id);
  miembroDb.invite_data.added += cantidad;
  await miembroDb.save();

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Invitaciones agregadas a ${usuario.username}` })
    .setThumbnail(usuario.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`${usuario.username} ahora tiene ${getEffectiveInvites(miembroDb.invite_data)} invitaciones`);

  checkInviteRewards(guild, miembroDb, true);
  return { embeds: [embed] };
}
