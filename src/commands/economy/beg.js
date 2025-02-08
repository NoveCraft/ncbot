const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "mendigar",
  description: "mendigar de alguien",
  category: "ECONOMÍA",
  cooldown: 21600,
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await mendigar(message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await mendigar(interaction.user);
    await interaction.followUp(response);
  },
};

async function mendigar(user) {
  let usuarios = [
    "PewDiePie",
    "T-Series",
    "Sans",
    "RLX",
    "Pro Gamer 711",
    "Zenitsu",
    "Jake Paul",
    "Kaneki Ken",
    "KSI",
    "Naruto",
    "Mr. Beast",
    "Tu Mamá",
    "Una Persona Pobre",
    "Giyu Tomiaka",
    "Embajada de Beijing",
    "Una Mamá Asiática IDK :v",
    "Tu Hermanastra",
    "Jin Mori",
    "Sakura (AKA Bote de Basura)",
    "Hammy El Hámster",
    "Kakashi Sensei",
    "Minato",
    "Tanjiro",
    "ZHC",
    "El IRS",
    "Joe Mama",
  ];

  let cantidad = Math.floor(Math.random() * `${ECONOMY.MAX_BEG_AMOUNT}` + `${ECONOMY.MIN_BEG_AMOUNT}`);
  const userDb = await getUser(user);
  userDb.coins += cantidad;
  await userDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `${user.username}`, iconURL: user.displayAvatarURL() })
    .setDescription(
      `**${usuarios[Math.floor(Math.random() * usuarios.length)]}** te donó **${cantidad}** ${ECONOMY.CURRENCY}\n` +
        `**Saldo Actualizado:** **${userDb.coins}** ${ECONOMY.CURRENCY}`
    );

  return { embeds: [embed] };
}
