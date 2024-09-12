var Imap = require('imap');
const { simpleParser } = require('mailparser');
require('dotenv').config(); // Load environment variables

// IMAP configuration for Gmail
var gmailImap = new Imap({
  user: process.env.EMAIL,
  password: process.env.PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false
  }
});

// Open the inbox function
function openInbox(cb) {
  gmailImap.openBox('INBOX', true, cb);
}

// Function to fetch emails
function fetchGmails(res) {
  gmailImap.once('ready', function() {
    openInbox(function(err, box) {
      if (err) throw err;
      const emailID = box.messages.total;
      console.log(emailID);
      const email = gmailImap.seq.fetch(emailID, { bodies: '' });
      console.log('Fetching email');
      email.on('message', (msg, seqno) => {
        msg.on('body', (stream) => {
          simpleParser(stream, async (err, mail) => {
            if (err) throw err;
            // Extract and log the email subject
            const emailSubject = mail.text;
            console.log('type', typeof emailSubject);
            console.log('Email Subject:', emailSubject);

            const codeMatch6 = emailSubject.match(/\b\d{6}\b/);
            const codeMatch8 = emailSubject.match(/\b\d{8}\b/);
            let verificationCode = null;

            if (codeMatch6) {
              verificationCode = codeMatch6[0];
              console.log('Verification Code:', verificationCode);
            } else if (codeMatch8) {
              verificationCode = codeMatch8[0];
              console.log('Verification Code:', verificationCode);
            } else {
              console.log('Verification Code not found');
            }

            // Send response with the email subject and verification code
            res.json({
              subject: emailSubject,
              verificationCode: verificationCode || 'Not found',
            });
          });
        });
      });
      email.once('error', function(err) {
        console.log('Fetch error: ' + err);
        res.status(500).send('Error fetching email');
      });
      email.once('end', function() {
        console.log('Done fetching all messages!');
        gmailImap.end();
      });
    });
  });

  gmailImap.once('error', function(err) {
    console.log(err);
    res.status(500).send('IMAP connection error');
  });

  gmailImap.once('end', function() {
    console.log('Connection ended');
  });

  gmailImap.connect();
}

module.exports = { fetchGmails }; // Export the function
