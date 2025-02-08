const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "codigosdeinvitacion",
  description: "lista todos tus códigos de invitación en este servidor",
  category: "INVITACIÓN",
  botPermissions: ["EmbedLinks", "ManageGuild"],
  command: {
    enabled: true,
    usage: "[@miembro|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "usuario",
        description: "el usuario para obtener los códigos de invitación",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await obtenerCodigosDeInvitacion(message, target.user);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const usuario = interaction.options.getUser("usuario") || interaction.user;
    const response = await obtenerCodigosDeInvitacion(interaction, usuario);
    await interaction.followUp(response);
  },
};

async function obtenerCodigosDeInvitacion({ guild }, usuario) {
  const invitaciones = await guild.invites.fetch({ cache: false });
  const invitacionesRequeridas = invitaciones.filter((inv) => inv.inviter.id === usuario.id);
  if (invitacionesRequeridas.size === 0) return `\`${usuario.username}\` no tiene invitaciones en este servidor`;

  let str = "";
  invitacionesRequeridas.forEach((inv) => {
    str += `❯ [${inv.code}](${inv.url}) : ${inv.uses} usos\n`;
  });

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Código de invitación para ${usuario.username}` })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(str);

  return { embeds: [embed] };
}
