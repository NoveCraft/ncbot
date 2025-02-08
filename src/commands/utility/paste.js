const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { postToBin } = require("@helpers/HttpUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "paste",
  description: "Pegar algo en sourceb.in",
  cooldown: 5,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 2,
    usage: "<título> <contenido>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "title",
        description: "título para tu contenido",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "content",
        description: "contenido a publicar en bin",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const title = args.shift();
    const content = args.join(" ");
    const response = await paste(content, title);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const title = interaction.options.getString("title");
    const content = interaction.options.getString("content");
    const response = await paste(content, title);
    await interaction.followUp(response);
  },
};

async function paste(content, title) {
  const response = await postToBin(content, title);
  if (!response) return "❌ Algo salió mal";

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Enlaces de pegado" })
    .setDescription(`🔸 Normal: ${response.url}\n🔹 Raw: ${response.raw}`);

  return { embeds: [embed] };
}
