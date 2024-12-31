const express = require('express');
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser'); 
const cors = require('cors');
const validator = require('validator');
const cron = require('node-cron');
require('dotenv').config();
const sendEmail = require('./problemEmailer');
const { getRandomFermiProblem } = require('./problemGenerator');

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 


// Connect to the MongoDB Database
mongoose.connect('mongodb://localhost:27017/fermi_subscriptions', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('connected to databases')
});

// Setup database
const db_schema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    subscribed: { type: Boolean, default: true},
});

const Entry = mongoose.model('Entry', db_schema)

// -------------------
// Server Protocals
// ----------------------

// Main Page
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public/index.html');
});
 
// Form submission
app.post('/submit', async (req, res) => {
    const {name, email} = req.body;
    console.log('Submission Recieved')
    
    if (!name || !email) {              // Verifies fields aren't empty, fields are required on frontend so not strictly necessary but a precaution 
        return res.status(400).json({messge:'Name and email are required.'});
    }
    if (!validator.isAlpha(name.replace(/\s/g, ''), 'en-US')){      // Verifies name format
        return res.status(400).json({message: 'Invalid name Format.'});
    }
    if (!validator.isEmail(email)){        // Verifies email format
        return res.status(400).json({message: 'Invalid email format.'});
    }

    try {
        const newEntry = new Entry({name, email})
        await newEntry.save()
        res.status(201).json({message: 'Query Logged Succesfully'});
    } catch(error) {
        console.log(error)
        res.status(500).json({message: 'Internal Server Error'})
    }
});

// Email Unsubscribe
app.post('/unsubscribe', async (req, res) => {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    try {
        await Entry.deleteOne({ email });
        res.status(200).json({ message: 'Successfully unsubscribed.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Schedule and Send Email
cron.schedule('*/1 * * * *', async () => { // every three days is '0 0 */3 * *'
    console.log('Running scheduled email task...');
    
    try {
        // Load new Fermi Problem.
        const fermiProblem = await getRandomFermiProblem();

        // Load all the emails and send an email to each.
        const entries = await Entry.find(); 
        entries.forEach(entry => {
            const email = entry.email;
            const name = entry.name;
            const baseURL = process.env.BASE_URL

            const message = `Hi ${name},\n\n\n${fermiProblem}\n\nUnsubscribe here: http://${baseURL}.com/unsubscribe`
            sendEmail(email, 'Your Fermi Problem is...', message)
            console.log('Succesfully sent email')
        });
    } catch (error) {
        console.error('Error sending emails:', error);
    }
});


// Run Server on Port
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});