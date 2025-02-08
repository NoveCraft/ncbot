const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getJson } = require("@helpers/HttpUtils");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");
const neko = new NekosLife();

const opciones = ["abrazo", "beso", "acurrucar", "alimentar", "acariciar", "empujar", "bofetada", "presumir", "hacer cosquillas", "guiñar"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  nombre: "reaccionar",
  descripcion: "reacciones de anime",
  habilitado: true,
  categoria: "ANIME",
  cooldown: 5,
  comando: {
    habilitado: true,
    minArgsCount: 1,
    uso: "[reacción]",
  },
  comandoSlash: {
    habilitado: true,
    opciones: [
      {
        nombre: "categoria",
        descripcion: "tipo de reacción",
        tipo: ApplicationCommandOptionType.String,
        requerido: true,
        opciones: opciones.map((op) => ({ nombre: op, valor: op })),
      },
    ],
  },

  async mensajeEjecutar(mensaje, args) {
    const categoria = args[0].toLowerCase();
    if (!opciones.includes(categoria)) {
      return mensaje.safeReply(`Elección inválida: \`${categoria}\`.\nReacciones disponibles: ${opciones.join(", ")}`);
    }

    const embed = await genReaccion(categoria, mensaje.author);
    await mensaje.safeReply({ embeds: [embed] });
  },

  async interaccionEjecutar(interaccion) {
    const eleccion = interaccion.options.getString("categoria");
    const embed = await genReaccion(eleccion, interaccion.user);
    await interaccion.followUp({ embeds: [embed] });
  },
};

const genReaccion = async (categoria, usuario) => {
  try {
    let urlImagen;

    // some-random api
    if (categoria === "guiñar") {
      const respuesta = await getJson("https://some-random-api.com/animu/wink");
      if (!respuesta.success) throw new Error("Error de API");
      urlImagen = respuesta.data.link;
    }

    // neko api
    else {
      urlImagen = (await neko[categoria]()).url;
    }

    return new EmbedBuilder()
      .setImage(urlImagen)
      .setColor("Random")
      .setFooter({ text: `Solicitado por ${usuario.tag}` });
  } catch (ex) {
    return new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("No se pudo obtener el meme. ¡Inténtalo de nuevo!")
      .setFooter({ text: `Solicitado por ${usuario.tag}` });
  }
};
