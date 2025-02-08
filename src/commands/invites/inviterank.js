const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rango-invitaciones",
  description: "configurar rangos de invitaciones",
  category: "INVITACIÓN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<nombre-rol> <invitaciones>",
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "agregar <rol> <invitaciones>",
        description: "agregar auto-rango después de alcanzar un número particular de invitaciones",
      },
      {
        trigger: "eliminar rol",
        description: "eliminar rango de invitación configurado con ese rol",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "agregar",
        description: "agregar un nuevo rango de invitación",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "rol",
            description: "rol a ser otorgado",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
          {
            name: "invitaciones",
            description: "número de invitaciones requeridas para obtener el rol",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "eliminar",
        description: "eliminar un rango de invitación previamente configurado",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "rol",
            description: "rol con rango de invitación configurado",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0].toLowerCase();

    if (sub === "agregar") {
      const query = args[1];
      const invitaciones = args[2];

      if (isNaN(invitaciones)) return message.safeReply(`\`${invitaciones}\` no es un número válido de invitaciones`);
      const rol = message.guild.findMatchingRoles(query)[0];
      if (!rol) return message.safeReply(`No se encontraron roles que coincidan con \`${query}\``);

      const response = await addInviteRank(message, rol, invitaciones, data.settings);
      await message.safeReply(response);
    }

    //
    else if (sub === "eliminar") {
      const query = args[1];
      const rol = message.guild.findMatchingRoles(query)[0];
      if (!rol) return message.safeReply(`No se encontraron roles que coincidan con \`${query}\``);
      const response = await removeInviteRank(message, rol, data.settings);
      await message.safeReply(response);
    }

    //
    else {
      await message.safeReply("¡Uso incorrecto del comando!");
    }
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    //
    if (sub === "agregar") {
      const rol = interaction.options.getRole("rol");
      const invitaciones = interaction.options.getInteger("invitaciones");

      const response = await addInviteRank(interaction, rol, invitaciones, data.settings);
      await interaction.followUp(response);
    }

    //
    else if (sub === "eliminar") {
      const rol = interaction.options.getRole("rol");
      const response = await removeInviteRank(interaction, rol, data.settings);
      await interaction.followUp(response);
    }
  },
};

async function addInviteRank({ guild }, rol, invitaciones, settings) {
  if (!settings.invite.tracking) return `El seguimiento de invitaciones está deshabilitado en este servidor`;

  if (rol.managed) {
    return "No puedes asignar un rol de bot";
  }

  if (guild.roles.everyone.id === rol.id) {
    return "No puedo asignar el rol de todos.";
  }

  if (!rol.editable) {
    return "Me faltan permisos para mover miembros a ese rol. ¿Está ese rol por debajo de mi rol más alto?";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === rol.id);

  let msg = "";
  if (exists) {
    exists.invitaciones = invitaciones;
    msg += "Se encontró una configuración previa para este rol. Sobrescribiendo datos\n";
  } else {
    settings.invite.ranks.push({ _id: rol.id, invitaciones });
  }

  await settings.save();
  return `${msg}¡Éxito! Configuración guardada.`;
}

async function removeInviteRank({ guild }, rol, settings) {
  if (!settings.invite.tracking) return `El seguimiento de invitaciones está deshabilitado en este servidor`;

  if (rol.managed) {
    return "No puedes asignar un rol de bot";
  }

  if (guild.roles.everyone.id === rol.id) {
    return "No puedes asignar el rol de todos.";
  }

  if (!rol.editable) {
    return "Me faltan permisos para mover miembros de ese rol. ¿Está ese rol por debajo de mi rol más alto?";
  }

  const exists = settings.invite.ranks.find((obj) => obj._id === rol.id);
  if (!exists) return "No se encontró ninguna configuración previa de rango de invitación para este rol";

  // eliminar elemento del array
  const i = settings.invite.ranks.findIndex((obj) => obj._id === rol.id);
  if (i > -1) settings.invite.ranks.splice(i, 1);

  await settings.save();
  return "¡Éxito! Configuración guardada.";
}
