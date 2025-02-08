const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "contador",
  description: "configurar canal de contador en el servidor",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  botPermissions: ["ManageChannels"],
  command: {
    enabled: true,
    usage: "<tipo> <nombre-del-canal>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "tipo",
        description: "tipo de canal de contador",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "usuarios",
            value: "USERS",
          },
          {
            name: "miembros",
            value: "MEMBERS",
          },
          {
            name: "bots",
            value: "BOTS",
          },
        ],
      },
      {
        name: "nombre",
        description: "nombre del canal de contador",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args, data) {
    const tipo = args[0].toUpperCase();
    if (!tipo || !["USERS", "MEMBERS", "BOTS"].includes(tipo)) {
      return message.safeReply("¡Argumentos incorrectos! Tipos de contador: `usuarios/miembros/bots`");
    }
    if (args.length < 2) return message.safeReply("¡Uso incorrecto! No proporcionaste nombre");
    args.shift();
    let nombreCanal = args.join(" ");

    const response = await setupCounter(message.guild, tipo, nombreCanal, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const tipo = interaction.options.getString("tipo");
    const nombre = interaction.options.getString("nombre");

    const response = await setupCounter(interaction.guild, tipo.toUpperCase(), nombre, data.settings);
    return interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} tipo
 * @param {string} nombre
 * @param {object} settings
 */
async function setupCounter(guild, tipo, nombre, settings) {
  let nombreCanal = nombre;

  const stats = await guild.fetchMemberStats();
  if (tipo === "USERS") nombreCanal += ` : ${stats[0]}`;
  else if (tipo === "MEMBERS") nombreCanal += ` : ${stats[2]}`;
  else if (tipo === "BOTS") nombreCanal += ` : ${stats[1]}`;

  const vc = await guild.channels.create({
    name: nombreCanal,
    type: ChannelType.GuildVoice,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: ["Connect"],
      },
      {
        id: guild.members.me.id,
        allow: ["ViewChannel", "ManageChannels", "Connect"],
      },
    ],
  });

  const exists = settings.counters.find((v) => v.counter_type.toUpperCase() === tipo);
  if (exists) {
    exists.name = nombre;
    exists.channel_id = vc.id;
  } else {
    settings.counters.push({
      counter_type: tipo,
      channel_id: vc.id,
      name: nombre,
    });
  }

  settings.data.bots = stats[1];
  await settings.save();

  return "¡Configuración guardada! Canal de contador creado";
}
