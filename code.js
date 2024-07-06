const fs = require('fs');
const readline = require('readline');

const chaplaincies = {
    1: ['St. Mathew\'s Boricamp', 'SMB'],
    2: ['Stella Maris Pathfinder', 'SMP'],
    3: ['St Michael\'s Onne', 'SMO'],
    4: ['St John Paul Effurun', 'SJP'],
    5: ['St. Bernard Abak', 'SBA'],
    6: ['Queen of Apostle Airforce', 'QAC'],
    7: ['St. Gregory Elele', 'SGE']
};

function generateUniqueCode(chaplaincyAbbr, codeLength = 7) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = chaplaincyAbbr;
    for (let i = chaplaincyAbbr.length; i < codeLength; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

function saveCodeToFile(userInfo, code, filename = 'codes.txt') {
    const data = `Name: ${userInfo.name}, Age: ${userInfo.age}, Gender: ${userInfo.gender}, `
                 + `Health Issues: ${userInfo.healthIssues}, Chaplaincy: ${userInfo.chaplaincy}, Code: ${code}\n`;
    fs.appendFileSync(filename, data, 'utf8');
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (question) => {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    };

    const userInfo = {};
    
    userInfo.name = await askQuestion("Enter your full name: ");
    userInfo.age = await askQuestion("Enter your age: ");

    while (true) {
        const gender = (await askQuestion("Enter your gender (male/female): ")).trim().toLowerCase();
        if (gender === 'male' || gender === 'female') {
            userInfo.gender = gender;
            break;
        } else {
            console.log("Invalid Gender. Please enter either 'male' or 'female'.");
        }
    }

    const healthIssues = (await askQuestion("Any underlying health issues? (yes/no): ")).trim().toLowerCase();
    if (healthIssues === 'yes') {
        userInfo.healthIssues = await askQuestion("Please state the underlying health issues: ");
    } else {
        userInfo.healthIssues = 'None';
    }

    while (true) {
        console.log("Choose your chaplaincy from the list below:");
        for (const [key, value] of Object.entries(chaplaincies)) {
            console.log(`${key}. ${value[0]}`);
        }
        
        const chaplaincyChoice = parseInt(await askQuestion("Enter the number corresponding to your chaplaincy: "), 10);
        if (chaplaincyChoice in chaplaincies) {
            const [chaplaincyName, chaplaincyAbbr] = chaplaincies[chaplaincyChoice];
            userInfo.chaplaincy = chaplaincyName;
            const code = generateUniqueCode(chaplaincyAbbr);
            console.log(`Generated code: ${code}`);
            
            const saveToFile = (await askQuestion("Do you want to save the code to a file? (yes/no): ")).trim().toLowerCase();
            if (saveToFile === 'yes') {
                saveCodeToFile(userInfo, code);
                console.log("Code has been saved to 'codes.txt'.");
            }
            break;
        } else {
            console.log("Error: Invalid chaplaincy number. Please enter a valid number.");
        }
    }

    rl.close();
}

main();
