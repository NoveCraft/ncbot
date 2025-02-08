const { getMember } = require("@schemas/Member");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "importarinvitaciones",
  description: "agregar invitaciones existentes del servidor a los usuarios",
  category: "INVITACIÓN",
  botPermissions: ["ManageGuild"],
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "[@miembro]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "usuario",
        description: "el usuario para importar invitaciones",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const objetivo = await message.guild.resolveMember(args[0]);
    const respuesta = await importarInvitaciones(message, objetivo?.user);
    await message.safeReply(respuesta);
  },

  async interactionRun(interaction) {
    const usuario = interaction.options.getUser("usuario");
    const respuesta = await importarInvitaciones(interaction, usuario);
    await interaction.followUp(respuesta);
  },
};

async function importarInvitaciones({ guild }, usuario) {
  if (usuario && usuario.bot) return "¡Ups! No puedes importar invitaciones para bots";

  const invitaciones = await guild.invites.fetch({ cache: false });

  // almacenamiento temporal para invitaciones
  const mapaTemporal = new Map();

  for (const invitacion of invitaciones.values()) {
    const invitador = invitacion.inviter;
    if (!invitador || invitacion.uses === 0) continue;
    if (!mapaTemporal.has(invitador.id)) mapaTemporal.set(invitador.id, invitacion.uses);
    else {
      const usos = mapaTemporal.get(invitador.id) + invitacion.uses;
      mapaTemporal.set(invitador.id, usos);
    }
  }

  for (const [userId, usos] of mapaTemporal.entries()) {
    const miembroDb = await getMember(guild.id, userId);
    miembroDb.invite_data.added += usos;
    await miembroDb.save();
  }

  return `¡Listo! Invitaciones previas agregadas a ${usuario ? usuario.username : "todos los miembros"}`;
}
