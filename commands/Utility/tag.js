const { Command, Timestamp } = require("klasa");
const { MessageEmbed } = require("discord.js");

class Tag extends Command {
  constructor(...args) {
    super(...args, {
      description: "Manage custom guild tags",
      usage: "<list|all|create|remove|new|info|delete|tag:string> [args:string] [...]",
      extendedHelp: "Example:\nlb.tag create something this is some text\nlb.tag something\nlb.tag remove something\nlb.tag info something",
      usageDelim: " ",
      runIn: ["text"],
      aliases: ["tags"],
      cooldown: 5
    });
    this.timestamp = new Timestamp("d MMMM YYYY");
  }
  
  async run(msg, [action, ...args]) {
    if(["list", "all"].includes(action)) return this.list(msg);
    if(["remove", "delete"].includes(action)) return this.remove(msg, args[0]);
    if(["create", "new"].includes(action)) return this.create(msg, args);
    if(action === "info") return this.info(msg, args[0]);
    return this.get(msg, action);
  }
  
  async remove(msg, key) {
    if(!key) throw "Tag name is required.";
    const tag = msg.guild.settings.tags.find((x) => x.name === key);
    if(!tag) throw "That tag doesn't exist.";
    if(tag.user !== msg.author.id && !await msg.hasAtLeastPermissionLevel(6)) throw "You cannot delete that tag.";
    await msg.guild.settings.update("tags", tag, { action: "remove" });
    return msg.send(`Successfully deleted the tag with the name **${tag.name}**`);
  }
  
  async create(msg, [name, ...content]) {
    if(!name) throw "Name is a required argument.";
    if(!content.length) throw "Content is a required argument";
    if(msg.guild.settings.tags.find((x) => x.name === name)) throw "A tag with that name already exists.";
    if(["delete", "create", "remove", "new", "list", "all", "info"].includes(name)) throw "That is a reserved name.";
    if(this.client.commands.has(name) || this.client.commands.aliases.has(name)) throw "Tag names must not have a name of a command.";
    const obj = { user: msg.author.id, date: Date.now(), content: content.join(" "), name, uses: 0 };
    await msg.guild.settings.update("tags", obj, { action: "add" });
    return msg.send(`Created a new tag with the name **${name}**`);
  }
  
  async list(msg) {
    let counter = 1;
    const tags = msg.guild.settings.tags.map((x) => `${counter++}. **${x.name}**`);
    if(!tags.length) throw `There isn't any tags here yet, get started with \`${msg.guild.settings.prefix}tag create\``;
    const embed = new MessageEmbed()
      .setTitle("Tags List")
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
      .setDescription(tags.join("\n"))
      .setColor(0xff0000);
    return msg.send({ embed });
  }
  
  async info(msg, key) {
    if(!key) throw "Tag name is required.";
    const tag = msg.guild.settings.tags.find((x) => x.name === key);
    if(!tag) throw "That tag doesn't exist.";
    const user = msg.guild.members.get(tag.user);
    const embed = new MessageEmbed()
      .setTitle(`Info for tag: ${tag.name}`)
      .addField("Creator", user ? user.user.tag : "Unknown")
      .addField("Name", tag.name)
      .addField("Created At", this.timestamp.display(new Date(tag.date)))
      .addField("Uses", tag.uses)
      .setColor(0xff0000)
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL());
    return msg.send({ embed });
  }
  
  async get(msg, key) {
    const tag = msg.guild.settings.tags.find((x) => x.name === key);
    if(!tag) throw "That tag doesn't exist.";
    await msg.guild.settings.update("tags", tag, { action: "remove" });
    tag.uses++;
    await msg.guild.settings.update("tags", tag, { action: "add" });
    return msg.send(tag.content.replace(/@(everyone|here)/g, "@\u200b$1"));
  }
}

module.exports = Tag;
