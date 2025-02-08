const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pokedex",
  description: "muestra información de un pokémon",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<pokemon>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "pokemon",
        description: "nombre del pokémon para obtener información",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const pokemon = args.join(" ");
    const response = await pokedex(pokemon);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const pokemon = interaction.options.getString("pokemon");
    const response = await pokedex(pokemon);
    await interaction.followUp(response);
  },
};

async function pokedex(pokemon) {
  const response = await getJson(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
  if (response.status === 404) return "```El pokémon dado no se encuentra```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data[0];

  const embed = new EmbedBuilder()
    .setTitle(`Pokédex - ${json.name}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.sprite)
    .setDescription(
      stripIndent`
            ♢ **ID**: ${json.number}
            ♢ **Nombre**: ${json.name}
            ♢ **Especie**: ${json.species}
            ♢ **Tipo(s)**: ${json.types}
            ♢ **Habilidades (normales)**: ${json.abilities.normal}
            ♢ **Habilidades (ocultas)**: ${json.abilities.hidden}
            ♢ **Grupo(s) de huevos**: ${json.eggGroups}
            ♢ **Género**: ${json.gender}
            ♢ **Altura**: ${json.height} pies de altura
            ♢ **Peso**: ${json.weight}
            ♢ **Etapa de evolución actual**: ${json.family.evolutionStage}
            ♢ **Línea de evolución**: ${json.family.evolutionLine}
            ♢ **¿Es inicial?**: ${json.starter}
            ♢ **¿Es legendario?**: ${json.legendary}
            ♢ **¿Es mítico?**: ${json.mythical}
            ♢ **¿Generación?**: ${json.gen}
            `
    )
    .setFooter({ text: json.description });

  return { embeds: [embed] };
}
