const db = require("../../../utils/schemas/db.js");

module.exports = async (client, role) => {
    const guildID = role.guild.id;
    const roleID = role.id;

    db.updateOne({ guildID: guildID }, {
        $pull: { reactionRoles: { roleID: roleID } }
    }).catch(err => err);
}