const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const chaplaincies = {
    1: ['St. Mathew\'s Boricamp', 'SMB'],
    2: ['Stella Maris Pathfinder', 'SMP'],
    3: ['St Michael\'s Onne', 'SMO'],
    4: ['St John Paul Effurun', 'SJP'],
    5: ['St. Bernard Abak', 'SBA'],
    6: ['Queen of Apostle Airforce', 'QAC'],
    7: ['St. Gregory Elele', 'SGE']
};

let db;

async function connectToMongoDB() {
    const uri = 'mongodb+srv://georgegodstime62:FVdUHHjjexMWhTM8@cluster0.famaazt.mongodb.net/generator';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Database connected');

        db = client.db('chaplaincy_db');

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

connectToMongoDB().catch(console.error);

function generateUniqueCode(chaplaincyAbbr, codeLength = 7) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = chaplaincyAbbr;
    for (let i = chaplaincyAbbr.length; i < codeLength; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

app.post('/generate-code', async (req, res) => {
    const userInfo = req.body;
    const chaplaincyAbbr = chaplaincies[userInfo.chaplaincy][1];
    const chaplaincyName = chaplaincies[userInfo.chaplaincy][0];

    try {
        // Check if the user already exists based on name and chaplaincy
        const existingUser = await db.collection('users').findOne({ 
            name: userInfo.name, 
            chaplaincy: chaplaincyName 
        });

        if (existingUser) {
            // If user exists
            res.send({ code: existingUser.code, status: 'existing' });
        } else {
            const code = generateUniqueCode(chaplaincyAbbr);
            const data = {
                code,
                name: userInfo.name,
                age: userInfo.age,
                gender: userInfo.gender,
                healthIssues: userInfo.healthIssues === 'yes' ? userInfo.healthDetails : 'None',
                chaplaincy: chaplaincyName
            };

            await db.collection('users').insertOne(data);
            res.send({ code, status: 'new' });
        }
    } catch (error) {
        console.error('Error interacting with the database:', error);
        res.status(500).send({ error: 'Database error' });
    }
});

app.get('/search', async (req, res) => {
    const code = req.query.code;

    try {
        const result = await db.collection('users').findOne({ code });

        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error querying MongoDB:', error);
        res.status(500).send({ error: 'Database error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
