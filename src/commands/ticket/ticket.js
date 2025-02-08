const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ButtonStyle,
  TextInputStyle,
  ComponentType,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { isTicketChannel, closeTicket, closeAllTickets } = require("@handlers/ticket");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticket",
  description: "varios comandos de tickets",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "setup <#canal>",
        description: "iniciar una configuración interactiva de tickets",
      },
      {
        trigger: "log <#canal>",
        description: "configurar el canal de registro de tickets",
      },
      {
        trigger: "limit <número>",
        description: "establecer el número máximo de tickets abiertos simultáneamente",
      },
      {
        trigger: "close",
        description: "cerrar el ticket",
      },
      {
        trigger: "closeall",
        description: "cerrar todos los tickets abiertos",
      },
      {
        trigger: "add <userId|roleId>",
        description: "añadir usuario/rol al ticket",
      },
      {
        trigger: "remove <userId|roleId>",
        description: "eliminar usuario/rol del ticket",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "setup",
        description: "configurar un nuevo mensaje de ticket",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "canal",
            description: "el canal donde se debe enviar el mensaje de creación de tickets",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "log",
        description: "configurar el canal de registro de tickets",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "canal",
            description: "el canal donde se deben enviar los registros de tickets",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "limit",
        description: "establecer el número máximo de tickets abiertos simultáneamente",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "cantidad",
            description: "número máximo de tickets",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "close",
        description: "cerrar el ticket [usado solo en el canal de tickets]",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "closeall",
        description: "cerrar todos los tickets abiertos",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "añadir usuario al canal de tickets actual [usado solo en el canal de tickets]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user_id",
            description: "el id del usuario a añadir",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "eliminar usuario del canal de tickets [usado solo en el canal de tickets]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "usuario",
            description: "el usuario a eliminar",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let response;

    // Setup
    if (input === "setup") {
      if (!message.guild.members.me.permissions.has("ManageChannels")) {
        return message.safeReply("Me falta el permiso `Gestionar Canales` para crear canales de tickets");
      }
      const targetChannel = message.guild.findMatchingChannels(args[1])[0];
      if (!targetChannel) {
        return message.safeReply("No pude encontrar un canal con ese nombre");
      }
      return ticketModalSetup(message, targetChannel, data.settings);
    }

    // log ticket
    else if (input === "log") {
      if (args.length < 2) return message.safeReply("Por favor proporciona un canal donde se deben enviar los registros de tickets");
      const target = message.guild.findMatchingChannels(args[1]);
      if (target.length === 0) return message.safeReply("No se encontraron canales coincidentes");
      response = await setupLogChannel(target[0], data.settings);
    }

    // Set limit
    else if (input === "limit") {
      if (args.length < 2) return message.safeReply("Por favor proporciona un número");
      const limit = args[1];
      if (isNaN(limit)) return message.safeReply("Por favor proporciona un número válido");
      response = await setupLimit(limit, data.settings);
    }

    // Close ticket
    else if (input === "close") {
      response = await close(message, message.author);
      if (!response) return;
    }

    // Close all tickets
    else if (input === "closeall") {
      let sent = await message.safeReply("Cerrando tickets ...");
      response = await closeAll(message, message.author);
      return sent.editable ? sent.edit(response) : message.channel.send(response);
    }

    // Add user to ticket
    else if (input === "add") {
      if (args.length < 2) return message.safeReply("Por favor proporciona un usuario o rol para añadir al ticket");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId);
    }

    // Remove user from ticket
    else if (input === "remove") {
      if (args.length < 2) return message.safeReply("Por favor proporciona un usuario o rol para eliminar");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId);
    }

    // Invalid input
    else {
      return message.safeReply("Uso incorrecto del comando");
    }

    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // setup
    if (sub === "setup") {
      const channel = interaction.options.getChannel("canal");

      if (!interaction.guild.members.me.permissions.has("ManageChannels")) {
        return interaction.followUp("Me falta el permiso `Gestionar Canales` para crear canales de tickets");
      }

      await interaction.deleteReply();
      return ticketModalSetup(interaction, channel, data.settings);
    }

    // Log channel
    else if (sub === "log") {
      const channel = interaction.options.getChannel("canal");
      response = await setupLogChannel(channel, data.settings);
    }

    // Limit
    else if (sub === "limit") {
      const limit = interaction.options.getInteger("cantidad");
      response = await setupLimit(limit, data.settings);
    }

    // Close
    else if (sub === "close") {
      response = await close(interaction, interaction.user);
    }

    // Close all
    else if (sub === "closeall") {
      response = await closeAll(interaction, interaction.user);
    }

    // Add to ticket
    else if (sub === "add") {
      const inputId = interaction.options.getString("user_id");
      response = await addToTicket(interaction, inputId);
    }

    // Remove from ticket
    else if (sub === "remove") {
      const user = interaction.options.getUser("usuario");
      response = await removeFromTicket(interaction, user.id);
    }

    if (response) await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').Message} param0
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */
async function ticketModalSetup({ guild, channel, member }, targetChannel, settings) {
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_btnSetup").setLabel("Configurar Mensaje").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: "Por favor haz clic en el botón de abajo para configurar el mensaje de ticket",
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "ticket_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "No se recibió respuesta, cancelando configuración", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "ticket-modalSetup",
      title: "Configuración de Ticket",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Título del Embed")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Descripción del Embed")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footer")
            .setLabel("Pie de Página del Embed")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "ticket-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "No se recibió respuesta, cancelando configuración", components: [] });

  await modal.reply("Configurando mensaje de ticket ...");
  const title = modal.fields.getTextInputValue("title");
  const description = modal.fields.getTextInputValue("description");
  const footer = modal.fields.getTextInputValue("footer");

  // send ticket message
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: title || "Ticket de Soporte" })
    .setDescription(description || "Por favor usa el botón de abajo para crear un ticket")
    .setFooter({ text: footer || "¡Solo puedes tener 1 ticket abierto a la vez!" });

  const tktBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Abrir un ticket").setCustomId("TICKET_CREATE").setStyle(ButtonStyle.Success)
  );

  await targetChannel.send({ embeds: [embed], components: [tktBtnRow] });
  await modal.deleteReply();
  await sentMsg.edit({ content: "¡Hecho! Mensaje de Ticket Creado", components: [] });
}

