const { getEffectiveInvites } = require("@handlers/invite");
const { EMBED_COLORS } = require("@root/config.js");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { stripIndent } = require("common-tags");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "invitador",
  description: "muestra información del invitador",
  category: "INVITE",
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
        description: "el usuario para obtener la información del invitador",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getInvitador(message, target.user, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("usuario") || interaction.user;
    const response = await getInvitador(interaction, user, data.settings);
    await interaction.followUp(response);
  },
};

async function getInvitador({ guild }, user, settings) {
  if (!settings.invite.tracking) return `El seguimiento de invitaciones está deshabilitado en este servidor`;

  const inviteData = (await getMember(guild.id, user.id)).invite_data;
  if (!inviteData || !inviteData.inviter) return `No se puede rastrear cómo se unió \`${user.username}\``;

  const invitador = await guild.client.users.fetch(inviteData.inviter, false, true);
  const invitadorData = (await getMember(guild.id, inviteData.inviter)).invite_data;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `Datos de invitación para ${user.username}` })
    .setDescription(
      stripIndent`
      Invitador: \`${invitador?.username || "Usuario Eliminado"}\`
      ID del Invitador: \`${inviteData.inviter}\`
      Código de Invitación: \`${inviteData.code}\`
      Invitaciones del Invitador: \`${getEffectiveInvites(invitadorData)}\`
      `
    );

  return { embeds: [embed] };
}
