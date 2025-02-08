const { approveSuggestion, rejectSuggestion } = require("@handlers/suggestion");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const CHANNEL_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks", "ManageMessages", "ReadMessageHistory"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "suggestion",
  description: "configurar el sistema de sugerencias",
  category: "SUGERENCIA",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "habilitar/deshabilitar el sistema de sugerencias",
      },
      {
        trigger: "channel <#canal|off>",
        description: "configurar el canal de sugerencias o deshabilitarlo",
      },
      {
        trigger: "appch <#canal>",
        description: "configurar el canal de sugerencias aprobadas o deshabilitarlo",
      },
      {
        trigger: "rejch <#canal>",
        description: "configurar el canal de sugerencias rechazadas o deshabilitarlo",
      },
      {
        trigger: "approve <canal> <messageId> [razón]",
        description: "aprobar una sugerencia",
      },
      {
        trigger: "reject <canal> <messageId> [razón]",
        description: "rechazar una sugerencia",
      },
      {
        trigger: "staffadd <roleId>",
        description: "añadir un rol de staff",
      },
      {
        trigger: "staffremove <roleId>",
        description: "eliminar un rol de staff",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "habilitar o deshabilitar el estado de sugerencias",
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
        name: "channel",
        description: "configurar el canal de sugerencias o deshabilitarlo",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "el canal donde se enviarán las sugerencias",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "appch",
        description: "configurar el canal de sugerencias aprobadas o deshabilitarlo",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "el canal donde se enviarán las sugerencias aprobadas",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "rejch",
        description: "configurar el canal de sugerencias rechazadas o deshabilitarlo",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "el canal donde se enviarán las sugerencias rechazadas",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "approve",
        description: "aprobar una sugerencia",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "el canal donde existe el mensaje",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "el id del mensaje de la sugerencia",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reason",
            description: "la razón de la aprobación",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "reject",
        description: "rechazar una sugerencia",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "el canal donde existe el mensaje",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "el id del mensaje de la sugerencia",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reason",
            description: "la razón del rechazo",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "staffadd",
        description: "añadir un rol de staff",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "el rol a añadir como staff",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: "staffremove",
        description: "eliminar un rol de staff",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "el rol a eliminar del staff",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    let response;

    // status
    if (sub == "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Estado inválido. El valor debe ser `on/off`");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No se encontraron canales coincidentes para ${input}`;
      else if (matched.length > 1) response = `Se encontraron múltiples canales para ${input}. Por favor sé más específico.`;
      else response = await setChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "appch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No se encontraron canales coincidentes para ${input}`;
      else if (matched.length > 1) response = `Se encontraron múltiples canales para ${input}. Por favor sé más específico.`;
      else response = await setApprovedChannel(data.settings, matched[0]);
    }

    // rejch
    else if (sub == "rejch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No se encontraron canales coincidentes para ${input}`;
      else if (matched.length > 1) response = `Se encontraron múltiples canales para ${input}. Por favor sé más específico.`;
      else response = await setRejectedChannel(data.settings, matched[0]);
    }

    // approve
    else if (sub == "approve") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No se encontraron canales coincidentes para ${input}`;
      else if (matched.length > 1) response = `Se encontraron múltiples canales para ${input}. Por favor sé más específico.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await approveSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // reject
    else if (sub == "reject") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `No se encontraron canales coincidentes para ${input}`;
      else if (matched.length > 1) response = `Se encontraron múltiples canales para ${input}. Por favor sé más específico.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await rejectSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // staffadd
    else if (sub == "staffadd") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `No se encontraron roles coincidentes para ${input}`;
      else if (matched.length > 1) response = `Se encontraron múltiples roles para ${input}. Por favor sé más específico.`;
      else response = await addStaffRole(data.settings, matched[0]);
    }

    // staffremove
    else if (sub == "staffremove") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `No se encontraron roles coincidentes para ${input}`;
      else if (matched.length > 1) response = `Se encontraron múltiples roles para ${input}. Por favor sé más específico.`;
      else response = await removeStaffRole(data.settings, matched[0]);
    }

    // else
    else response = "No es un subcomando válido";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub == "status") {
      const status = interaction.options.getString("status");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setChannel(data.settings, channel);
    }

    // app_channel
    else if (sub == "appch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setApprovedChannel(data.settings, channel);
    }

    // rej_channel
    else if (sub == "rejch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setRejectedChannel(data.settings, channel);
    }

    // approve
    else if (sub == "approve") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await approveSuggestion(interaction.member, channel, messageId);
    }

    // reject
    else if (sub == "reject") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await rejectSuggestion(interaction.member, channel, messageId);
    }

    // staffadd
    else if (sub == "staffadd") {
      const role = interaction.options.getRole("role");
      response = await addStaffRole(data.settings, role);
    }

    // staffremove
    else if (sub == "staffremove") {
      const role = interaction.options.getRole("role");
      response = await removeStaffRole(data.settings, role);
    }

    // else
    else response = "No es un subcomando válido";
    await interaction.followUp(response);
  },
};

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.suggestions.enabled = enabled;
  await settings.save();
  return `El sistema de sugerencias ahora está ${enabled ? "habilitado" : "deshabilitado"}`;
}

async function setChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.channel_id = null;
    await settings.save();
    return "El sistema de sugerencias ahora está deshabilitado";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Necesito los siguientes permisos en ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.channel_id = channel.id;
  await settings.save();
  return `Las sugerencias ahora se enviarán a ${channel}`;
}

async function setApprovedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.approved_channel = null;
    await settings.save();
    return "El canal de sugerencias aprobadas ahora está deshabilitado";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Necesito los siguientes permisos en ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.approved_channel = channel.id;
  await settings.save();
  return `Las sugerencias aprobadas ahora se enviarán a ${channel}`;
}

async function setRejectedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.rejected_channel = null;
    await settings.save();
    return "El canal de sugerencias rechazadas ahora está deshabilitado";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Necesito los siguientes permisos en ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.rejected_channel = channel.id;
  await settings.save();
  return `Las sugerencias rechazadas ahora se enviarán a ${channel}`;
}

async function addStaffRole(settings, role) {
  if (settings.suggestions.staff_roles.includes(role.id)) {
    return `\`${role.name}\` ya es un rol de staff`;
  }
  settings.suggestions.staff_roles.push(role.id);
  await settings.save();
  return `\`${role.name}\` ahora es un rol de staff`;
}

async function removeStaffRole(settings, role) {
  if (!settings.suggestions.staff_roles.includes(role.id)) {
    return `${role} no es un rol de staff`;
  }
  settings.suggestions.staff_roles.splice(settings.suggestions.staff_roles.indexOf(role.id), 1);
  await settings.save();
  return `\`${role.name}\` ya no es un rol de staff`;
}
