const { Command } = require("klasa");
const { MessageEmbed } = require("discord.js");
const { getAttachment } = require("../../utils/utils.js");

class Quote extends Command {
  constructor(...args) {
    super(...args, {
      description: "Quote a message by id",
      runIn: ["text"],
      aliases: ["quotemsg", "msg", "message"],
      usage: "<message:message>",
      requiredPermissions: ["EMBED_LINKS"]
    });
  }

  async run(msg, [message]) {
    const embed = new MessageEmbed()
      .setTitle("Message Quote")
      .setDescription(message.content)
      .setTimestamp(message.createdAt)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setThumbnail(message.author.displayAvatarURL())
      .setImage(getAttachment(message))
      .setColor(0xff0000);
    return msg.send({ embed });
  }
}

module.exports = Quote;
