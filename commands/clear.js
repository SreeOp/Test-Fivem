module.exports = {
  name: 'clear',
  description: 'Delete a specified number of messages from the channel',
  async execute(message, args) {
    // Check if the user has the necessary permissions
    if (!message.member.hasPermission('MANAGE_MESSAGES')) {
      message.reply('You do not have permission to use this command.');
      return;
    }

    // Check if the user provided the number of messages to delete
    if (!args[0]) {
      message.reply('Please specify the number of messages to delete.');
      return;
    }

    // Convert the argument to an integer
    const amount = parseInt(args[0]);

    // Check if the argument is a valid number and within the allowed range
    if (isNaN(amount) || amount <= 0 || amount > 100) {
      message.reply('Please provide a number between 1 and 100.');
      return;
    }

    // Attempt to delete the specified number of messages
    try {
      // Fetch the messages to be deleted
      const fetched = await message.channel.messages.fetch({ limit: amount });
      // Delete the messages
      await message.channel.bulkDelete(fetched);
      // Send a confirmation message that disappears after a short time
      const confirmationMessage = await message.channel.send(`Deleted ${fetched.size} messages.`);
      setTimeout(() => confirmationMessage.delete(), 5000); // Deletes the confirmation message after 5 seconds
    } catch (error) {
      console.error(`Error deleting messages: ${error}`);
      message.reply('There was an error trying to delete messages in this channel.');
    }
  },
};
