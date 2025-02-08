const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "maxwarn",
  description: "configurar el máximo de advertencias",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "limite <número>",
        description: "establecer el máximo de advertencias que un miembro puede recibir antes de tomar una acción",
      },
      {
        trigger: "accion <timeout|kick|ban>",
        description: "establecer la acción a realizar después de recibir el máximo de advertencias",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "limite",
        description: "establecer el máximo de advertencias que un miembro puede recibir antes de tomar una acción",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "cantidad",
            description: "número máximo de advertencias",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "accion",
        description: "establecer la acción a realizar después de recibir el máximo de advertencias",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "accion",
            description: "acción a realizar",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "TIMEOUT",
                value: "TIMEOUT",
              },
              {
                name: "KICK",
                value: "KICK",
              },
              {
                name: "BAN",
                value: "BAN",
              },
            ],
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["limite", "accion"].includes(input)) return message.safeReply("Uso del comando inválido");

    let response;
    if (input === "limite") {
      const max = parseInt(args[1]);
      if (isNaN(max) || max < 1) return message.safeReply("El máximo de advertencias debe ser un número válido mayor que 0");
      response = await setLimit(max, data.settings);
    }

    if (input === "accion") {
      const action = args[1]?.toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply("Acción no válida. La acción puede ser `Timeout`/`Kick`/`Ban`");
      response = await setAction(message.guild, action, data.settings);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();

    let response;
    if (sub === "limite") {
      response = await setLimit(interaction.options.getInteger("cantidad"), data.settings);
    }

    if (sub === "accion") {
      response = await setAction(interaction.guild, interaction.options.getString("accion"), data.settings);
    }

    await interaction.followUp(response);
  },
};

async function setLimit(limit, settings) {
  settings.max_warn.limit = limit;
  await settings.save();
  return `¡Configuración guardada! El máximo de advertencias se ha establecido en ${limit}`;
}

async function setAction(guild, action, settings) {
  if (action === "TIMEOUT") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return "No tengo permiso para silenciar a los miembros";
    }
  }

  if (action === "KICK") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return "No tengo permiso para expulsar a los miembros";
    }
  }

  if (action === "BAN") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return "No tengo permiso para prohibir a los miembros";
    }
  }

  settings.max_warn.action = action;
  await settings.save();
  return `¡Configuración guardada! La acción de automoderación se ha establecido en ${action}`;
}
