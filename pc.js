const io = require("socket.io-client");
const {exec} = require("child_process");
var fs = require("fs");

const socket = io("https://nikunj447.herokuapp.com/");

const intentToCommand = {
    "shutdown": "shut down",
    "editor": "deepin-editor",
    "VLC": "vlc",
    "google chrome": "google-chrome"
}

const pathToFullPath = {
    "multimedia": "/media/nikunj/MJRO1714/Multimedia",
    "home": "/home",
    "root": "/"
}


socket.on("execute_cmd", (params, callback) => {
    console.log(params);
    var cmd = (intentToCommand[params.cmd] == undefined) ? params.cmd.toLowerCase().replace(" ", "-") : intentToCommand[params.cmd];
    execute(cmd);
    callback({
        speech: `executing command ${cmd}`,
        text: `executing command ${cmd}`,
        isList: false
    });
});

socket.on("show_files", (params, callback) => {
    var path = (pathToFullPath[params.path] == undefined) ? params.path : pathToFullPath[params.path];
    console.log(path)
    showFiles(path, callback)
});

function showFiles(path, callback) {
    if(fs.lstatSync(path).isFile()){
        execute(`xdg-open "${path}"`);
        callback({
            isList: false,
            speech: `opening ${pathToName(path)} `,
            text: `opening ${pathToName(path)} `
        })
    }
    fs.readdir(path, (err, files) => {
        if (err) {
            return;
        }
        var list = [];
        files.forEach(function (file) {
            list.push({
                key: path + "/" + file,
                title: file,
                description: (fs.lstatSync(`${path}/${file}`).isFile()) ? "file" : "folder"
            });
        });

        callback({
            isList: true,
            list: list,
            speech: `showing files in ${pathToName(path)} folder`,
            text: `showing files in ${pathToName(path)} folder`
        });

    })
}

function execute(data) {
    exec(data, (err, stdout, stderr) => {
        if (err) {
            console.log("node couldn't execute the command", err);
            return;
        }
    });
}

function pathToName(str) {
    return str.split('\\').pop().split('/').pop();
}