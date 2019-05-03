const launcher = require('minecraft-launcher-core');
const prompt = require('prompt');
const fs = require('fs');

let base = {
    options: {
        clientPackage: null,
        root: "./minecraft",
        java: "./jre/bin/java.exe",
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
    authorization: {},
    cracked: false
};

if(fs.existsSync('./config.json')) {
    base = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    console.log("[launcher] Loaded config from file. Checking if token is valid!");
    if(base.cracked) {
        console.log("[Launcher] Skipping account validation!");
        launch()
    } else {
        launcher.authenticator.validate(base.authorization.access_token).then(response => {
            if(response) {
                launch();
            } else {
                console.log("[Launcher] Failed to validate account, please login again!");
                startPrompt()
            }
        });
    }
} else {
    fs.writeFileSync('./config.json', JSON.stringify(base,null, 2));
    console.log("[Launcher] Created base config file!");
    startPrompt()
}

function launch() {
    launcher.core({
        authorization: base.authorization,
        clientPackage: base.options.clientPackage,
        root: base.options.root,
        os: "windows",
        javaPath: base.options.java,
        version: base.options.version,
        memory: base.options.memory,
        customArgs: base.options.customArgs
    });
}

function startPrompt() {
    prompt.get([{
        name: "username",
        required: true
    }, {
        name: "password"
    }], async function(error, results) {
        if(!results.password) base.cracked = true;
        base.authorization = await launcher.authenticator.getAuth(results.username, results.password);
        fs.writeFileSync('./config.json', JSON.stringify(base,null, 2));
        launch();
    });
}

launcher.event.on('data', (data) => console.log(data.toString('utf8')));
launcher.event.on('download', (data) => console.log(data));
launcher.event.on('debug', (data) => console.log(data));