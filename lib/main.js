/**
 * Sends a request to the url and returns parsed response
 *
 * @returns Server response as parsed json object
 * @param Url
 */
function httpGet(Url) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", Url, false); // false for synchronous request
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}


function constructTable(selector, table, colspan) {
    // Getting the all column names
    let cols = Headers(table, selector);

    // Traversing the JSON data
    for (let i = 0; i < table.length; i++) {
        let row = $('<tr/>');
        for (let colIndex = 0; colIndex < cols.length; colIndex++) {
            let val = table[i][cols[colIndex]];
            if (val === "None") continue;

            // If there is any key, which is matching with the column name
            if (val == null) val = "";
            // console.log(colspan[i][colIndex]);
            row.append($('<td colspan="' + colspan[i][colIndex] + '"/>').html(val));
        }

        // Adding each row to the table
        $(selector).append(row);
    }
}


function Headers(list, selector) {
    let columns = [];
    let header = $('<tr/>');

    for (let i = 0; i < list.length; i++) {
        let row = list[i];
        let table_columns = {"0": "5С", "4": "6С и 6Т", "8": "7С", "10": "8С",  "12": "9С", "14": "10С"};
        let colspan = {"0": 4, "4": 4, "8": 2, "10": 2,  "12": 2, "14": 2};

        for (let k in row) {
            if ($.inArray(k, columns) === -1) {
                columns.push(k);

                // Creating the header
                if (table_columns[k] !== undefined) {
                    header.append($('<th colspan="' + colspan[k] + '"/>').html(table_columns[k]));
                }
            }
        }
    }

    // Appending the header to the table
    $(selector).append(header);
    return columns;
}


window.onload = function() {
    let data = httpGet("/get_table");
    let table = data[0], colspan = data[1];

    constructTable('#table', table, colspan);  // HTML element & json element: timetable
}
