const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getBuffer } = require("@helpers/HttpUtils");
const { getImageFromMessage } = require("@helpers/BotUtils");
const { EMBED_COLORS, IMAGE } = require("@root/config.js");

const overlaysDisponibles = [
  "aprobado",
  "brazzers",
  "gay",
  "halloween",
  "rechazado",
  "thuglife",
  "continuará",
  "desperdiciado",
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "superponer",
  description: "añadir superposición sobre la imagen proporcionada",
  cooldown: 5,
  category: "IMAGEN",
  botPermissions: ["EmbedLinks", "AttachFiles"],
  command: {
    enabled: true,
    aliases: overlaysDisponibles,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "nombre",
        description: "el tipo de superposición",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: overlaysDisponibles.map((overlay) => ({ name: overlay, value: overlay })),
      },
      {
        name: "usuario",
        description: "el usuario al que se le aplicará la superposición en su avatar",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: "enlace",
        description: "el enlace de la imagen a la que se le aplicará la superposición",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const imagen = await getImageFromMessage(message, args);

    // usar invoke como un endpoint
    const url = obtenerSuperposicion(data.invoke.toLowerCase(), imagen);
    const respuesta = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    });

    if (!respuesta.success) return message.safeReply("No se pudo generar la imagen");

    const adjunto = new AttachmentBuilder(respuesta.buffer, { name: "adjunto.png" });
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://adjunto.png")
      .setFooter({ text: `Solicitado por: ${message.author.username}` });

    await message.safeReply({ embeds: [embed], files: [adjunto] });
  },

  async interactionRun(interaction) {
    const autor = interaction.user;
    const usuario = interaction.options.getUser("usuario");
    const enlaceImagen = interaction.options.getString("enlace");
    const filtro = interaction.options.getString("nombre");

    let imagen;
    if (usuario) imagen = usuario.displayAvatarURL({ size: 256, extension: "png" });
    if (!imagen && enlaceImagen) imagen = enlaceImagen;
    if (!imagen) imagen = autor.displayAvatarURL({ size: 256, extension: "png" });

    const url = obtenerSuperposicion(filtro, imagen);
    const respuesta = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    });

    if (!respuesta.success) return interaction.followUp("No se pudo generar la superposición de la imagen");

    const adjunto = new AttachmentBuilder(respuesta.buffer, { name: "adjunto.png" });
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://adjunto.png")
      .setFooter({ text: `Solicitado por: ${autor.username}` });

    await interaction.followUp({ embeds: [embed], files: [adjunto] });
  },
};

function obtenerSuperposicion(filtro, imagen) {
  const endpoint = new URL(`${IMAGE.BASE_API}/overlays/${filtro}`);
  endpoint.searchParams.append("image", imagen);
  return endpoint.href;
}
