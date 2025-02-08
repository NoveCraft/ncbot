const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMY, EMBED_COLORS } = require("@root/config");

module.exports = async (usuario, monedas) => {
  if (isNaN(monedas) || monedas <= 0) return "Por favor ingresa una cantidad válida de monedas para depositar";
  const usuarioDb = await getUser(usuario);

  if (monedas > usuarioDb.coins) return `Solo tienes ${usuarioDb.coins}${ECONOMY.CURRENCY} monedas en tu billetera`;

  usuarioDb.coins -= monedas;
  usuarioDb.bank += monedas;
  await usuarioDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Nuevo Saldo" })
    .setThumbnail(usuario.displayAvatarURL())
    .addFields(
      {
        name: "Billetera",
        value: `${usuarioDb.coins}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Banco",
        value: `${usuarioDb.bank}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Valor Neto",
        value: `${usuarioDb.coins + usuarioDb.bank}${ECONOMY.CURRENCY}`,
        inline: true,
      }
    );

  return { embeds: [embed] };
};
