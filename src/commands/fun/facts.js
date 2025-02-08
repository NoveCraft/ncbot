const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");

const animales = ["gato", "perro", "panda", "zorro", "panda_rojo", "koala", "pájaro", "mapache", "canguro"];
const BASE_URL = "https://some-random-api.com/animal";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  nombre: "hechos",
  descripción: "muestra hechos aleatorios de animales",
  enfriamiento: 5,
  categoría: "DIVERSIÓN",
  permisosBot: ["EmbedLinks"],
  comando: {
    habilitado: true,
    uso: "<animal>",
    alias: ["hecho"],
    minArgsCount: 1,
  },
  comandoSlash: {
    habilitado: true,
    opciones: [
      {
        nombre: "nombre",
        descripción: "tipo de animal",
        tipo: ApplicationCommandOptionType.String,
        requerido: true,
        opciones: animales.map((animal) => ({ nombre: animal, valor: animal })),
      },
    ],
  },

  async mensajeEjecutar(mensaje, args) {
    const elección = args[0];
    if (!animales.includes(elección)) {
      return mensaje.safeReply(`Animal seleccionado no válido. Animales disponibles:\n${animales.join(", ")}`);
    }
    const respuesta = await obtenerHecho(mensaje.author, elección);
    return mensaje.safeReply(respuesta);
  },

  async interacciónEjecutar(interacción) {
    const elección = interacción.options.getString("nombre");
    const respuesta = await obtenerHecho(interacción.user, elección);
    await interacción.followUp(respuesta);
  },
};

async function obtenerHecho(usuario, elección) {
  const respuesta = await getJson(`${BASE_URL}/${elección}`);
  if (!respuesta.success) return MESSAGES.API_ERROR;

  const hecho = respuesta.data?.fact;
  const urlImagen = respuesta.data?.image;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setThumbnail(urlImagen)
    .setDescription(hecho)
    .setFooter({ text: `Solicitado por ${usuario.tag}` });

  return { embeds: [embed] };
}
