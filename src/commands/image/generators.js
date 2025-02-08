const { EmbedBuilder, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getBuffer } = require("@helpers/HttpUtils");
const { getImageFromMessage } = require("@helpers/BotUtils");
const { EMBED_COLORS, IMAGE } = require("@root/config.js");

const generadoresDisponibles = [
  "ad",
  "affect",
  "beautiful",
  "bobross",
  "challenger",
  "confusedstonk",
  "delete",
  "dexter",
  "facepalm",
  "hitler",
  "jail",
  "jokeoverhead",
  "karaba",
  "kyon-gun",
  "mms",
  "notstonk",
  "poutine",
  "rip",
  "shit",
  "stonk",
  "tattoo",
  "thomas",
  "trash",
  "wanted",
  "worthless",
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "generador",
  description: "genera un meme para la imagen proporcionada",
  cooldown: 1,
  category: "IMAGEN",
  botPermissions: ["EmbedLinks", "AttachFiles"],
  command: {
    enabled: true,
    aliases: generadoresDisponibles,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "nombre",
        description: "el tipo de generador",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: generadoresDisponibles.map((gen) => ({ name: gen, value: gen })),
      },
      {
        name: "usuario",
        description: "el usuario al que se le aplicará el generador en su avatar",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
      {
        name: "enlace",
        description: "el enlace de la imagen a la que se le aplicará el generador",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const imagen = await getImageFromMessage(message, args);

    // usar invoke como un endpoint
    const url = getGenerator(data.invoke.toLowerCase(), imagen);
    const response = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    });

    if (!response.success) return message.safeReply("No se pudo generar la imagen");

    const attachment = new AttachmentBuilder(response.buffer, { name: "adjunto.png" });
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://adjunto.png")
      .setFooter({ text: `Solicitado por: ${message.author.username}` });

    await message.safeReply({ embeds: [embed], files: [attachment] });
  },

  async interactionRun(interaction) {
    const autor = interaction.user;
    const usuario = interaction.options.getUser("usuario");
    const enlaceImagen = interaction.options.getString("enlace");
    const generador = interaction.options.getString("nombre");

    let imagen;
    if (usuario) imagen = usuario.displayAvatarURL({ size: 256, extension: "png" });
    if (!imagen && enlaceImagen) imagen = enlaceImagen;
    if (!imagen) imagen = autor.displayAvatarURL({ size: 256, extension: "png" });

    const url = getGenerator(generador, imagen);
    const response = await getBuffer(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRANGE_API_KEY}`,
      },
    });

    if (!response.success) return interaction.followUp("No se pudo generar la imagen");

    const attachment = new AttachmentBuilder(response.buffer, { name: "adjunto.png" });
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.TRANSPARENT)
      .setImage("attachment://adjunto.png")
      .setFooter({ text: `Solicitado por: ${autor.username}` });

    await interaction.followUp({ embeds: [embed], files: [attachment] });
  },
};

function getGenerator(nombreGen, imagen) {
  const endpoint = new URL(`${IMAGE.BASE_API}/generadores/${nombreGen}`);
  endpoint.searchParams.append("image", imagen);
  return endpoint.href;
}
