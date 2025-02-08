const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getWarningLogs, clearWarningLogs } = require("@schemas/ModLog");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "warnings",
  description: "lista o borra advertencias de un usuario",
  category: "MODERACIÓN",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "list [member]",
        description: "lista todas las advertencias de un usuario",
      },
      {
        trigger: "clear <member>",
        description: "borra todas las advertencias de un usuario",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "list",
        description: "lista todas las advertencias de un usuario",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "el miembro objetivo",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: "clear",
        description: "borra todas las advertencias de un usuario",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "el miembro objetivo",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    let response = "";

    if (sub === "list") {
      const target = (await message.guild.resolveMember(args[1], true)) || message.member;
      if (!target) return message.safeReply(`No se encontró ningún usuario que coincida con ${args[1]}`);
      response = await listWarnings(target, message);
    }

    //
    else if (sub === "clear") {
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply(`No se encontró ningún usuario que coincida con ${args[1]}`);
      response = await clearWarnings(target, message);
    }

    // else
    else {
      response = `Comando inválido ${sub}`;
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response = "";

    if (sub === "list") {
      const user = interaction.options.getUser("user");
      const target = (await interaction.guild.members.fetch(user.id)) || interaction.member;
      response = await listWarnings(target, interaction);
    }

    //
    else if (sub === "clear") {
      const user = interaction.options.getUser("user");
      const target = await interaction.guild.members.fetch(user.id);
      response = await clearWarnings(target, interaction);
    }

    // else
    else {
      response = `Comando inválido ${sub}`;
    }

    await interaction.followUp(response);
  },
};

async function listWarnings(target, { guildId }) {
  if (!target) return "No se proporcionó ningún usuario";
  if (target.user.bot) return "Los bots no tienen advertencias";

  const warnings = await getWarningLogs(guildId, target.id);
  if (!warnings.length) return `${target.user.username} no tiene advertencias`;

  const acc = warnings.map((warning, i) => `${i + 1}. ${warning.reason} [Por ${warning.admin.username}]`).join("\n");
  const embed = new EmbedBuilder({
    author: { name: `Advertencias de ${target.user.username}` },
    description: acc,
  });

  return { embeds: [embed] };
}

async function clearWarnings(target, { guildId }) {
  if (!target) return "No se proporcionó ningún usuario";
  if (target.user.bot) return "Los bots no tienen advertencias";

  const memberDb = await getMember(guildId, target.id);
  memberDb.warnings = 0;
  await memberDb.save();

  await clearWarningLogs(guildId, target.id);
  return `Las advertencias de ${target.user.username} han sido borradas`;
}
