// Define a cooldown map to track when users last said "hi"
const cooldowns = new Map();

module.exports = {
  name: 'hi',
  description: 'Say hi to the bot',
  execute(message, args) {
    // Check if the user is on cooldown
    if (cooldowns.has(message.author.id)) {
      message.reply('Please wait before saying hi again.');
      return;
    }

    // Reply with "Hello!"
    message.reply('Hello!');
    
    // Add the user to cooldown for 10 seconds (adjust as needed)
    cooldowns.set(message.author.id, true);
    setTimeout(() => {
      cooldowns.delete(message.author.id);
    }, 10000); // 10000 milliseconds = 10 seconds
  },
};
