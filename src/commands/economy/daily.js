const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");
const { diffHours, getRemainingTime } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "diario",
  description: "recibe un bono diario",
  category: "ECONOMÍA",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await diario(message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await diario(interaction.user);
    await interaction.followUp(response);
  },
};

async function diario(user) {
  const userDb = await getUser(user);
  let racha = 0;

  if (userDb.daily.timestamp) {
    const lastUpdated = new Date(userDb.daily.timestamp);
    const difference = diffHours(new Date(), lastUpdated);
    if (difference < 24) {
      const nextUsage = lastUpdated.setHours(lastUpdated.getHours() + 24);
      return `Puedes volver a usar este comando en \`${getRemainingTime(nextUsage)}\``;
    }
    racha = userDb.daily.streak || racha;
    if (difference < 48) racha += 1;
    else racha = 0;
  }

  userDb.daily.streak = racha;
  userDb.coins += ECONOMY.DAILY_COINS;
  userDb.daily.timestamp = new Date();
  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `Recibiste ${ECONOMY.DAILY_COINS}${ECONOMY.CURRENCY} como tu recompensa diaria\n` +
        `**Saldo Actualizado:** ${userDb.coins}${ECONOMY.CURRENCY}`
    );

  return { embeds: [embed] };
}
