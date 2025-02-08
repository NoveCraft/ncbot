const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "voltear",
  description: "lanza una moneda o mensaje",
  category: "DIVERSIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "moneda",
        description: "lanza una moneda cara o cruz",
      },
      {
        trigger: "texto <entrada>",
        description: "invierte el mensaje dado",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "moneda",
        description: "lanza una moneda",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "texto",
        description: "invierte el mensaje dado",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "entrada",
            description: "texto a voltear",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "moneda") {
      const items = ["CARA", "CRUZ"];
      const toss = items[Math.floor(Math.random() * items.length)];

      message.channel.send({ embeds: [primerEmbed(message.author)] }).then((moneda) => {
        // 2do embed
        setTimeout(() => {
          moneda.edit({ embeds: [segundoEmbed()] }).catch(() => {});
          // 3er embed
          setTimeout(() => {
            moneda.edit({ embeds: [resultadoEmbed(toss)] }).catch(() => {});
          }, 2000);
        }, 2000);
      });
    }

    //
    else if (sub === "texto") {
      if (args.length < 2) return message.channel.send("Por favor ingresa un texto");
      const input = args.join(" ");
      const response = await voltearTexto(input);
      await message.safeReply(response);
    }

    // else
    else await message.safeReply("Uso incorrecto del comando");
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand("type");

    if (sub === "moneda") {
      const items = ["CARA", "CRUZ"];
      const toss = items[Math.floor(Math.random() * items.length)];
      await interaction.followUp({ embeds: [primerEmbed(interaction.user)] });

      setTimeout(() => {
        interaction.editReply({ embeds: [segundoEmbed()] }).catch(() => {});
        setTimeout(() => {
          interaction.editReply({ embeds: [resultadoEmbed(toss)] }).catch(() => {});
        }, 2000);
      }, 2000);
    }

    //
    else if (sub === "texto") {
      const input = interaction.options.getString("input");
      const response = await voltearTexto(input);
      await interaction.followUp(response);
    }
  },
};

const primerEmbed = (user) =>
  new EmbedBuilder().setColor(EMBED_COLORS.TRANSPARENT).setDescription(`${user.username}, comenzó un lanzamiento de moneda`);

const segundoEmbed = () => new EmbedBuilder().setDescription("La moneda está en el aire");

const resultadoEmbed = (toss) =>
  new EmbedBuilder()
    .setDescription(`>> **${toss} Gana** <<`)
    .setImage(toss === "CARA" ? "https://i.imgur.com/HavOS7J.png" : "https://i.imgur.com/u1pmQMV.png");

async function voltearTexto(text) {
  let builder = "";
  for (let i = 0; i < text.length; i += 1) {
    const letter = text.charAt(i);
    const a = NORMAL.indexOf(letter);
    builder += a !== -1 ? FLIPPED.charAt(a) : letter;
  }
  return builder;
}
