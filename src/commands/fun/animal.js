const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

const animales = ["gato", "perro", "panda", "zorro", "panda_rojo", "koala", "pájaro", "mapache", "canguro"];
const BASE_URL = "https://some-random-api.com/animal";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "animal",
  description: "muestra una imagen aleatoria de un animal",
  cooldown: 5,
  category: "DIVERSIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<tipo>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "nombre",
        description: "tipo de animal",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: animales.map((animal) => ({ name: animal, value: animal })),
      },
    ],
  },

  async messageRun(message, args) {
    const eleccion = args[0];
    if (!animales.includes(eleccion)) {
      return message.safeReply(`Animal seleccionado no válido. Animales disponibles:\n${animales.join(", ")}`);
    }
    const respuesta = await obtenerAnimal(message.author, eleccion);
    return message.safeReply(respuesta);
  },

  async interactionRun(interaction) {
    const eleccion = interaction.options.getString("nombre");
    const respuesta = await obtenerAnimal(interaction.user, eleccion);
    await interaction.followUp(respuesta);
  },
};

async function obtenerAnimal(usuario, eleccion) {
  const respuesta = await getJson(`${BASE_URL}/${eleccion}`);
  if (!respuesta.success) return MESSAGES.API_ERROR;

  const urlImagen = respuesta.data?.image;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setImage(urlImagen)
    .setFooter({ text: `Solicitado por ${usuario.tag}` });

  return { embeds: [embed] };
}
