const { ApplicationCommandOptionType } = require("discord.js");

const discordTogether = [
  "askaway",
  "awkword",
  "betrayal",
  "bobble",
  "checkers",
  "chess",
  "chessdev",
  "doodlecrew",
  "fishing",
  "land",
  "lettertile",
  "meme",
  "ocho",
  "poker",
  "puttparty",
  "puttpartyqa",
  "sketchheads",
  "sketchyartist",
  "spellcast",
  "wordsnack",
  "youtube",
  "youtubedev",
];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "juntos",
  description: "discord juntos",
  category: "DIVERSIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    aliases: ["discordjuntos"],
    usage: "<juego>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "tipo",
        description: "tipo",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: discordTogether.map((game) => ({ name: game, value: game })),
      },
    ],
  },

  async messageRun(message, args) {
    const input = args[0];
    const response = await obtenerInvitacionJuntos(message.member, input);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("tipo");
    const response = await obtenerInvitacionJuntos(interaction.member, choice);
    await interaction.followUp(response);
  },
};

async function obtenerInvitacionJuntos(member, choice) {
  choice = choice.toLowerCase();

  const vc = member.voice.channel?.id;
  if (!vc) return "Debes estar en un canal de voz para usar este comando.";

  if (!discordTogether.includes(choice)) {
    return `Juego inválido.\nJuegos válidos: ${discordTogether.join(", ")}`;
  }

  const invite = await member.client.discordTogether.createTogetherCode(vc, choice);
  return `${invite.code}`;
}
