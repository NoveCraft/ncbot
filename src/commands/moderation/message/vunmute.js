const vunmute = require("../shared/vunmute");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "vunmute",
  description: "desmutea la voz del miembro especificado",
  category: "MODERACIÓN",
  userPermissions: ["MuteMembers"],
  botPermissions: ["MuteMembers"],
  command: {
    enabled: true,
    usage: "<ID|@miembro> [razón]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`No se encontró ningún usuario que coincida con ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await vunmute(message, target, reason);
    await message.safeReply(response);
  },
};
