const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "nick",
  description: "comandos de apodo",
  category: "MODERACIÓN",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "set <@member> <name>",
        description: "establece el apodo del miembro especificado",
      },
      {
        trigger: "reset <@member>",
        description: "restablece el apodo de un miembro",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "cambia el apodo de un miembro",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "el miembro cuyo apodo deseas establecer",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "name",
            description: "el apodo a establecer",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "restablece el apodo de un miembro",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "el miembro cuyo apodo deseas restablecer",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("No se pudo encontrar un miembro que coincida");
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply("Por favor especifica un apodo");

      const response = await nickname(message, target, name);
      return message.safeReply(response);
    }

    //
    else if (sub === "reset") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("No se pudo encontrar un miembro que coincida");

      const response = await nickname(message, target);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction) {
    const name = interaction.options.getString("name");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));

    const response = await nickname(interaction, target, name);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name) {
  if (!canModerate(member, target)) {
    return `¡Ups! No puedes gestionar el apodo de ${target.user.username}`;
  }
  if (!canModerate(guild.members.me, target)) {
    return `¡Ups! No puedo gestionar el apodo de ${target.user.username}`;
  }

  try {
    await target.setNickname(name);
    return `Apodo de ${target.user.username} ${name ? "cambiado" : "restablecido"} con éxito`;
  } catch (ex) {
    return `No se pudo ${name ? "cambiar" : "restablecer"} el apodo de ${target.displayName}. ¿Proporcionaste un nombre válido?`;
  }
}
