let table, colspan, color;
// cell to grade converters
let table_columns = {"0": "5C", "4": "6C & 6T", "8": "7C", "10": "8C",  "12": "9C", "14": "10C"};
let grade_start = {"5C": 0, "6C & 6T": 4, "7C": 8, "8C": 10, "9C": 12, "10C": 14};
let headers_colspan = {"5C": 4, "6C & 6T": 4, "7C": 2, "8C": 2,  "9C": 2, "10C": 2};


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


function updateGrade() {
    let grade = document.getElementById("main_chooser").value;
    let table = document.getElementById("table");
    table.innerHTML = "";

    constructTable('#table', grade);
}


function constructTable(selector, grade) {
    // Getting the all column names
    let cols = Headers(table, selector, grade);

    // Traversing the JSON data
    for (let i = 0; i < table.length; i++) {
        let row = $('<tr/>');
        for (let column = 0; column < cols.length; column++) {
            let val = table[i][cols[column]];
            if (val === "None") continue;

            // If there is any key, which is matching with the column name
            if (val == null) val = "";

            if (grade === -1) {
                console.log(i + " " + column);
                row.append($('<td style="text-align:center; background-color:rgb(' + color[i][column]["red"] * 255 + ',' +
                    color[i][column]["green"] * 255 + ',' + color[i][column]["blue"] * 255 + ')" colspan="' + colspan[i][column] + '"/>').html(val));
            } else if (column >= grade_start[grade] && column < grade_start[grade] + headers_colspan[grade]) {
                row.append($('<td style="text-align:center; background-color:rgb(' + color[i][column]["red"] * 255 + ',' +
                    color[i][column]["green"] * 255 + ',' + color[i][column]["blue"] * 255 + ')" colspan="' + Math.min(colspan[i][column], grade_start[grade] + headers_colspan[grade] - column) + '"/>').html(val));
            }
        }

        // Adding each row to the table
        $(selector).append(row);
    }
}


function Headers(list, selector, grade) {
    let columns = [];
    let header = $('<tr/>');

    for (let i = 0; i < list.length; i++) {
        let row = list[i];

        for (let k in row) {
            if ($.inArray(k, columns) === -1) {
                columns.push(k);

                // Creating the header
                if (table_columns[k] !== undefined) {
                    if (grade === -1 || grade === table_columns[k]) {
                        header.append($('<th colspan="' + headers_colspan[table_columns[k]] + '"/>').html(table_columns[k]));
                    }
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
    table = data[0]; colspan = data[1]; color = data[2];

    let chooser = document.getElementById("main_chooser");
    chooser.addEventListener("change", updateGrade);

    constructTable('#table', -1);  // HTML element & json element: timetable
}
