module.exports = {
  name: 'dm',
  description: 'Send a direct message to a specified user',
  async execute(message, args) {
    // Check if the user provided a user mention and a message
    if (args.length < 2) {
      message.reply('Please mention a user and provide a message to send.');
      return;
    }

    // Extract the user mention and the message to send
    const userMention = args.shift();
    const messageToSend = args.join(' ');

    // Extract the user ID from the mention
    const userId = userMention.replace(/[<@!>]/g, '');

    try {
      // Fetch the user by ID
      const user = await message.client.users.fetch(userId);

      // Send the direct message
      await user.send(messageToSend);

      // Confirm the message was sent
      message.reply(`Message sent to ${user.tag}`);
    } catch (error) {
      console.error(`Error sending DM: ${error}`);
      message.reply('There was an error trying to send the DM. Please make sure the user ID is correct and that the bot can send DMs.');
    }
  },
};