async function setupLogChannel(target, settings) {
  if (!target.canSendEmbeds()) return `¡Vaya! No tengo permiso para enviar embeds a ${target}`;

  settings.ticket.log_channel = target.id;
  await settings.save();

  return `¡Configuración guardada! Los registros de tickets se enviarán a ${target.toString()}`;
}

async function setupLimit(limit, settings) {
  if (Number.parseInt(limit, 10) < 5) return "El límite de tickets no puede ser menor a 5";

  settings.ticket.limit = limit;
  await settings.save();

  return `Configuración guardada. Ahora puedes tener un máximo de \`${limit}\` tickets abiertos`;
}

async function close({ channel }, author) {
  if (!isTicketChannel(channel)) return "Este comando solo se puede usar en canales de tickets";
  const status = await closeTicket(channel, author, "Cerrado por un moderador");
  if (status === "MISSING_PERMISSIONS") return "No tengo permiso para cerrar tickets";
  if (status === "ERROR") return "Ocurrió un error al cerrar el ticket";
  return null;
}

async function closeAll({ guild }, user) {
  const stats = await closeAllTickets(guild, user);
  return `¡Completado! Éxito: \`${stats[0]}\` Fallo: \`${stats[1]}\``;
}

async function addToTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "Este comando solo se puede usar en el canal de tickets";
  if (!inputId || isNaN(inputId)) return "¡Vaya! Necesitas ingresar un userId/roleId válido";

  try {
    await channel.permissionOverwrites.create(inputId, {
      ViewChannel: true,
      SendMessages: true,
    });

    return "Hecho";
  } catch (ex) {
    return "No se pudo añadir el usuario/rol. ¿Proporcionaste un ID válido?";
  }
}

async function removeFromTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "Este comando solo se puede usar en el canal de tickets";
  if (!inputId || isNaN(inputId)) return "¡Vaya! Necesitas ingresar un userId/roleId válido";

  try {
    channel.permissionOverwrites.create(inputId, {
      ViewChannel: false,
      SendMessages: false,
    });
    return "Hecho";
  } catch (ex) {
    return "No se pudo eliminar el usuario/rol. ¿Proporcionaste un ID válido?";
  }
}
