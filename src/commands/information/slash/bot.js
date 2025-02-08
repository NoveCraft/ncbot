const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { timeformat } = require("@helpers/Utils");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config.js");
const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bot",
  description: "comandos relacionados con el bot",
  category: "INFORMACIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "invite",
        description: "obtener la invitación del bot",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "stats",
        description: "obtener las estadísticas del bot",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "uptime",
        description: "obtener el tiempo de actividad del bot",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("No es un subcomando válido");

    // Invitación
    if (sub === "invite") {
      const response = botInvite(interaction.client);
      try {
        await interaction.user.send(response);
        return interaction.followUp("¡Revisa tu DM para mi información! :envelope_with_arrow:");
      } catch (ex) {
        return interaction.followUp("¡No puedo enviarte mi información! ¿Tienes tus DMs abiertos?");
      }
    }

    // Estadísticas
    else if (sub === "stats") {
      const response = botstats(interaction.client);
      return interaction.followUp(response);
    }

    // Tiempo de actividad
    else if (sub === "uptime") {
      await interaction.followUp(`Mi tiempo de actividad: \`${timeformat(process.uptime())}\``);
    }
  },
};

function botInvite(client) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invitación" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription("¡Hola! Gracias por considerar invitarme\nUsa el botón de abajo para navegar a donde quieras");

  // Botones
  let components = [];
  components.push(new ButtonBuilder().setLabel("Enlace de Invitación").setURL(client.getInvite()).setStyle(ButtonStyle.Link));

  if (SUPPORT_SERVER) {
    components.push(new ButtonBuilder().setLabel("Servidor de Soporte").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder().setLabel("Enlace del Dashboard").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
}
