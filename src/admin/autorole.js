const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autorole",
  description: "configurar el rol que se dará cuando un miembro se una al servidor",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<rol|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "agregar",
        description: "configurar el autorol",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "rol",
            description: "el rol que se dará",
            type: ApplicationCommandOptionType.Role,
            required: false,
          },
          {
            name: "rol_id",
            description: "el id del rol que se dará",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "remover",
        description: "desactivar el autorol",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args.join(" ");
    let response;

    if (input.toLowerCase() === "off") {
      response = await setAutoRole(message, null, data.settings);
    } else {
      const roles = message.guild.findMatchingRoles(input);
      if (roles.length === 0) response = "No se encontraron roles que coincidan con tu consulta";
      else response = await setAutoRole(message, roles[0], data.settings);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // agregar
    if (sub === "agregar") {
      let rol = interaction.options.getRole("rol");
      if (!rol) {
        const rol_id = interaction.options.getString("rol_id");
        if (!rol_id) return interaction.followUp("Por favor proporciona un rol o id de rol");

        const roles = interaction.guild.findMatchingRoles(rol_id);
        if (roles.length === 0) return interaction.followUp("No se encontraron roles que coincidan con tu consulta");
        rol = roles[0];
      }

      response = await setAutoRole(interaction, rol, data.settings);
    }

    // remover
    else if (sub === "remover") {
      response = await setAutoRole(interaction, null, data.settings);
    }

    // default
    else response = "Subcomando inválido";

    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").Message | import("discord.js").CommandInteraction} message
 * @param {import("discord.js").Role} role
 * @param {import("@models/Guild")} settings
 */
async function setAutoRole({ guild }, role, settings) {
  if (role) {
    if (role.id === guild.roles.everyone.id) return "No puedes configurar `@everyone` como el autorol";
    if (!guild.members.me.permissions.has("ManageRoles")) return "No tengo el permiso de `ManageRoles`";
    if (guild.members.me.roles.highest.position < role.position)
      return "No tengo permisos para asignar este rol";
    if (role.managed) return "¡Ups! Este rol es gestionado por una integración";
  }

  if (!role) settings.autorole = null;
  else settings.autorole = role.id;

  await settings.save();
  return `¡Configuración guardada! El autorol está ${!role ? "desactivado" : "configurado"}`;
}
