const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { getRandomInt } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "apostar",
  description: "prueba tu suerte apostando",
  category: "ECONOMÍA",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<cantidad>",
    minArgsCount: 1,
    aliases: ["tragaperras"],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "monedas",
        description: "número de monedas a apostar",
        required: true,
        type: ApplicationCommandOptionType.Integer,
      },
    ],
  },

  async messageRun(message, args) {
    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount)) return message.safeReply("La cantidad de la apuesta debe ser un número válido");
    const response = await apostar(message.author, betAmount);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const betAmount = interaction.options.getInteger("monedas");
    const response = await apostar(interaction.user, betAmount);
    await interaction.followUp(response);
  },
};

function getEmoji() {
  const ran = getRandomInt(9);
  switch (ran) {
    case 1:
      return "\uD83C\uDF52";
    case 2:
      return "\uD83C\uDF4C";
    case 3:
      return "\uD83C\uDF51";
    case 4:
      return "\uD83C\uDF45";
    case 5:
      return "\uD83C\uDF49";
    case 6:
      return "\uD83C\uDF47";
    case 7:
      return "\uD83C\uDF53";
    case 8:
      return "\uD83C\uDF50";
    case 9:
      return "\uD83C\uDF4D";
    default:
      return "\uD83C\uDF52";
  }
}

function calculateReward(amount, var1, var2, var3) {
  if (var1 === var2 && var2.equals === var3) return 3 * amount;
  if (var1 === var2 || var2 === var3 || var1 === var3) return 2 * amount;
  return 0;
}

async function apostar(user, betAmount) {
  if (isNaN(betAmount)) return "La cantidad de la apuesta debe ser un número válido";
  if (betAmount < 0) return "La cantidad de la apuesta no puede ser negativa";
  if (betAmount < 10) return "La cantidad de la apuesta no puede ser menor a 10";

  const userDb = await getUser(user);
  if (userDb.coins < betAmount)
    return `¡No tienes suficientes monedas para apostar!\n**Saldo de monedas:** ${userDb.coins || 0}${ECONOMY.CURRENCY}`;

  const slot1 = getEmoji();
  const slot2 = getEmoji();
  const slot3 = getEmoji();

  const str = `
    **Cantidad Apostada:** ${betAmount}${ECONOMY.CURRENCY}
    **Multiplicador:** 2x
    ╔══════════╗
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ‎‎‎‎║
    ╠══════════╣
    ║ ${slot1} ║ ${slot2} ║ ${slot3} ⟸
    ╠══════════╣
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()} ║
    ╚══════════╝
    `;

  const reward = calculateReward(betAmount, slot1, slot2, slot3);
  const result = (reward > 0 ? `Ganaste: ${reward}` : `Perdiste: ${betAmount}`) + ECONOMY.CURRENCY;
  const balance = reward - betAmount;

  userDb.coins += balance;
  await userDb.save();

  const embed = new EmbedBuilder()
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setColor(EMBED_COLORS.TRANSPARENT)
    .setThumbnail("https://i.pinimg.com/originals/9a/f1/4e/9af14e0ae92487516894faa9ea2c35dd.gif")
    .setDescription(str)
    .setFooter({ text: `${result}\nSaldo de la cartera actualizado: ${userDb?.coins}${ECONOMY.CURRENCY}` });

  return { embeds: [embed] };
}
