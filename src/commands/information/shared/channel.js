const { EmbedBuilder, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { stripIndent } = require("common-tags");
const channelTypes = require("@helpers/channelTypes");

/**
 * @param {import('discord.js').GuildChannel} canal
 */
module.exports = (canal) => {
  const { id, name, parent, position, type } = canal;

  let desc = stripIndent`
      ❯ ID: **${id}**
      ❯ Nombre: **${name}**
      ❯ Tipo: **${channelTypes(canal.type)}**
      ❯ Categoría: **${parent || "NA"}**\n
      `;

  if (type === ChannelType.GuildText) {
    const { rateLimitPerUser, nsfw } = canal;
    desc += stripIndent`
      ❯ Tema: **${canal.topic || "No hay tema establecido"}**
      ❯ Posición: **${position}**
      ❯ Modo lento: **${rateLimitPerUser}**
      ❯ esNSFW: **${nsfw ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildPublicThread || type === ChannelType.GuildPrivateThread) {
    const { ownerId, archived, locked } = canal;
    desc += stripIndent`
      ❯ ID del Propietario: **${ownerId}**
      ❯ Está Archivado: **${archived ? "✓" : "✕"}**
      ❯ Está Bloqueado: **${locked ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildNews || type === ChannelType.GuildNewsThread) {
    const { nsfw } = canal;
    desc += stripIndent`
      ❯ esNSFW: **${nsfw ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice) {
    const { bitrate, userLimit, full } = canal;
    desc += stripIndent`
      ❯ Posición: **${position}**
      ❯ Tasa de bits: **${bitrate}**
      ❯ Límite de Usuarios: **${userLimit}**
      ❯ estáLleno: **${full ? "✓" : "✕"}**\n
      `;
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Detalles del Canal" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc);

  return { embeds: [embed] };
};
