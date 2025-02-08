const {
  ApplicationCommandOptionType,
  ChannelType,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");
const { isValidColor, isHex } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "embed",
  description: "enviar mensaje embed",
  category: "ADMIN",
  userPermissions: ["ManageMessages"],
  command: {
    enabled: true,
    usage: "<#canal>",
    minArgsCount: 1,
    aliases: ["decir"],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "canal",
        description: "canal para enviar embed",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const canal = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!canal) return message.reply("Por favor proporciona un canal válido");
    if (canal.type !== ChannelType.GuildText) return message.reply("Por favor proporciona un canal válido");
    if (!canal.canSendEmbeds()) {
      return message.reply("No tengo permiso para enviar embeds en ese canal");
    }
    message.reply(`Configuración de embed iniciada en ${canal}`);
    await embedSetup(canal, message.member);
  },

  async interactionRun(interaction) {
    const canal = interaction.options.getChannel("canal");
    if (!canal.canSendEmbeds()) {
      return interaction.followUp("No tengo permiso para enviar embeds en ese canal");
    }
    interaction.followUp(`Configuración de embed iniciada en ${canal}`);
    await embedSetup(canal, interaction.member);
  },
};

/**
 * @param {import('discord.js').GuildTextBasedChannel} canal
 * @param {import('discord.js').GuildMember} miembro
 */
async function embedSetup(canal, miembro) {
  const mensajeEnviado = await canal.send({
    content: "Haz clic en el botón de abajo para comenzar",
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("EMBED_ADD").setLabel("Crear Embed").setStyle(ButtonStyle.Primary)
      ),
    ],
  });

  const btnInteraction = await canal
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "EMBED_ADD" && i.member.id === miembro.id && i.message.id === mensajeEnviado.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return mensajeEnviado.edit({ content: "No se recibió respuesta", components: [] });

  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "EMBED_MODAL",
      title: "Generador de Embed",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("titulo")
            .setLabel("Título del Embed")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("autor")
            .setLabel("Autor del Embed")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("descripcion")
            .setLabel("Descripción del Embed")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("color")
            .setLabel("Color del Embed")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("pie")
            .setLabel("Pie del Embed")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // recibir entrada del modal
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "EMBED_MODAL" && m.member.id === miembro.id && m.message.id === mensajeEnviado.id,
    })
    .catch((ex) => {});

  if (!modal) return mensajeEnviado.edit({ content: "No se recibió respuesta, cancelando configuración", components: [] });

  modal.reply({ content: "Embed enviado", ephemeral: true }).catch((ex) => {});

  const titulo = modal.fields.getTextInputValue("titulo");
  const autor = modal.fields.getTextInputValue("autor");
  const descripcion = modal.fields.getTextInputValue("descripcion");
  const pie = modal.fields.getTextInputValue("pie");
  const color = modal.fields.getTextInputValue("color");

  if (!titulo && !autor && !descripcion && !pie)
    return mensajeEnviado.edit({ content: "¡No puedes enviar un embed vacío!", components: [] });

  const embed = new EmbedBuilder();
  if (titulo) embed.setTitle(titulo);
  if (autor) embed.setAuthor({ name: autor });
  if (descripcion) embed.setDescription(descripcion);
  if (pie) embed.setFooter({ text: pie });
  if ((color && isValidColor(color)) || (color && isHex(color))) embed.setColor(color);

  // botón para agregar/quitar campo
  const filaBoton = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("EMBED_FIELD_ADD").setLabel("Agregar Campo").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("EMBED_FIELD_REM").setLabel("Quitar Campo").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("EMBED_FIELD_DONE").setLabel("Hecho").setStyle(ButtonStyle.Primary)
  );

  await mensajeEnviado.edit({
    content: "Por favor agrega campos usando los botones de abajo. Haz clic en hecho cuando termines.",
    embeds: [embed],
    components: [filaBoton],
  });

  const collector = canal.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.member.id === miembro.id,
    message: mensajeEnviado,
    idle: 5 * 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "EMBED_FIELD_ADD") {
      await interaction.showModal(
        new ModalBuilder({
          customId: "EMBED_ADD_FIELD_MODAL",
          title: "Agregar Campo",
          components: [
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("nombre")
                .setLabel("Nombre del Campo")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("valor")
                .setLabel("Valor del Campo")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("enlinea")
                .setLabel("¿En línea? (true/false)")
                .setStyle(TextInputStyle.Short)
                .setValue("true")
                .setRequired(true)
            ),
          ],
        })
      );

      // recibir entrada del modal
      const modal = await interaction
        .awaitModalSubmit({
          time: 5 * 60 * 1000,
          filter: (m) => m.customId === "EMBED_ADD_FIELD_MODAL" && m.member.id === miembro.id,
        })
        .catch((ex) => {});

      if (!modal) return mensajeEnviado.edit({ components: [] });

      modal.reply({ content: "Campo agregado", ephemeral: true }).catch((ex) => {});

      const nombre = modal.fields.getTextInputValue("nombre");
      const valor = modal.fields.getTextInputValue("valor");
      let enlinea = modal.fields.getTextInputValue("enlinea").toLowerCase();

      if (enlinea === "true") enlinea = true;
      else if (enlinea === "false") enlinea = false;
      else enlinea = true; // por defecto a true

      const campos = embed.data.fields || [];
      campos.push({ name: nombre, value: valor, inline: enlinea });
      embed.setFields(campos);
    }

    // quitar campo
    else if (interaction.customId === "EMBED_FIELD_REM") {
      const campos = embed.data.fields;
      if (campos) {
        campos.pop();
        embed.setFields(campos);
        interaction.reply({ content: "Campo quitado", ephemeral: true });
      } else {
        interaction.reply({ content: "No hay campos para quitar", ephemeral: true });
      }
    }

    // hecho
    else if (interaction.customId === "EMBED_FIELD_DONE") {
      return collector.stop();
    }

    await mensajeEnviado.edit({ embeds: [embed] });
  });

  collector.on("end", async (_collected, _reason) => {
    await mensajeEnviado.edit({ content: "", components: [] });
  });
}
