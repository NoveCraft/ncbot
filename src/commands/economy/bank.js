const { ApplicationCommandOptionType } = require("discord.js");
const balance = require("./sub/balance");
const deposit = require("./sub/deposit");
const transfer = require("./sub/transfer");
const withdraw = require("./sub/withdraw");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "banco",
  description: "acceso a operaciones bancarias",
  category: "ECONOMÍA",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "saldo",
        description: "verifica tu saldo",
      },
      {
        trigger: "depositar <monedas>",
        description: "depositar monedas en tu cuenta bancaria",
      },
      {
        trigger: "retirar <monedas>",
        description: "retirar monedas de tu cuenta bancaria",
      },
      {
        trigger: "transferir <usuario> <monedas>",
        description: "transferir monedas a otro usuario",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "saldo",
        description: "verifica tu saldo de monedas",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "usuario",
            description: "nombre del usuario",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "depositar",
        description: "depositar monedas en tu cuenta bancaria",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "monedas",
            description: "número de monedas a depositar",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "retirar",
        description: "retirar monedas de tu cuenta bancaria",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "monedas",
            description: "número de monedas a retirar",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "transferir",
        description: "transferir monedas a otro usuario",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "usuario",
            description: "el usuario al que se deben transferir las monedas",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "monedas",
            description: "la cantidad de monedas a transferir",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0];
    let response;

    if (sub === "saldo") {
      const resolved = (await message.guild.resolveMember(args[1])) || message.member;
      response = await balance(resolved.user);
    }

    //
    else if (sub === "depositar") {
      const monedas = args.length && parseInt(args[1]);
      if (isNaN(monedas)) return message.safeReply("Proporciona un número válido de monedas que deseas depositar");
      response = await deposit(message.author, monedas);
    }

    //
    else if (sub === "retirar") {
      const monedas = args.length && parseInt(args[1]);
      if (isNaN(monedas)) return message.safeReply("Proporciona un número válido de monedas que deseas retirar");
      response = await withdraw(message.author, monedas);
    }

    //
    else if (sub === "transferir") {
      if (args.length < 3) return message.safeReply("Proporciona un usuario válido y monedas para transferir");
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply("Proporciona un usuario válido para transferir monedas");
      const monedas = parseInt(args[2]);
      if (isNaN(monedas)) return message.safeReply("Proporciona un número válido de monedas que deseas transferir");
      response = await transfer(message.author, target.user, monedas);
    }

    //
    else {
      return message.safeReply("Uso de comando inválido");
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    // saldo
    if (sub === "saldo") {
      const usuario = interaction.options.getUser("usuario") || interaction.user;
      response = await balance(usuario);
    }

    // depositar
    else if (sub === "depositar") {
      const monedas = interaction.options.getInteger("monedas");
      response = await deposit(interaction.user, monedas);
    }

    // retirar
    else if (sub === "retirar") {
      const monedas = interaction.options.getInteger("monedas");
      response = await withdraw(interaction.user, monedas);
    }

    // transferir
    else if (sub === "transferir") {
      const usuario = interaction.options.getUser("usuario");
      const monedas = interaction.options.getInteger("monedas");
      response = await transfer(interaction.user, usuario, monedas);
    }

    await interaction.followUp(response);
  },
};
