const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "invitaciones",
  description: "muestra el número de invitaciones en este servidor",
  category: "INVITACIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[@miembro|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "usuario",
        description: "el usuario para obtener las invitaciones",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await obtenerInvitaciones(message, target.user, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("usuario") || interaction.user;
    const response = await obtenerInvitaciones(interaction, user, data.settings);
    await interaction.followUp(response);
  },
};

async function obtenerInvitaciones({ guild }, user, settings) {
  if (!settings.invite.tracking) return `El seguimiento de invitaciones está deshabilitado en este servidor`;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Invitaciones de ${user.username}` })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(user.displayAvatarURL())
    .setDescription(`${user.toString()} tiene ${getEffectiveInvites(inviteData)} invitaciones`)
    .addFields(
      {
        name: "Invitaciones Totales",
        value: `**${inviteData?.tracked + inviteData?.added || 0}**`,
        inline: true,
      },
      {
        name: "Invitaciones Falsas",
        value: `**${inviteData?.fake || 0}**`,
        inline: true,
      },
      {
        name: "Invitaciones Perdidas",
        value: `**${inviteData?.left || 0}**`,
        inline: true,
      }
    );

  return { embeds: [embed] };
}
