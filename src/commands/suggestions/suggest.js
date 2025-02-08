const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { SUGGESTIONS } = require("@root/config");
const { addSuggestion } = require("@schemas/Suggestions");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "suggest",
  description: "enviar una sugerencia",
  category: "SUGERENCIA",
  cooldown: 20,
  command: {
    enabled: true,
    usage: "<sugerencia>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "sugerencia",
        description: "la sugerencia",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const suggestion = args.join(" ");
    const response = await suggest(message.member, suggestion, data.settings);
    if (typeof response === "boolean") return message.channel.safeSend("¡Tu sugerencia ha sido enviada!", 5);
    else await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const suggestion = interaction.options.getString("sugerencia");
    const response = await suggest(interaction.member, suggestion, data.settings);
    if (typeof response === "boolean") interaction.followUp("¡Tu sugerencia ha sido enviada!");
    else await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} suggestion
 * @param {object} settings
 */
async function suggest(member, suggestion, settings) {
  if (!settings.suggestions.enabled) return "El sistema de sugerencias está deshabilitado.";
  if (!settings.suggestions.channel_id) return "¡Canal de sugerencias no configurado!";
  const channel = member.guild.channels.cache.get(settings.suggestions.channel_id);
  if (!channel) return "¡Canal de sugerencias no encontrado!";

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Nueva Sugerencia" })
    .setThumbnail(member.user.avatarURL())
    .setColor(SUGGESTIONS.DEFAULT_EMBED)
    .setDescription(
      stripIndent`
        ${suggestion}

        **Remitente** 
        ${member.user.username} [${member.id}]
      `
    )
    .setTimestamp();

  let buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("SUGGEST_APPROVE").setLabel("Aprobar").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("SUGGEST_REJECT").setLabel("Rechazar").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("SUGGEST_DELETE").setLabel("Eliminar").setStyle(ButtonStyle.Secondary)
  );

  try {
    const sentMsg = await channel.send({
      embeds: [embed],
      components: [buttonsRow],
    });

    await sentMsg.react(SUGGESTIONS.EMOJI.UP_VOTE);
    await sentMsg.react(SUGGESTIONS.EMOJI.DOWN_VOTE);

    await addSuggestion(sentMsg, member.id, suggestion);

    return true;
  } catch (ex) {
    member.client.logger.error("suggest", ex);
    return "¡No se pudo enviar el mensaje al canal de sugerencias!";
  }
}
