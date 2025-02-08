const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async (usuario, monedas) => {
  if (isNaN(monedas) || monedas <= 0) return "Por favor ingresa una cantidad válida de monedas para depositar";
  const usuarioDb = await getUser(usuario);

  if (monedas > usuarioDb.banco) return `Solo tienes ${usuarioDb.banco}${ECONOMY.CURRENCY} monedas en tu banco`;

  usuarioDb.banco -= monedas;
  usuarioDb.monedas += monedas;
  await usuarioDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Nuevo Balance" })
    .setThumbnail(usuario.displayAvatarURL())
    .addFields(
      {
        name: "Cartera",
        value: `${usuarioDb.monedas}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Banco",
        value: `${usuarioDb.banco}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Valor Neto",
        value: `${usuarioDb.monedas + usuarioDb.banco}${ECONOMY.CURRENCY}`,
        inline: true,
      }
    );

  return { embeds: [embed] };
};
