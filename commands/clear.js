module.exports = {
  name: 'clear',
  description: 'Clear a specified number of messages in the channel',
  async execute(message, args) {
    // Check if the command sender is a guild member
    if (!message.member) {
      message.reply('This command can only be used in a server.');
      return;
    }

    // Check if the user has permission to manage messages
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      message.reply('You do not have permission to use this command.');
      return;
    }

    // Check if a number of messages to delete is provided
    const deleteCount = parseInt(args[0], 10);

    // If deleteCount is not a number or less than 1, return error
    if (!deleteCount || deleteCount < 1 || deleteCount > 100) {
      return message.reply('Please provide a number between 1 and 100 for the number of messages to delete.');
    }

    // Delete the specified number of messages
    try {
      const fetched = await message.channel.messages.fetch({ limit: deleteCount });
      await message.channel.bulkDelete(fetched);
      message.channel.send(`Successfully deleted ${deleteCount} messages.`);
    } catch (error) {
      console.error('Error deleting messages:', error);
      message.channel.send('There was an error while trying to delete messages in this channel.');
    }
  },
};
