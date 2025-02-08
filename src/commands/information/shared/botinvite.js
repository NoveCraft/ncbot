const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");

module.exports = (client) => {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invitación" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("¡Hola! Gracias por invitarme\nUsa el botón de abajo para navegar a donde quieras");

  // Botones
  let componentes = [];
  componentes.push(new ButtonBuilder().setLabel("Enlace de Invitación").setURL(client.getInvite()).setStyle(ButtonStyle.Link));

  if (SUPPORT_SERVER) {
    componentes.push(new ButtonBuilder().setLabel("Servidor de Soporte").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
  }

  if (DASHBOARD.enabled) {
    componentes.push(
      new ButtonBuilder().setLabel("Enlace del Panel").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );
  }

  let filaDeBotones = new ActionRowBuilder().addComponents(componentes);
  return { embeds: [embed], components: [filaDeBotones] };
};
