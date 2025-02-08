const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} miembro
 */
module.exports = (miembro) => {
  let color = miembro.displayHexColor;
  if (color === "#000000") color = EMBED_COLORS.BOT_EMBED;

  let rolesString = miembro.roles.cache.map((r) => r.name).join(", ");
  if (rolesString.length > 1024) rolesString = rolesString.substring(0, 1020) + "...";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Información del usuario para ${miembro.displayName}`,
      iconURL: miembro.user.displayAvatarURL(),
    })
    .setThumbnail(miembro.user.displayAvatarURL())
    .setColor(color)
    .addFields(
      {
        name: "Nombre de usuario",
        value: miembro.user.username,
        inline: true,
      },
      {
        name: "ID",
        value: miembro.id,
        inline: true,
      },
      {
        name: "Se unió al servidor",
        value: miembro.joinedAt.toUTCString(),
      },
      {
        name: "Registrado en Discord",
        value: miembro.user.createdAt.toUTCString(),
      },
      {
        name: `Roles [${miembro.roles.cache.size}]`,
        value: rolesString,
      },
      {
        name: "URL del avatar",
        value: miembro.user.displayAvatarURL({ extension: "png" }),
      }
    )
    .setFooter({ text: `Solicitado por ${miembro.user.tag}` })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
