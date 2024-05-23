module.exports = {
  name: 'giverole',
  description: 'Give a role to a user for a specified amount of time',
  async execute(message, args) {
    // Check if the command is used within a server
    if (!message.guild) {
      return message.reply('This command can only be used in a server.');
    }

    // Check if the user has the necessary permissions
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Check if the correct number of arguments are provided
    if (args.length < 3) {
      return message.reply('Please mention a user, specify a role, and provide a duration.');
    }

    // Extract user mention, role mention, and duration from arguments
    const userMention = args[0];
    const roleMention = args[1];
    const duration = args[2];

    // Extract the user ID from the mention
    const userId = userMention.replace(/[<@!>]/g, '');

    // Extract the role ID from the mention
    const roleId = roleMention.replace(/[<@&>]/g, '');

    // Fetch the user and role objects
    let user;
    let role;
    try {
      user = await message.guild.members.fetch(userId);
      role = await message.guild.roles.fetch(roleId);
    } catch (error) {
      return message.reply('User or role not found.');
    }

    // Function to parse the duration string into milliseconds
    const parseDuration = (duration) => {
      const regex = /^(\d+)([smhd])$/; // regex to match patterns like "10s", "5m", "2h", "1d"
      const match = duration.match(regex);
      if (!match) return null;

      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case 's':
          return value * 1000; // seconds to milliseconds
        case 'm':
          return value * 60 * 1000; // minutes to milliseconds
        case 'h':
          return value * 60 * 60 * 1000; // hours to milliseconds
        case 'd':
          return value * 24 * 60 * 60 * 1000; // days to milliseconds
        default:
          return null;
      }
    };

    const durationMs = parseDuration(duration);

    if (!durationMs) {
      return message.reply('Please provide a valid duration (e.g., 10s, 5m, 2h, 1d).');
    }

    try {
      // Add the role to the user
      await user.roles.add(role);
      message.reply(`Added role ${role.name} to ${user.displayName} for ${duration}.`);

      // Set a timeout to remove the role after the specified duration
      setTimeout(async () => {
        try {
          await user.roles.remove(role);
          message.channel.send(`Removed role ${role.name} from ${user.displayName} after ${duration}.`);
        } catch (error) {
          console.error(`Error removing role: ${error}`);
          message.channel.send(`There was an error removing the role from ${user.displayName}.`);
        }
      }, durationMs);
    } catch (error) {
      console.error(`Error adding role: ${error}`);
      message.reply('There was an error trying to add the role to the user.');
    }
  },
};
