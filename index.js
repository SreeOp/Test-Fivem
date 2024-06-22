const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

client.commands = new Collection();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'apply_whitelist') {
            const modal = new ModalBuilder()
                .setCustomId('whitelist_application')
                .setTitle('Whitelist Application');

            const charNameInput = new TextInputBuilder()
                .setCustomId('character_name')
                .setLabel('Character Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const charGenderInput = new TextInputBuilder()
                .setCustomId('character_gender')
                .setLabel('Character Gender')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const realNameInput = new TextInputBuilder()
                .setCustomId('real_name')
                .setLabel('Real Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const ageInput = new TextInputBuilder()
                .setCustomId('age')
                .setLabel('Age')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const experienceInput = new TextInputBuilder()
                .setCustomId('roleplay_experience')
                .setLabel('Roleplay Experience (months)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(charNameInput);
            const row2 = new ActionRowBuilder().addComponents(charGenderInput);
            const row3 = new ActionRowBuilder().addComponents(realNameInput);
            const row4 = new ActionRowBuilder().addComponents(ageInput);
            const row5 = new ActionRowBuilder().addComponents(experienceInput);

            modal.addComponents(row1, row2, row3, row4, row5);

            await interaction.showModal(modal);
        } else if (interaction.customId.startsWith('whitelist_action')) {
            const [action, userId] = interaction.customId.split(':');
            const user = await client.users.fetch(userId);

            if (action === 'whitelist_accept') {
                await user.send('Your whitelist application has been accepted!');
            } else if (action === 'whitelist_reject') {
                await user.send('Your whitelist application has been rejected.');
            } else if (action === 'whitelist_pending') {
                await user.send('Your whitelist application is pending.');
            }

            await interaction.reply({ content: `Application has been marked as ${action.split('_')[1]}`, ephemeral: true });
        }
    } else if (interaction.isModalSubmit() && interaction.customId === 'whitelist_application') {
        const charName = interaction.fields.getTextInputValue('character_name');
        const charGender = interaction.fields.getTextInputValue('character_gender');
        const realName = interaction.fields.getTextInputValue('real_name');
        const age = interaction.fields.getTextInputValue('age');
        const experience = interaction.fields.getTextInputValue('roleplay_experience');

        const applicationEmbed = new EmbedBuilder()
            .setTitle('Whitelist Application')
            .addFields(
                { name: 'Character Name', value: charName },
                { name: 'Character Gender', value: charGender },
                { name: 'Real Name', value: realName },
                { name: 'Age', value: age },
                { name: 'Roleplay Experience', value: `${experience} months` }
            )
            .setFooter({ text: `Submitted by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const applicationChannel = client.channels.cache.get(process.env.APPLICATION_CHANNEL_ID);

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`whitelist_accept:${interaction.user.id}`)
                .setLabel('Accept')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`whitelist_reject:${interaction.user.id}`)
                .setLabel('Reject')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`whitelist_pending:${interaction.user.id}`)
                .setLabel('Pending')
                .setStyle(ButtonStyle.Secondary)
        );

        await applicationChannel.send({ embeds: [applicationEmbed], components: [buttons] });

        await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (message.content === '!whitelist') {
        const embed = new EmbedBuilder()
            .setTitle('Whitelist Application')
            .setDescription('Apply here for Whitelist\n\n🟢 **Interview:**\nWhitelist Interviews are available 24x7\n\n🟢 **Availability:**\nWe are usually always available between peak times - 06:00 PM to 08:00 PM.\n\n**NOTE:**\nCheck the rules before applying')
            .setImage('attachment://image.jpg');

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('apply_whitelist')
                .setLabel('Apply For Whitelist')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [buttons] });
    }
});

client.login(process.env.DISCORD_TOKEN);
