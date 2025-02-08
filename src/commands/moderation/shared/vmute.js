const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `El usuario ${target.user.username} ha sido muteado en este servidor`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para mutear a ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para mutear a ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "ALREADY_MUTED") {
    return `${target.user.username} ya está muteado`;
  }
  return `No se pudo mutear a ${target.user.username}`;
};
