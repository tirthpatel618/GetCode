const express = require('express'); // Import express
const gmailService = require('./getGmail'); // Import Gmail service
const app = express(); // Initialize express
const port = 3000; // Define port

// Create an endpoint for Gmail email fetching
app.get('/fetch-gmail', (req, res) => {
  gmailService.fetchGmails(res); // Call the email-fetching function from gmailService.js
});

// Start the express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
