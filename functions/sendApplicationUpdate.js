// functions/sendApplicationUpdate.js
const { EmbedBuilder } = require('discord.js');

module.exports = async function sendApplicationUpdate(interaction, member, client, action, acceptedChannelId, pendingChannelId, rejectedChannelId) {
    let embed;
    let roleID;
    let channelID;

    if (action === 'acceptButton') {
        embed = new EmbedBuilder()
            .setTitle('Application Update')
            .setDescription('Your application status: Accepted')
            .setColor('#00ff00')
            .setImage('https://media.discordapp.net/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667ad634&is=667984b4&hm=7cd86a2366c7c0b217ab3b83a21ad954c504a977f1fdc0d959912e0ef2346d90&=&format=webp&quality=lossless&width=544&height=192'); // Replace with your image URL
        roleID = '1253347204601741342'; // Replace with your role ID for accepted applications
        channelID = acceptedChannelId; // Channel ID for accepted applications
    } else if (action === 'pendingButton') {
        embed = new EmbedBuilder()
            .setTitle('Application Update')
            .setDescription('Your application status: Pending')
            .setColor('#ffff00')
            .setImage('https://media.discordapp.net/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667ad634&is=667984b4&hm=7cd86a2366c7c0b217ab3b83a21ad954c504a977f1fdc0d959912e0ef2346d90&=&format=webp&quality=lossless&width=544&height=192'); // Replace with your image URL
        roleID = '1253347728955361412'; // Replace with your role ID for pending applications
        channelID = pendingChannelId; // Channel ID for pending applications
    } else if (action === 'rejectButton') {
        embed = new EmbedBuilder()
            .setTitle('Application Update')
            .setDescription('Your application status: Rejected')
            .setColor('#ff0000')
            .setImage('https://media.discordapp.net/attachments/1056903195961610275/1254445277759148172/096ff227-e675-4307-a969-e2aac7a4c7ba-2.png?ex=667ad634&is=667984b4&hm=7cd86a2366c7c0b217ab3b83a21ad954c504a977f1fdc0d959912e0ef2346d90&=&format=webp&quality=lossless&width=544&height=192'); // Replace with your image URL
        roleID = '1253348102813292514'; // Replace with your role ID for rejected applications
        channelID = rejectedChannelId; // Channel ID for rejected applications
    }

    if (embed && roleID && channelID) {
        const role = interaction.guild.roles.cache.get(roleID);

        if (role) {
            await member.roles.add(role);
        }

        const updateEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
        updateEmbed.setFooter({ text: `Status: ${embed.data.description}` })
            .setColor(embed.data.color);

        await interaction.update({ embeds: [updateEmbed], components: [] });
        const channel = client.channels.cache.get(channelID);
        if (channel) {
            await channel.send({ embeds: [embed], content: `<@${member.user.id}>` });
        }

        try {
            await member.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Could not send DM to ${member.user.tag}:`, error);
        }
    }
};
