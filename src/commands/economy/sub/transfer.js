const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMIA, COLORES_EMBED } = require("@root/config");

module.exports = async (self, target, monedas) => {
  if (isNaN(monedas) || monedas <= 0) return "Por favor ingresa una cantidad válida de monedas para transferir";
  if (target.bot) return "¡No puedes transferir monedas a bots!";
  if (target.id === self.id) return "¡No puedes transferir monedas a ti mismo!";

  const usuarioDb = await getUser(self);

  if (usuarioDb.banco < monedas) {
    return `¡Saldo insuficiente en el banco! Solo tienes ${usuarioDb.banco}${ECONOMIA.MONEDA} en tu cuenta bancaria.${
      usuarioDb.monedas > 0 && "\nDebes depositar tus monedas en el banco antes de poder transferir"
    } `;
  }

  const objetivoDb = await getUser(target);

  usuarioDb.banco -= monedas;
  objetivoDb.banco += monedas;

  await usuarioDb.save();
  await objetivoDb.save();

  const embed = new EmbedBuilder()
    .setColor(COLORES_EMBED.BOT_EMBED)
    .setAuthor({ name: "Saldo Actualizado" })
    .setDescription(`Has transferido exitosamente ${monedas}${ECONOMIA.MONEDA} a ${target.username}`)
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
