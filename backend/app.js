// Code for fetching emails from Gmail using IMAP
var Imap = require('imap'),
    inspect = require('util').inspect;
const {simpleParser} = require('mailparser');
require('dotenv').config();

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

function openInbox(cb) {
  gmailImap.openBox('INBOX', true, cb);
}
function fetchGmails() {
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
                        if (codeMatch6) {
                        const verificationCode = codeMatch6[0];
                        console.log('Verification Code:', verificationCode);
                        } else if (codeMatch8) {
                        const verificationCode = codeMatch8[0];
                        console.log('Verification Code:', verificationCode);
                        } else {
                        console.log('Verification Code not found');
                        }
                        // Your code to extract and process the email content here
                        // Extract and log the email body
                        //const emailBody = mail.html;
                        //console.log('Email Body:', emailBody);
                    });
                });
            });
            email.once('error', function(err) {
                console.log('Fetch error: ' + err);
            });
            email.once('end', function() {
                console.log('Done fetching all messages!');
                gmailImap.end();
            });
        });
                
    });

    gmailImap.once('error', function(err) {
        console.log(err);
    });
    
    gmailImap.once('end', function() {
        console.log('Connection ended');
    });
    
    gmailImap.connect();
}

fetchGmails();