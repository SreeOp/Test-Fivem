module.exports = {
  name: 'rp',
  description: 'Replies to a message and deletes the command message',
  async execute(message, args) {
    if (args.length === 0) {
      message.reply('Please provide a message to reply to.');
      return;
    }

    const messageId = args[0]; // Assume the first argument is the message ID to reply to
    const replyContent = args.slice(1).join(' '); // The rest of the arguments are the reply content

    if (!replyContent) {
      message.reply('Please provide a reply message.');
      return;
    }

    try {
      const referencedMessage = await message.channel.messages.fetch(messageId);

      if (referencedMessage) {
        await referencedMessage.reply(replyContent);
        await message.delete();
      } else {
        message.reply('Message not found.');
      }
    } catch (error) {
      console.error('Error fetching or replying to message:', error);
      message.reply('There was an error trying to reply to the message.');
    }
  },
};
