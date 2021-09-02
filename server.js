const http = require("http");
const urlapi = require("url");
const fs = require("fs");
const path = require("path");

const nStatic = require("node-static");
const { GoogleSpreadsheet } = require('google-spreadsheet');

const indexPath = path.join(__dirname, "index.html");
let libsFileServer = new nStatic.Server(path.join(__dirname, "/lib"));


let api_info = JSON.parse(fs.readFileSync('pavtiger.json'));
client_email = api_info["client_email"]
private_key = api_info["private_key"]


let table = [], width = [];  // Parsed table, and width of a cell in table


async function parseTable() {
    console.log("parsing...");

    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet('1WNI4amVqK9AJzuNAQHHMdZpE6pMAxNAR7tab7cTMvb4');

    await doc.useServiceAccountAuth({
        client_email: client_email,
        private_key: private_key,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["Расписание (создается....)"];

    await sheet.loadCells('A1:R68');

    let _table = [], _width = [];  // variables to work with until the result is ready

    for (let i = 0; i < 50; ++i) {
        let line = {}, width_line = [], last_subject_elem = -1;
        for (let j = 0; j < 16; ++j) {
            const elem = await sheet.getCell(1 + i, 2 + j);
            if (elem._rawData["userEnteredValue"] === undefined) {
                line[j.toString()] = "None";
                if (last_subject_elem !== -1) {
                    width_line[last_subject_elem]++;  // add 1 to last not None element
                }
                width_line.push(0);  // current cell width
            } else {
                line[j.toString()] = elem._rawData["userEnteredValue"]["stringValue"];
                width_line.push(1);
                last_subject_elem = j;
            }
        }
        _table.push(line);
        _width.push(width_line);
    }

    width = _width;
    table = _table;
    console.log("updated...");
}


function getTable(req, res) {
    res.writeHead(200, {"Content-Type": "text/json"});
    res.end(JSON.stringify([table, width]));
}

function index(req, res) {
    fs.readFile(indexPath, {encoding: "utf-8"}, function(err, data) {
        if (!err) {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        } else {
            console.log(err);
        }
    });
}


function error404(req, res) {
    res.writeHead(404, {"Content-Type": "text/html"});
    res.end("404 Not Found :(");
}


function main(req, res) {
    var url = urlapi.parse(req.url);

    var pathname = url.pathname;

    switch(true) {
        case pathname === "/":
            index(req, res);
            break;

        case pathname === "/get_table":
            getTable(req, res);
            break;

        case pathname.startsWith("/lib/"):
            req.url = req.url.replace("/lib", "/");
            libsFileServer.serve(req, res);
            break;

        default:
            error404(req, res);
            break;
    }
}

parseTable();
setTimeout(parseTable, 300000);

var app = http.createServer(main);
app.listen(8080);
console.log("Listening on 8080");
