const { Client, Authenticator } = require('minecraft-launcher-core');
const prompt = require('prompt');
const fs = require('fs');

let base = {
    options: {
        authorization: {},
        clientPackage: null,
        root: "./minecraft",
        java: "./jre/bin/java.exe",
        os: "windows",
        version: {
            number: "1.14",
            type: "release"
        },
        memory: {
            max: "1000",
            min: "500"
        },
        customArgs: ["-XX:+UnlockExperimentalVMOptions"]
    },
    cracked: false
};

if(fs.existsSync('./config.json')) {
    base = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    console.log("[launcher] Loaded config from file. Checking if token is valid!");
    if(base.cracked) {
        console.log("[Launcher] Skipping account validation!");
    } else {
        Authenticator.validate(base.options.authorization.access_token).then(response => {
            if(response) {
                console.log("[Launcher] Validated account, starting!")
                launch();
            } else {
                console.log("[Launcher] Failed to validate account, please login again!");
                startPrompt()
            }
        });
    }
} else {
    fs.writeFileSync('./config.json', JSON.stringify(base, null, 2));
    console.log("[Launcher] Created base config file!");
    startPrompt()
}

const launcher = new Client(base.options);

function launch() {
    launcher.launch(base.options.authorization);
}

function startPrompt() {
    prompt.get([{
        name: "username",
        required: true
    }, {
        name: "password"
    }], async function(error, results) {
        if(!results.password) base.cracked = true;
        base.options.authorization = await Authenticator.getAuth(results.username, results.password);
        fs.writeFileSync('./config.json', JSON.stringify(base,null, 2));
        launch();
    });
}

launcher.on('data', (data) => console.log(data.toString('utf8')));
launcher.on('download', (data) => console.log(data));
launcher.on('debug', (data) => console.log(data));