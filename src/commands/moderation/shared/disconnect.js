const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `El usuario ${target.user.username} ha sido desconectado del canal de voz`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para desconectar a ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para desconectar a ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  return `No se pudo desconectar a ${target.user.username}`;
};
