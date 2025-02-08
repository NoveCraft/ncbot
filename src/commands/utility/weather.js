const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

const API_KEY = process.env.WEATHERSTACK_KEY;

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "clima",
  description: "obtener información del clima",
  cooldown: 5,
  category: "UTILIDAD",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<lugar>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "lugar",
        description: "nombre del país/ciudad para obtener información del clima",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const lugar = args.join(" ");
    const response = await weather(lugar);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const lugar = interaction.options.getString("lugar");
    const response = await weather(lugar);
    await interaction.followUp(response);
  },
};

async function weather(lugar) {
  const response = await getJson(`http://api.weatherstack.com/current?access_key=${API_KEY}&query=${lugar}`);
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  if (!json.request) return `No se encontró ninguna ciudad que coincida con \`${lugar}\``;

  const embed = new EmbedBuilder()
    .setTitle("Clima")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.current?.weather_icons[0])
    .addFields(
      { name: "Ciudad", value: json.location?.name || "NA", inline: true },
      { name: "Región", value: json.location?.region || "NA", inline: true },
      { name: "País", value: json.location?.country || "NA", inline: true },
      { name: "Condición climática", value: json.current?.weather_descriptions[0] || "NA", inline: true },
      { name: "Fecha", value: json.location?.localtime.slice(0, 10) || "NA", inline: true },
      { name: "Hora", value: json.location?.localtime.slice(11, 16) || "NA", inline: true },
      { name: "Temperatura", value: `${json.current?.temperature}°C`, inline: true },
      { name: "Cobertura de nubes", value: `${json.current?.cloudcover}%`, inline: true },
      { name: "Velocidad del viento", value: `${json.current?.wind_speed} km/h`, inline: true },
      { name: "Dirección del viento", value: json.current?.wind_dir || "NA", inline: true },
      { name: "Presión", value: `${json.current?.pressure} mb`, inline: true },
      { name: "Precipitación", value: `${json.current?.precip.toString()} mm`, inline: true },
      { name: "Humedad", value: json.current?.humidity.toString() || "NA", inline: true },
      { name: "Distancia visual", value: `${json.current?.visibility} km`, inline: true },
      { name: "Índice UV", value: json.current?.uv_index.toString() || "NA", inline: true }
    )
    .setFooter({ text: `Última revisión a las ${json.current?.observation_time} GMT` });

  return { embeds: [embed] };
}
