const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `El usuario ${target.user.username} ha sido desensordecido en este servidor`;
  }
  if (response === "MEMBER_PERM") {
    return `No tienes permiso para desensordecer a ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `No tengo permiso para desensordecer a ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `${target.user.username} no está en ningún canal de voz`;
  }
  if (response === "NOT_DEAFENED") {
    return `${target.user.username} no está ensordecido`;
  }
  return `No se pudo desensordecer a ${target.user.username}`;
};
