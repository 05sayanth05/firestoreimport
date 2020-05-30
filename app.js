const csv = require("csvtojson");
const admin = require("firebase-admin");
const readline = require("readline");

var dataPath, credentialPath, collectionName;

function read(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function start() {
    process.stdout.write("\n");

    credentialPath = await read("credential path: ");
    dataPath = await read("data path: ");
    collectionName = await read("collection name: ");

    process.stdout.write("\n");

    const serviceAccount = require(credentialPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    const dbref = admin.firestore();

    console.log("csv to json parsing started...");
    csv().fromFile(dataPath).then((data) => {
        let count = 0;

        console.log("csv to json parsing done.");
        console.log("adding data to cloud firestore...");

        data.forEach(async (element) => {
            await dbref.collection(collectionName).add(element).then(() => {
                count++;
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(count + " documents added.");
            }).catch((err) => {
                console.log("failed to add document: " + err);
                process.stdout.write("\n");
                process.exit();
            });
        });
    });

}

start();