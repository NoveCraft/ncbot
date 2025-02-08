const { isHex } = require("@helpers/Utils");
const { buildGreeting } = require("@handlers/greeting");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "welcome",
  description: "configurar mensaje de bienvenida",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "habilitar o deshabilitar mensaje de bienvenida",
      },
      {
        trigger: "channel <#channel>",
        description: "configurar canal de bienvenida",
      },
      {
        trigger: "preview",
        description: "previsualizar el mensaje de bienvenida configurado",
      },
      {
        trigger: "desc <text>",
        description: "establecer descripción del embed",
      },
      {
        trigger: "thumbnail <ON|OFF>",
        description: "habilitar/deshabilitar miniatura del embed",
      },
      {
        trigger: "color <hexcolor>",
        description: "establecer color del embed",
      },
      {
        trigger: "footer <text>",
        description: "establecer contenido del pie de página del embed",
      },
      {
        trigger: "image <url>",
        description: "establecer imagen del embed",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "habilitar o deshabilitar mensaje de bienvenida",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
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
        name: "preview",
        description: "previsualizar el mensaje de bienvenida configurado",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "channel",
        description: "establecer canal de bienvenida",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
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
            name: "content",
            description: "contenido de la descripción",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "thumbnail",
        description: "configurar miniatura del embed",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
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
            name: "hex-code",
            description: "código de color hex",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "footer",
        description: "establecer pie de página del embed",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "contenido del pie de página",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "image",
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

    // preview
    if (type === "preview") {
      response = await sendPreview(settings, message.member);
    }

    // status
    else if (type === "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Estado inválido. El valor debe ser `on/off`");
      response = await setStatus(settings, status);
    }

    // channel
    else if (type === "channel") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    else if (type === "desc") {
      if (args.length < 2) return message.safeReply("¡Argumentos insuficientes! Por favor proporciona contenido válido");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // thumbnail
    else if (type === "thumbnail") {
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

    // footer
    else if (type === "footer") {
      if (args.length < 2) return message.safeReply("¡Argumentos insuficientes! Por favor proporciona contenido válido");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    // image
    else if (type === "image") {
      const url = args[1];
      if (!url) return message.safeReply("URL de imagen inválida. Por favor proporciona una URL válida");
      response = await setImage(settings, url);
    }

    //
    else response = "¡Uso del comando inválido!";
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    switch (sub) {
      case "preview":
        response = await sendPreview(settings, interaction.member);
        break;

      case "status":
        response = await setStatus(settings, interaction.options.getString("status"));
        break;

      case "channel":
        response = await setChannel(settings, interaction.options.getChannel("channel"));
        break;

      case "desc":
        response = await setDescription(settings, interaction.options.getString("content"));
        break;

      case "thumbnail":
        response = await setThumbnail(settings, interaction.options.getString("status"));
        break;

      case "color":
        response = await setColor(settings, interaction.options.getString("hex-code"));
        break;

      case "footer":
        response = await setFooter(settings, interaction.options.getString("content"));
        break;

      case "image":
        response = await setImage(settings, interaction.options.getString("url"));
        break;

      default:
        response = "Subcomando inválido";
    }

    return interaction.followUp(response);
  },
};

async function sendPreview(settings, member) {
  if (!settings.welcome?.enabled) return "Mensaje de bienvenida no habilitado en este servidor";

  const targetChannel = member.guild.channels.cache.get(settings.welcome.channel);
  if (!targetChannel) return "No hay un canal configurado para enviar el mensaje de bienvenida";

  const response = await buildGreeting(member, "WELCOME", settings.welcome);
  await targetChannel.safeSend(response);

  return `Se envió la previsualización de bienvenida a ${targetChannel.toString()}`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.welcome.enabled = enabled;
  await settings.save();
  return `¡Configuración guardada! Mensaje de bienvenida ${enabled ? "habilitado" : "deshabilitado"}`;
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return (
      "¡Uf! ¿No puedo enviar saludos a ese canal? Necesito los permisos de `Escribir mensajes` y `Enlaces incrustados` en " +
      channel.toString()
    );
  }
  settings.welcome.channel = channel.id;
  await settings.save();
  return `¡Configuración guardada! El mensaje de bienvenida se enviará a ${channel ? channel.toString() : "No encontrado"}`;
}

async function setDescription(settings, desc) {
  settings.welcome.embed.description = desc;
  await settings.save();
  return "¡Configuración guardada! Mensaje de bienvenida actualizado";
}

async function setThumbnail(settings, status) {
  settings.welcome.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return "¡Configuración guardada! Mensaje de bienvenida actualizado";
}

async function setColor(settings, color) {
  settings.welcome.embed.color = color;
  await settings.save();
  return "¡Configuración guardada! Mensaje de bienvenida actualizado";
}

async function setFooter(settings, content) {
  settings.welcome.embed.footer = content;
  await settings.save();
  return "¡Configuración guardada! Mensaje de bienvenida actualizado";
}

async function setImage(settings, url) {
  settings.welcome.embed.image = url;
  await settings.save();
  return "¡Configuración guardada! Mensaje de bienvenida actualizado";
}
