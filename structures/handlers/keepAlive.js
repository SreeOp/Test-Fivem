const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.all('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`ZX STORE IS ONLINE`);
  res.end();
});

let server;

function startServer() {
  server = app.listen(port, () => {
    console.log("ZX STORE IS ONLINE");
  });
}

function keepAlive() {
  startServer();

  // Check if the server is still running every 5 minutes
  setInterval(() => {
    if (!server.listening) {
      startServer();
    }
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
}

module.exports = keepAlive;
