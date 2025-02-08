const { deafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await deafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `El usuario ${target.user.username} ha sido ensordecido en este servidor`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para ensordecer a ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para ensordecer a ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "ALREADY_DEAFENED") {
    return `${target.user.username} ya está ensordecido`;
  }
  return `No se pudo ensordecer a ${target.user.username}`;
};
