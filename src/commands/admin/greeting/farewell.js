const { isHex } = require("@helpers/Utils");
const { buildGreeting } = require("@handlers/greeting");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "despedida",
  description: "configurar mensaje de despedida",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "estado <on|off>",
        description: "habilitar o deshabilitar mensaje de despedida",
      },
      {
        trigger: "canal <#channel>",
        description: "configurar mensaje de despedida",
      },
      {
        trigger: "vista-previa",
        description: "vista previa del mensaje de despedida configurado",
      },
      {
        trigger: "desc <texto>",
        description: "establecer descripción del embed",
      },
      {
        trigger: "miniatura <ON|OFF>",
        description: "habilitar/deshabilitar miniatura del embed",
      },
      {
        trigger: "color <hexcolor>",
        description: "establecer color del embed",
      },
      {
        trigger: "pie <texto>",
        description: "establecer contenido del pie del embed",
      },
      {
        trigger: "imagen <url>",
        description: "establecer imagen del embed",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "estado",
        description: "habilitar o deshabilitar mensaje de despedida",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "estado",
            description: "habilitado o deshabilitado",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "vista-previa",
        description: "vista previa del mensaje de despedida configurado",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "canal",
        description: "establecer canal de despedida",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "canal",
            description: "nombre del canal",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "desc",
        description: "establecer descripción del embed",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "contenido",
            description: "contenido de la descripción",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "miniatura",
        description: "configurar miniatura del embed",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "estado",
            description: "estado de la miniatura",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "color",
        description: "establecer color del embed",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "codigo-hex",
            description: "código de color hex",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "pie",
        description: "establecer pie del embed",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "contenido",
            description: "contenido del pie",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "imagen",
        description: "establecer imagen del embed",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "url",
            description: "url de la imagen",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;

    // vista-previa
    if (type === "vista-previa") {
      response = await sendPreview(settings, message.member);
    }

    // estado
    else if (type === "estado") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Estado inválido. El valor debe ser `on/off`");
      response = await setStatus(settings, status);
    }

    // canal
    else if (type === "canal") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    else if (type === "desc") {
      if (args.length < 2) return message.safeReply("¡Argumentos insuficientes! Por favor proporciona contenido válido");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // miniatura
    else if (type === "miniatura") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Estado inválido. El valor debe ser `on/off`");
      response = await setThumbnail(settings, status);
    }

    // color
    else if (type === "color") {
      const color = args[1];
      if (!color || !isHex(color)) return message.safeReply("Color inválido. El valor debe ser un color hex válido");
      response = await setColor(settings, color);
    }

    // pie
    else if (type === "pie") {
      if (args.length < 2) return message.safeReply("¡Argumentos insuficientes! Por favor proporciona contenido válido");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    // imagen
    else if (type === "imagen") {
      const url = args[1];
      if (!url) return message.safeReply("URL de imagen inválida. Por favor proporciona una URL válida");
      response = await setImage(settings, url);
    }

    //
    else response = "¡Uso de comando inválido!";
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    switch (sub) {
      case "vista-previa":
        response = await sendPreview(settings, interaction.member);
        break;

      case "estado":
        response = await setStatus(settings, interaction.options.getString("estado"));
        break;

      case "canal":
        response = await setChannel(settings, interaction.options.getChannel("canal"));
        break;

      case "desc":
        response = await setDescription(settings, interaction.options.getString("contenido"));
        break;

      case "miniatura":
        response = await setThumbnail(settings, interaction.options.getString("estado"));
        break;

      case "color":
        response = await setColor(settings, interaction.options.getString("codigo-hex"));
        break;

      case "pie":
        response = await setFooter(settings, interaction.options.getString("contenido"));
        break;

      case "imagen":
        response = await setImage(settings, interaction.options.getString("url"));
        break;

      default:
        response = "Subcomando inválido";
    }

    return interaction.followUp(response);
  },
};

async function sendPreview(settings, member) {
  if (!settings.farewell?.enabled) return "Mensaje de despedida no habilitado en este servidor";

  const targetChannel = member.guild.channels.cache.get(settings.farewell.channel);
  if (!targetChannel) return "No hay un canal configurado para enviar el mensaje de despedida";

  const response = await buildGreeting(member, "FAREWELL", settings.farewell);
  await targetChannel.safeSend(response);

  return `Vista previa de despedida enviada a ${targetChannel.toString()}`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.farewell.enabled = enabled;
  await settings.save();
  return `¡Configuración guardada! Mensaje de despedida ${status ? "habilitado" : "deshabilitado"}`;
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return (
      "¡Uf! ¿No puedo enviar saludos a ese canal? Necesito los permisos de `Escribir mensajes` y `Enlaces incrustados` en " +
      channel.toString()
    );
  }
  settings.farewell.channel = channel.id;
  await settings.save();
  return `¡Configuración guardada! El mensaje de despedida se enviará a ${channel ? channel.toString() : "No encontrado"}`;
}

async function setDescription(settings, desc) {
  settings.farewell.embed.description = desc;
  await settings.save();
  return "¡Configuración guardada! Mensaje de despedida actualizado";
}

async function setThumbnail(settings, status) {
  settings.farewell.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return "¡Configuración guardada! Mensaje de despedida actualizado";
}

async function setColor(settings, color) {
  settings.farewell.embed.color = color;
  await settings.save();
  return "¡Configuración guardada! Mensaje de despedida actualizado";
}

async function setFooter(settings, content) {
  settings.farewell.embed.footer = content;
  await settings.save();
  return "¡Configuración guardada! Mensaje de despedida actualizado";
}

async function setImage(settings, url) {
  settings.farewell.embed.image = url;
  await settings.save();
  return "¡Configuración guardada! Mensaje de despedida actualizado";
}
