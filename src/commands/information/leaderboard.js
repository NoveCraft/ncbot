const { EmbedBuilder, escapeInlineCode, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getInvitesLb } = require("@schemas/Member");
const { getXpLb } = require("@schemas/MemberStats");
const { getReputationLb } = require("@schemas/User");

const tiposDeLeaderboard = ["xp", "invite", "rep"];

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "leaderboard",
  description: "muestra el leaderboard de XP, invitaciones y reputación",
  category: "INFORMACIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["lb"],
    minArgsCount: 1,
    usage: "<xp|invite|rep>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "tipo",
        description: "tipo de leaderboard a mostrar",
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: tiposDeLeaderboard.map((type) => ({
          name: type,
          value: type,
        })),
      },
    ],
  },
  async messageRun(message, args, data) {
    const tipo = args[0].toLowerCase();
    let respuesta;

    switch (tipo) {
      case "xp":
        respuesta = await obtenerLeaderboardXp(message, message.author, data.settings);
        break;
      case "invite":
        respuesta = await obtenerLeaderboardInvitaciones(message, message.author, data.settings);
        break;
      case "rep":
        respuesta = await obtenerLeaderboardReputacion(message.author);
        break;
      default:
        respuesta = "Tipo de leaderboard inválido. Elige entre `xp`, `invite` o `rep`";
    }

    await message.safeReply(respuesta);
  },

  async interactionRun(interaction, data) {
    const tipo = interaction.options.getString("tipo");
    let respuesta;

    switch (tipo) {
      case "xp":
        respuesta = await obtenerLeaderboardXp(interaction, interaction.user, data.settings);
        break;
      case "invite":
        respuesta = await obtenerLeaderboardInvitaciones(interaction, interaction.user, data.settings);
        break;
      case "rep":
        respuesta = await obtenerLeaderboardReputacion(interaction.user);
        break;
      default:
        respuesta = "Tipo de leaderboard inválido. Elige entre `xp`, `invite` o `rep`";
    }
    await interaction.followUp(respuesta);
  },
};

// Crear un objeto Map para almacenar las entradas de caché
const cache = new Map();

async function obtenerLeaderboardXp({ guild }, author, settings) {
  // Crear una clave de caché usando el ID del servidor y el tipo de leaderboard
  const cacheKey = `${guild.id}:xp`;

  // Verificar si hay un resultado en caché para esta solicitud
  if (cache.has(cacheKey)) {
    // Devolver el resultado en caché si existe
    return cache.get(cacheKey);
  }

  if (!settings.stats.enabled) return "El leaderboard está deshabilitado en este servidor";

  const lb = await getXpLb(guild.id, 10);
  if (lb.length === 0) return "No hay usuarios en el leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const user = await author.client.users.fetch(lb[i].member_id);
      collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)}\n`;
    } catch (ex) {
      // Ignorar
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Leaderboard de XP" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setFooter({ text: `Solicitado por ${author.tag}` });

  // Almacenar el resultado en la caché para futuras solicitudes
  cache.set(cacheKey, { embeds: [embed] });
  return { embeds: [embed] };
}

async function obtenerLeaderboardInvitaciones({ guild }, author, settings) {
  // Crear una clave de caché usando el ID del servidor y el tipo de leaderboard
  const cacheKey = `${guild.id}:invite`;

  // Verificar si hay un resultado en caché para esta solicitud
  if (cache.has(cacheKey)) {
    // Devolver el resultado en caché si existe
    return cache.get(cacheKey);
  }

  if (!settings.invite.tracking) return "El seguimiento de invitaciones está deshabilitado en este servidor";

  const lb = await getInvitesLb(guild.id, 10);
  if (lb.length === 0) return "No hay usuarios en el leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const memberId = lb[i].member_id;
      if (memberId === "VANITY") collector += `**#${(i + 1).toString()}** - Vanity URL [${lb[i].invites}]\n`;
      else {
        const user = await author.client.users.fetch(lb[i].member_id);
        collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)} [${lb[i].invites}]\n`;
      }
    } catch (ex) {
      collector += `**#${(i + 1).toString()}** - UsuarioEliminado#0000 [${lb[i].invites}]\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Leaderboard de Invitaciones" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setFooter({ text: `Solicitado por ${author.tag}` });

  // Almacenar el resultado en la caché para futuras solicitudes
  cache.set(cacheKey, { embeds: [embed] });
  return { embeds: [embed] };
}

async function obtenerLeaderboardReputacion(author) {
  // Crear una clave de caché usando el ID del usuario y el tipo de leaderboard
  const cacheKey = `${author.id}:rep`;

  // Verificar si hay un resultado en caché para esta solicitud
  if (cache.has(cacheKey)) {
    // Devolver el resultado en caché si existe
    return cache.get(cacheKey);
  }

  const lb = await getReputationLb(10);
  if (lb.length === 0) return "No hay usuarios en el leaderboard";

  let collector = "";
  for (let i = 0; i < lb.length; i++) {
    try {
      const user = await author.client.users.fetch(lb[i].member_id);
      collector += `**#${(i + 1).toString()}** - ${escapeInlineCode(user.tag)} [${lb[i].rep}]\n`;
    } catch (ex) {
      collector += `**#${(i + 1).toString()}** - UsuarioEliminado#0000 [${lb[i].rep}]\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Leaderboard de Reputación" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(collector)
    .setFooter({ text: `Solicitado por ${author.tag}` });

  // Almacenar el resultado en la caché para futuras solicitudes
  cache.set(cacheKey, { embeds: [embed] });
  return { embeds: [embed] };
}
