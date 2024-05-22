module.exports = {
  name: 'giverole',
  description: 'Give a role to a user for a specified amount of time',
  async execute(message, args) {
    // Check if the user has the necessary permissions
    if (!message.member.hasPermission('MANAGE_ROLES')) {
      message.reply('You do not have permission to use this command.');
      return;
    }

    // Check if the correct number of arguments are provided
    if (args.length < 3) {
      message.reply('Please mention a user, specify a role, and provide a duration.');
      return;
    }

    // Extract user mention, role name, and duration from arguments
    const userMention = args[0];
    const roleName = args[1];
    const duration = args[2];

    // Extract the user ID from the mention
    const userId = userMention.replace(/[<@!>]/g, '');

    // Fetch the user and role objects
    const user = await message.guild.members.fetch(userId);
    const role = message.guild.roles.cache.find(role => role.name === roleName);

    if (!user) {
      message.reply('User not found.');
      return;
    }

    if (!role) {
      message.reply('Role not found.');
      return;
    }

    // Function to parse the duration string into milliseconds
    const parseDuration = (duration) => {
      const regex = /^(\d+)([smhd])$/;
      const match = duration.match(regex);
      if (!match) return null;

      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case 's':
          return value * 1000;
        case 'm':
          return value * 60 * 1000;
        case 'h':
          return value * 60 * 60 * 1000;
        case 'd':
          return value * 24 * 60 * 60 * 1000;
        default:
          return null;
      }
    };

    const durationMs = parseDuration(duration);

    if (!durationMs) {
      message.reply('Please provide a valid duration (e.g., 10s, 5m, 2h, 1d).');
      return;
    }

    try {
      // Add the role to the user
      await user.roles.add(role);
      message.reply(`Added role ${roleName} to ${user.displayName} for ${duration}.`);

      // Set a timeout to remove the role after the specified duration
      setTimeout(async () => {
        try {
          await user.roles.remove(role);
          message.channel.send(`Removed role ${roleName} from ${user.displayName} after ${duration}.`);
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
