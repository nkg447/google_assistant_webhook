"use strict";

// Import the Dialogflow module from the Actions on Google client library.
const port = process.env.PORT || 3000;
const {dialogflow, SimpleResponse, List} = require('actions-on-google');
const bodyParser = require('body-parser');

var express_app = require("express")();
var http = require("http").Server(express_app);
var io = require("socket.io")(http);

var socket = null;
const app = dialogflow({debug: true});


app.intent("execute_cmd", async function (conv) {
    var data = await executeCmd(conv.parameters);
    if (!data.isList) {
        conv.ask(new SimpleResponse({
            speech: data["speech"],
            text: data["text"],
        }));
    }
});


app.intent("show_files", async function (conv) {
    var data = await showFiles(conv.parameters);
    setFilesList(conv, data)
});

app.intent('actions_intent_OPTION', async (conv, params, option) => {
    console.log(conv)
    console.log(option)
    if (option) {
        var data = await showFiles({path: option});

        setFilesList(conv, data)
    }
});

function setFilesList(conv, data) {
    conv.ask(new SimpleResponse({
        speech: data["speech"],
        text: data["text"],
    }));
    if (data.isList) {
        var items = {};
        for (var i = 0; i < data.list.length; i++) {
            items[`${data.list[i].key}`] = {
                synonyms: [],
                title: data.list[i].title,
                description: data.list[i].description
            };
        }
        conv.ask(new List({
            title: `showing files`,
            items: items
        }))
    }
}

function showFiles(param) {
    var data;
    return new Promise((resolve, reject) => {
        socket.emit("show_files", param, obj => {
            data = obj;
            resolve(data);
        });
    });
}

function executeCmd(param) {
    var data;
    return new Promise((resolve, reject) => {
        socket.emit("execute_cmd", param, obj => {
            data = obj;
            resolve(data);
        });
    });
}


io.on("connect", function (s) {
    socket = s;
    console.log("connected")
});

express_app.use("/exec", bodyParser.json(), app);

http.listen(port, function () {
    console.log(`listening on *:${port}`);
});
