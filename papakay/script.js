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

async function generateSerialCode(chaplaincyAbbr) {
    const lastUser = await db.collection('users')
        .find({ code: { $regex: `^${chaplaincyAbbr}` } })
        .sort({ code: -1 })
        .limit(1)
        .toArray();

    if (lastUser.length === 0) {
        return `${chaplaincyAbbr}001`;
    }

    const lastCode = lastUser[0].code;
    const lastNumber = parseInt(lastCode.slice(chaplaincyAbbr.length), 10);
    const newNumber = lastNumber + 1;

    return `${chaplaincyAbbr}${newNumber.toString().padStart(3, '0')}`;
}

app.get('/verify-access-code', async (req, res) => {
    const accessCode = req.query.code;

    try {
        const result = await db.collection('accessCodes').findOne({ code: accessCode });

        if (result) {
            res.send({ valid: true });
        } else {
            res.send({ valid: false });
        }
    } catch (error) {
        console.error('Error querying MongoDB:', error);
        res.status(500).send({ error: 'Database error' });
    }
});

app.post('/generate-code', async (req, res) => {
    const userInfo = req.body;
    const chaplaincyAbbr = chaplaincies[userInfo.chaplaincy][1];
    const chaplaincyName = chaplaincies[userInfo.chaplaincy][0];

    try {
        const existingUser = await db.collection('users').findOne({ 
            name: userInfo.name, 
            chaplaincy: chaplaincyName 
        });

        if (existingUser) {
            res.send({ code: existingUser.code, status: 'existing' });
        } else {
            const code = await generateSerialCode(chaplaincyAbbr);
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

app.get('/all-users', async (req, res) => {
    try {
        const users = await db.collection('users').find({}).toArray();
        res.send(users);
    } catch (error) {
        console.error('Error querying MongoDB:', error);
        res.status(500).send({ error: 'Database error' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
