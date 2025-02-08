const userInfo = require("../shared/user");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "informacionusuario",
  description: "muestra información sobre el usuario",
  category: "INFORMACIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[@miembro|id]",
    aliases: ["infousuario", "informacionmiembro"],
  },

  async messageRun(message, args) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = userInfo(target);
    await message.safeReply(response);
  },
};
