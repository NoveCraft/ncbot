const botinvite = require("../shared/botinvite");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botinvite",
  description: "te da la invitación del bot",
  category: "INFORMACIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = botinvite(message.client);
    try {
      await message.author.send(response);
      return message.safeReply("¡Revisa tu DM para mi información! :envelope_with_arrow:");
    } catch (ex) {
      return message.safeReply("¡No puedo enviarte mi información! ¿Tienes tus DM abiertos?");
    }
  },
};
