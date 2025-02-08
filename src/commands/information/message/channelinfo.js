const informacionCanal = require("../shared/channel");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  nombre: "informacioncanal",
  descripcion: "muestra información sobre un canal",
  categoria: "INFORMACION",
  permisosBot: ["EmbedLinks"],
  comando: {
    habilitado: true,
    uso: "[#canal|id]",
    alias: ["infocanal"],
  },

  async ejecutarMensaje(mensaje, args) {
    let canalObjetivo;

    if (mensaje.mentions.channels.size > 0) {
      canalObjetivo = mensaje.mentions.channels.first();
    }

    // buscar canal por nombre/ID
    else if (args.length > 0) {
      const busqueda = args.join(" ");
      const canalPorNombre = mensaje.guild.findMatchingChannels(busqueda);
      if (canalPorNombre.length === 0) return mensaje.safeReply(`¡No se encontraron canales que coincidan con \`${busqueda}\`!`);
      if (canalPorNombre.length > 1) return mensaje.safeReply(`¡Se encontraron múltiples canales que coinciden con \`${busqueda}\`!`);
      [canalObjetivo] = canalPorNombre;
    } else {
      canalObjetivo = mensaje.channel;
    }

    const respuesta = informacionCanal(canalObjetivo);
    await mensaje.safeReply(respuesta);
  },
};
