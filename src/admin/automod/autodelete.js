const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autodelete",
  description: "gestionar la configuración de autodelete para el servidor",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "attachments <on|off>",
        description: "permitir o no permitir archivos adjuntos en el mensaje",
      },
      {
        trigger: "invites <on|off>",
        description: "permitir o no permitir invitaciones en el mensaje",
      },
      {
        trigger: "links <on|off>",
        description: "permitir o no permitir enlaces en el mensaje",
      },
      {
        trigger: "maxlines <number>",
        description: "establece el máximo de líneas permitidas por mensaje [0 para desactivar]",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "attachments",
        description: "permitir o no permitir archivos adjuntos en el mensaje",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "estado de configuración",
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
        name: "invites",
        description: "permitir o no permitir invitaciones de discord en el mensaje",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "estado de configuración",
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
        name: "links",
        description: "permitir o no permitir enlaces en el mensaje",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "estado de configuración",
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
        name: "maxlines",
        description: "establece el máximo de líneas permitidas por mensaje",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "cantidad de configuración (0 para desactivar)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();
    let response;

    if (sub == "attachments") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Estado inválido. El valor debe ser `on/off`");
      response = await antiAttachments(settings, status);
    }

    //
    else if (sub === "invites") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Estado inválido. El valor debe ser `on/off`");
      response = await antiInvites(settings, status);
    }

    //
    else if (sub == "links") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Estado inválido. El valor debe ser `on/off`");
      response = await antilinks(settings, status);
    }

    //
    else if (sub === "maxlines") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1) {
        return message.safeReply("Las líneas máximas deben ser un número válido mayor que 0");
      }
      response = await maxLines(settings, max);
    }

    //
    else response = "¡Uso del comando inválido!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;
    let response;

    if (sub == "attachments") {
      response = await antiAttachments(settings, interaction.options.getString("status"));
    } else if (sub === "invites") response = await antiInvites(settings, interaction.options.getString("status"));
    else if (sub == "links") response = await antilinks(settings, interaction.options.getString("status"));
    else if (sub === "maxlines") response = await maxLines(settings, interaction.options.getInteger("amount"));
    else response = "¡Uso del comando inválido!";

    await interaction.followUp(response);
  },
};

async function antiAttachments(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_attachments = status;
  await settings.save();
  return `Los mensajes ${
    status ? "con archivos adjuntos ahora se eliminarán automáticamente" : "ya no se filtrarán por archivos adjuntos"
  }`;
}

async function antiInvites(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_invites = status;
  await settings.save();
  return `Los mensajes ${
    status ? "con invitaciones de discord ahora se eliminarán automáticamente" : "ya no se filtrarán por invitaciones de discord"
  }`;
}

async function antilinks(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_links = status;
  await settings.save();
  return `Los mensajes ${status ? "con enlaces ahora se eliminarán automáticamente" : "ya no se filtrarán por enlaces"}`;
}

async function maxLines(settings, input) {
  const lines = Number.parseInt(input);
  if (isNaN(lines)) return "Por favor, ingrese un número válido";

  settings.automod.max_lines = lines;
  await settings.save();
  return `${
    input === 0
      ? "El límite máximo de líneas está desactivado"
      : `Los mensajes con más de \`${input}\` líneas ahora se eliminarán automáticamente`
  }`;
}
