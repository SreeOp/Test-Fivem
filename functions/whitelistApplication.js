const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
    client.on('ready', async () => {
        const channel = client.channels.cache.get('1253323014003757189'); // Replace with your channel ID
        const embed = new EmbedBuilder()
            .setTitle('FiveM Whitelist Application')
            .setDescription('Click the button below to apply for the whitelist.');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('apply_whitelist')
                    .setLabel('Apply')
                    .setStyle(ButtonStyle.Primary),
            );

        await channel.send({ embeds: [embed], components: [row] });
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'apply_whitelist') {
            await interaction.reply({ content: 'Please answer the following questions for your application:', ephemeral: true });

            // Collect application details
            const filter = (m) => m.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

            let applicationDetails = [];

            collector.on('collect', (m) => {
                applicationDetails.push(m.content);
                if (applicationDetails.length === 3) { // Assuming 3 questions
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                const applicationChannel = client.channels.cache.get('1253323112972550185'); // Replace with your application review channel ID
                const applicationEmbed = new EmbedBuilder()
                    .setTitle('New Whitelist Application')
                    .setDescription(`Application from ${interaction.user.tag}`)
                    .addFields(
                        { name: 'Question 1', value: applicationDetails[0] },
                        { name: 'Question 2', value: applicationDetails[1] },
                        { name: 'Question 3', value: applicationDetails[2] }
                    );

                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('accept_application')
                            .setLabel('Accept')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('pending_application')
                            .setLabel('Pending')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('reject_application')
                            .setLabel('Reject')
                            .setStyle(ButtonStyle.Danger),
                    );

                await applicationChannel.send({ embeds: [applicationEmbed], components: [actionRow] });
            });
        }

        if (['accept_application', 'pending_application', 'reject_application'].includes(interaction.customId)) {
            const userId = interaction.message.embeds[0].description.split(' ')[2];
            const user = await client.users.fetch(userId);
            let dmMessage;
            let role;

            switch (interaction.customId) {
                case 'accept_application':
                    dmMessage = 'Your application has been accepted!';
                    role = '1253347204601741342'; // Replace with your role ID
                    break;
                case 'pending_application':
                    dmMessage = 'Your application is pending review.';
                    role = '1253347271718735882'; // Replace with your role ID
                    break;
                case 'reject_application':
                    dmMessage = 'Your application has been rejected.';
                    role = null;
                    break;
            }

            await user.send(dmMessage);

            if (role) {
                const guild = client.guilds.cache.get('GUILD_ID'); // Replace with your guild ID
                const member = await guild.members.fetch(userId);
                await member.roles.add(role);
            }

            await interaction.update({ content: `Application ${interaction.customId.replace('_application', '')}`, components: [] });
        }
    });
};
