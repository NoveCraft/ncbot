const informacionEmoji = require("../shared/emoji");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  nombre: "informacionemoji",
  descripcion: "muestra información sobre un emoji",
  categoria: "INFORMACION",
  permisosBot: ["EmbedLinks"],
  comando: {
    habilitado: true,
    uso: "<emoji>",
    conteoMinArgs: 1,
  },

  async ejecutarMensaje(mensaje, args) {
    const emoji = args[0];
    const respuesta = informacionEmoji(emoji);
    await mensaje.safeReply(respuesta);
  },
};
