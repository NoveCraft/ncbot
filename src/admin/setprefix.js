const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "setprefix",
  description: "establece un nuevo prefijo para este servidor",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<nuevo-prefijo>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "nuevoprefijo",
        description: "el nuevo prefijo a establecer",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const newPrefix = args[0];
    const response = await setNewPrefix(newPrefix, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setNewPrefix(interaction.options.getString("nuevoprefijo"), data.settings);
    await interaction.followUp(response);
  },
};

async function setNewPrefix(newPrefix, settings) {
  if (newPrefix.length > 2) return "La longitud del prefijo no puede exceder `2` caracteres";
  settings.prefix = newPrefix;
  await settings.save();

  return `El nuevo prefijo es \`${newPrefix}\``;
}
