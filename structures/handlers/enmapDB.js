const Enmap = require('enmap');

module.exports = (client) => {
  client.settings = new Enmap({
    name: "settings",
    ensureProps: {
      prefix: "!",
      welcomeChannel: "general",
      // Add other default settings as needed
    }
  });

  // Ensure default settings are present
  client.settings.ensure("default", {
    prefix: "!",
    welcomeChannel: "general",
    // Add other default settings as needed
  });

  console.log('Enmap initialized and default settings ensured.');
};
