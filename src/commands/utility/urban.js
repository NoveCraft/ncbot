const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const moment = require("moment");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "urbano",
  description: "busca en el diccionario urbano",
  cooldown: 5,
  category: "UTILIDAD",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<palabra>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "palabra",
        description: "la palabra para la que quieres el significado urbano",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const palabra = args.join(" ");
    const response = await urban(palabra);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const palabra = interaction.options.getString("palabra");
    const response = await urban(palabra);
    await interaction.followUp(response);
  },
};

async function urban(palabra) {
  const response = await getJson(`http://api.urbandictionary.com/v0/define?term=${palabra}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  if (!json.list[0]) return `No se encontró nada que coincida con \`${palabra}\``;

  const data = json.list[0];
  const embed = new EmbedBuilder()
    .setTitle(data.word)
    .setURL(data.permalink)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(`**Definición**\`\`\`css\n${data.definition}\`\`\``)
    .addFields(
      {
        name: "Autor",
        value: data.author,
        inline: true,
      },
      {
        name: "ID",
        value: data.defid.toString(),
        inline: true,
      },
      {
        name: "Me gusta / No me gusta",
        value: `👍 ${data.thumbs_up} | 👎 ${data.thumbs_down}`,
        inline: true,
      },
      {
        name: "Ejemplo",
        value: data.example,
        inline: false,
      }
    )
    .setFooter({ text: `Creado ${moment(data.written_on).fromNow()}` });

  return { embeds: [embed] };
}
