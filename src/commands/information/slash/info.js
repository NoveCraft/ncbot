const usuario = require("../shared/user");
const informacionCanal = require("../shared/channel");
const informacionServidor = require("../shared/guild");
const avatar = require("../shared/avatar");
const informacionEmoji = require("../shared/emoji");
const informacionBot = require("../shared/botstats");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  nombre: "info",
  descripcion: "muestra varias informaciones",
  categoria: "INFORMACION",
  permisosBot: ["EmbedLinks"],
  comando: {
    habilitado: false,
  },
  comandoSlash: {
    habilitado: true,
    opciones: [
      {
        nombre: "usuario",
        descripcion: "obtener información del usuario",
        tipo: ApplicationCommandOptionType.Subcommand,
        opciones: [
          {
            nombre: "nombre",
            descripcion: "nombre del usuario",
            tipo: ApplicationCommandOptionType.User,
            requerido: false,
          },
        ],
      },
      {
        nombre: "canal",
        descripcion: "obtener información del canal",
        tipo: ApplicationCommandOptionType.Subcommand,
        opciones: [
          {
            nombre: "nombre",
            descripcion: "nombre del canal",
            tipo: ApplicationCommandOptionType.Channel,
            requerido: false,
          },
        ],
      },
      {
        nombre: "servidor",
        descripcion: "obtener información del servidor",
        tipo: ApplicationCommandOptionType.Subcommand,
      },
      {
        nombre: "bot",
        descripcion: "obtener información del bot",
        tipo: ApplicationCommandOptionType.Subcommand,
      },
      {
        nombre: "avatar",
        descripcion: "muestra información del avatar",
        tipo: ApplicationCommandOptionType.Subcommand,
        opciones: [
          {
            nombre: "nombre",
            descripcion: "nombre del usuario",
            tipo: ApplicationCommandOptionType.User,
            requerido: false,
          },
        ],
      },
      {
        nombre: "emoji",
        descripcion: "muestra información del emoji",
        tipo: ApplicationCommandOptionType.Subcommand,
        opciones: [
          {
            nombre: "nombre",
            descripcion: "nombre del emoji",
            tipo: ApplicationCommandOptionType.String,
            requerido: true,
          },
        ],
      },
    ],
  },

  async ejecutarInteraccion(interaccion) {
    const sub = interaccion.options.getSubcommand();
    if (!sub) return interaccion.followUp("No es un subcomando válido");
    let respuesta;

    // usuario
    if (sub === "usuario") {
      let usuarioObjetivo = interaccion.options.getUser("nombre") || interaccion.user;
      let objetivo = await interaccion.guild.members.fetch(usuarioObjetivo);
      respuesta = usuario(objetivo);
    }

    // canal
    else if (sub === "canal") {
      let canalObjetivo = interaccion.options.getChannel("nombre") || interaccion.channel;
      respuesta = informacionCanal(canalObjetivo);
    }

    // servidor
    else if (sub === "servidor") {
      respuesta = await informacionServidor(interaccion.guild);
    }

    // bot
    else if (sub === "bot") {
      respuesta = informacionBot(interaccion.client);
    }

    // avatar
    else if (sub === "avatar") {
      let objetivo = interaccion.options.getUser("nombre") || interaccion.user;
      respuesta = avatar(objetivo);
    }

    // emoji
    else if (sub === "emoji") {
      let emoji = interaccion.options.getString("nombre");
      respuesta = informacionEmoji(emoji);
    }

    // retorno
    else {
      respuesta = "Subcomando incorrecto";
    }

    await interaccion.followUp(respuesta);
  },
};
