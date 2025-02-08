const { vUnmuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `El usuario ${target.user.username} ha sido desmuteado en este servidor`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para desmutear a ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para desmutear a ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "NOT_MUTED") {
    return `${target.user.username} no está muteado`;
  }
  return `No se pudo desmutear a ${target.user.username}`;
};
