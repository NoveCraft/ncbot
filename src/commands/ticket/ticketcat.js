const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticketcat",
  description: "gestionar categorías de tickets",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "list",
        description: "listar todas las categorías de tickets",
      },
      {
        trigger: "add <categoría> | <roles_staff>",
        description: "añadir una categoría de ticket",
      },
      {
        trigger: "remove <categoría>",
        description: "eliminar una categoría de ticket",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "list",
        description: "listar todas las categorías de tickets",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "añadir una categoría de ticket",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "categoría",
            description: "el nombre de la categoría",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "roles_staff",
            description: "los roles del staff",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "remove",
        description: "eliminar una categoría de ticket",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "categoría",
            description: "el nombre de la categoría",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0].toLowerCase();
    let response;

    // list
    if (sub === "list") {
      response = listCategories(data);
    }

    // add
    else if (sub === "add") {
      const split = args.slice(1).join(" ").split("|");
      const category = split[0].trim();
      const staff_roles = split[1]?.trim();
      response = await addCategory(message.guild, data, category, staff_roles);
    }

    // remove
    else if (sub === "remove") {
      const category = args.slice(1).join(" ").trim();
      response = await removeCategory(data, category);
    }

    // invalid subcommand
    else {
      response = "Subcomando inválido.";
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // list
    if (sub === "list") {
      response = listCategories(data);
    }

    // add
    else if (sub === "add") {
      const category = interaction.options.getString("categoría");
      const staff_roles = interaction.options.getString("roles_staff");
      response = await addCategory(interaction.guild, data, category, staff_roles);
    }

    // remove
    else if (sub === "remove") {
      const category = interaction.options.getString("categoría");
      response = await removeCategory(data, category);
    }

    //
    else response = "Subcomando inválido";
    await interaction.followUp(response);
  },
};

function listCategories(data) {
  const categories = data.settings.ticket.categories;
  if (categories?.length === 0) return "No se encontraron categorías de tickets.";

  const fields = [];
  for (const category of categories) {
    const roleNames = category.staff_roles.map((r) => `<@&${r}>`).join(", ");
    fields.push({ name: category.name, value: `**Staff:** ${roleNames || "Ninguno"}` });
  }
  const embed = new EmbedBuilder().setAuthor({ name: "Categorías de Tickets" }).addFields(fields);
  return { embeds: [embed] };
}

async function addCategory(guild, data, category, staff_roles) {
  if (!category) return "¡Uso inválido! Falta el nombre de la categoría.";

  // check if category already exists
  if (data.settings.ticket.categories.find((c) => c.name === category)) {
    return `La categoría \`${category}\` ya existe.`;
  }

  const staffRoles = (staff_roles?.split(",")?.map((r) => r.trim()) || []).filter((r) => guild.roles.cache.has(r));

  data.settings.ticket.categories.push({ name: category, staff_roles: staffRoles });
  await data.settings.save();

  return `Categoría \`${category}\` añadida.`;
}

async function removeCategory(data, category) {
  const categories = data.settings.ticket.categories;
  // check if category exists
  if (!categories.find((c) => c.name === category)) {
    return `La categoría \`${category}\` no existe.`;
  }

  data.settings.ticket.categories = categories.filter((c) => c.name !== category);
  await data.settings.save();

  return `Categoría \`${category}\` eliminada.`;
}
