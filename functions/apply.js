const { MessageEmbed } = require('discord.js');

const PREFIX = '!'; // Prefix for bot commands
const APPLICATION_CHANNEL_ID = '1253323014003757189'; // ID of the channel where applications will be submitted

// Function to handle apply command
async function handleApply(client, message) {
    // Check if the command was sent in the application channel
    if (message.channel.id !== APPLICATION_CHANNEL_ID) {
        return message.reply('Please apply in the designated channel.');
    }

    // Create an embed message with a button to apply
    const embed = new MessageEmbed()
        .setTitle('Apply for Whitelist')
        .setDescription('Click the button below to apply for whitelist.')
        .setColor('#0099ff');

    const applyButton = new client.buttons.MessageButton()
        .setLabel('Apply Now')
        .setStyle('blurple')
        .setID('apply_button'); // Custom ID for identifying this button

    const row = new client.buttons.MessageActionRow().addComponents(applyButton);

    // Send the embed message with the button
    const sentMessage = await message.channel.send({ embed: embed, components: [row] });

    // Send a DM to the applicant with an acknowledgement
    const dmChannel = await message.clicker.user.createDM();
    const responseEmbed = new MessageEmbed()
        .setTitle('Application Submitted')
        .setDescription('Your application has been submitted successfully.')
        .setColor('#00ff00');
    dmChannel.send(responseEmbed);

    // Optionally, you can process the application further (e.g., log it, notify admins, etc.)
}

module.exports = {
    handleApply
};
