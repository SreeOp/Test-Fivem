const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = async (interaction, ticketCategoryId) => {
    if (interaction.customId === 'create_ticket') {
        const guild = interaction.guild;
        const member = interaction.member;

        if (!ticketCategoryId) {
            await interaction.reply({ content: 'Ticket category not set. Please contact an admin.', ephemeral: true });
            return;
        }

        // Create a new ticket channel in the specified category
        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${member.user.username}`,
                type: ChannelType.GuildText,
                parent: ticketCategoryId,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                    },
                    {
                        id: guild.roles.cache.find(role => role.name === 'Support').id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                    }
                ]
            });

            await ticketChannel.send(`Hello ${member.user.username}, please describe your issue. A member of our support team will be with you shortly.`);
            await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
        } catch (error) {
            console.error('Failed to create ticket channel:', error);
            await interaction.reply({ content: 'Failed to create ticket channel. Please try again later.', ephemeral: true });
        }
    }
};
