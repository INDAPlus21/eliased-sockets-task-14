var express = require("express"); // Express web server framework
var request = require("request");
var cors = require("cors");
var cookieParser = require("cookie-parser");

const session = require('express-session')
const path = require("path")
var logger = require("tracer").colorConsole();

const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: 8080 });

const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

// open livereload high port and start to watch public directory for changes
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

// ping browser on Express boot, once browser has reconnected and handshaken
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

var app = express();

app.use(connectLivereload());

function wwwRedirect(req, res, next) {
    if (req.headers.host.slice(0, 4) === "www.") {
        var newHost = req.headers.host.slice(4);
        return res.redirect(301, req.protocol + "://" + newHost + req.originalUrl);
    }
    next();
}

app.set("trust proxy", true);
app.use(wwwRedirect);
app.use(require('body-parser').urlencoded({ extended: true }));

app
    .use(express.static(__dirname + "/public"))
    .use(cookieParser());

var connections = []

ws.on('connection', function connection(wsConnection) {
    logger.info("connected")
    var is_bot = true //Math.random() < 0.5;
    connections.push([wsConnection, is_bot])
    logger.info("is_bot: ", is_bot)
    // var is_bot = true
    var previous_responses = []
    var previous_bot_responses = []
    wsConnection.on('message', async function incoming(message) {
        if (message == "isBot(true)" || message == "isBot(false)") {
            wsConnection.send("is_bot == " + is_bot);
        }
        else if (is_bot) {
            logger.info(previous_responses, previous_bot_responses, message)
            var bot_response = await getBotResponse(previous_responses, previous_bot_responses, message)
            var generated_text = JSON.parse(bot_response)["generated_text"].trim()
            previous_responses.push(message)
            previous_bot_responses.push(generated_text)
            logger.info(generated_text)
            wsConnection.send(generated_text);
        }
        else {
            logger.info(message)
            for (var i = 0; i < connections.length; i++) {
                if (connections[i][0] !== wsConnection && !connections[i][1]) {
                    connections[i][0].send(message);
                }
            }
        }
        // wsConnection.send("got your message: " + message);
    })
});

// Another idea is to try to evaluate if EACH message is from a bot or a human, to make it harder...
// ... or give more points the sooner you get it 
// Or to make both the human AND the bot guess 
// there's a better bot: https://huggingface.co/facebook/blenderbot-3B?text=What%27s+your+favorite+movie%3F
// or rotate through different AIs, because they very often provide the same response (it's a hack!)
// this could be a research study of what ais are most convincing, and their progression over the years 

async function getBotResponse(past_user_inputs, generated_responses, text) {
    return new Promise(function (resolve, reject) {

        var options = {
            url: "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
            headers: {
                Authorization: "Bearer " + "rgsmKeotnqfZUwUTIgGGBfIdhursJSTEigZAfMKqjYlWddLcxQuQAtMetfEXzVVgaQlbTQOPmSALOmvkbbCLEXNYlqGqXXZvrgouFrNdUlxUNyRmWCzoZsZeFNTWiwty",
            },
            body: JSON.stringify({
                inputs: {
                    past_user_inputs: past_user_inputs,
                    generated_responses: generated_responses,
                    text: text
                }
            }),
        };

        request.post(options, function (error, response, body) {
            logger.info(error, body)
            resolve(body);
        })
    })
}

// https://api-inference.huggingface.co/models/facebook/blenderbot-3B
// https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill
// https://api-inference.huggingface.co/models/microsoft/DialoGPT-large
// var gpt_res = await axios.post('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', options);
// logger.info(gpt_res)

const http = require("http");

const server = http.createServer(app);

server.listen(3000, () => {
    logger.info("listening on 3000");
});

