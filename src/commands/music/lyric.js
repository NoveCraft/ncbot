const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getJson } = require("@helpers/HttpUtils");
const { MESSAGES, EMBED_COLORS } = require("@root/config");

const BASE_URL = "https://some-random-api.com/lyrics";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "letra",
  description: "buscar la letra de la canción",
  category: "MÚSICA",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<Song Title - singer>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "buscar la letra de la canción",
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args.join(" ");
    if (!choice) {
      return message.safeReply("Letra seleccionada inválida.");
    }
    const response = await getLyric(message.author, choice);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("query");
    const response = await getLyric(interaction.user, choice);
    await interaction.followUp(response);
  },
};

async function getLyric(user, choice) {
  const lyric = await getJson(`${BASE_URL}?title=${choice}`);
  if (!lyric.success) return MESSAGES.API_ERROR;

  const thumbnail = lyric.data?.thumbnail.genius;
  const author = lyric.data?.author;
  const lyrics = lyric.data?.lyrics;
  const title = lyric.data?.title;

  const embed = new EmbedBuilder();
  embed
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`${author} - ${title}`)
    .setThumbnail(thumbnail)
    .setDescription(lyrics)
    .setFooter({ text: `Solicitado por: ${user.username}` });

  return { embeds: [embed] };
}
