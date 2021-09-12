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


let table = [], width = [], color = [];  // Parsed table, and width of a cell in table


async function parseTable() {

    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet('1WNI4amVqK9AJzuNAQHHMdZpE6pMAxNAR7tab7cTMvb4');

    await doc.useServiceAccountAuth({
        client_email: client_email,
        private_key: private_key,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByTitle["Расписание (создается....)"];

    await sheet.loadCells('A1:S68');

    let _table = [], _width = [], _color = [], lasti = 0;  // variables to work with until the result is ready
    let _table_day = [], _width_day = [], _color_day = [];  // table for a whole day

    for (let i = 0; i < 67; ++i) {  // table row
        let line = {}, width_line = [], last_subject_elem = -1, day_i = i - lasti;
        let subject_index = await sheet.getCell(1 + i, 1)._rawData.formattedValue;
        let color_line = [];

        for (let j = 0; j < 16; ++j) {  // table column
            const elem = await sheet.getCell(1 + i, 3 + j);

            if (elem._rawData["userEnteredValue"] === undefined) {
                if (Object.keys(elem._rawData).length !== 0) {
                    // empty cell
                    if (elem._rawData["effectiveFormat"] !== undefined) {
                        color_line[j] = elem._rawData["effectiveFormat"]["backgroundColor"];
                        if (color_line[j]["red"] === undefined) color_line[j]["red"] = 0;
                        if (color_line[j]["green"] === undefined) color_line[j]["green"] = 0;
                        if (color_line[j]["blue"] === undefined) color_line[j]["blue"] = 0;
                    } else {
                        color_line[j] = {"red": 1, "green": 1, "blue": 1};
                    }

                    line[j.toString()] = "";
                    width_line.push(1);
                    last_subject_elem = j;
                } else {
                    // end value
                    line[j.toString()] = "None";
                    if (last_subject_elem !== -1) {
                        width_line[last_subject_elem]++;  // add 1 to last not None element
                    }
                    width_line.push(0);  // current cell width
                }
            } else {
                // start value
                if (elem._rawData["effectiveFormat"] !== undefined) {
                    color_line[j] = elem._rawData["effectiveFormat"]["backgroundColor"];
                    if (color_line[j]["red"] === undefined) color_line[j]["red"] = 0;
                    if (color_line[j]["green"] === undefined) color_line[j]["green"] = 0;
                    if (color_line[j]["blue"] === undefined) color_line[j]["blue"] = 0;
                } else {
                    color_line[j] = {"red": 1, "green": 1, "blue": 1};
                }

                line[j.toString()] = elem._rawData["userEnteredValue"]["stringValue"];
                width_line.push(1);
                last_subject_elem = j;
            }
        }

        if (i !== 0 && subject_index === "1") {
            _table.push(_table_day); _width.push(_width_day); _color.push(_color_day);
            _table_day = []; _width_day = []; _color_day = []; lasti = i;
        }
        _table_day.push(line);
        _width_day.push(width_line);
        _color_day.push(color_line)
    }

    _table.push(_table_day); _width.push(_width_day); _color.push(_color_day);

    width = _width;
    table = _table;
    color = _color;
}


function getTable(req, res) {
    res.writeHead(200, {"Content-Type": "text/json"});
    res.end(JSON.stringify([table, width, color]));
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
setInterval(parseTable, 300000);

var app = http.createServer(main);
app.listen(8080);
console.log("Listening on 8080");
