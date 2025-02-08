const { moveTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason, channel) => {
  const response = await moveTarget(member, target, reason, channel);
  if (typeof response === "boolean") {
    return `El usuario ${target.user.username} ha sido movido exitosamente a: ${channel}`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para mover a ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para mover a ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "TARGET_PERM") {
    return `${target.user.username} no tiene permiso para unirse a ${channel}`;
  }
  if (response === "ALREADY_IN_CHANNEL") {
    return `${target.user.username} ya está conectado a ${channel}`;
  }
  return `No se pudo mover a ${target.user.username} a ${channel}`;
};
