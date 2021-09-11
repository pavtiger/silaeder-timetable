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

/**
 * Runs on "Choose grade" element update
 */
function updateGrade() {
    let grade = document.getElementById("main_chooser").value;

    for (let day = 0; day < 6; ++day) {
        // Getting the all column names
        let table = document.getElementById("table" + (day + 1).toString());
        table.innerHTML = "";
    }

    constructTable('#table', grade);
}


/**
 * Constructs a table filtering for grade
 *
 * @param _selector
 * @param grade current grade to filter by or -1 otherwise
 */
function constructTable(_selector, grade) {
    for (let day = 0; day < 6; ++day) {
        // Getting the all column names
        let selector = _selector + (day + 1).toString();

        let cols = Headers(selector, grade, day);

        // Traversing the JSON data
        for (let i = 0; i < table[day].length; i++) {
            let row = $('<tr/>');
            for (let column = 0; column < cols.length; column++) {
                let val = table[day][i][cols[column]];
                if (val === "None") continue;

                // If there is any key, which is matching with the column name
                if (val == null) val = "";

                if (grade === "-1") {
                    row.append($('<td style="text-align:center; font-size:16px; background-color:rgb(' + color[day][i][column]["red"] * 255 + ',' +
                        color[day][i][column]["green"] * 255 + ',' + color[day][i][column]["blue"] * 255 + ')" colspan="' + colspan[day][i][column] + '"/>').html(
                            val
                    ));
                } else if (column >= grade_start[grade] && column < grade_start[grade] + headers_colspan[grade]) {
                    row.append($('<td style="text-align:center; font-size:16px; background-color:rgb(' + color[day][i][column]["red"] * 255 + ',' +
                        color[day][i][column]["green"] * 255 + ',' + color[day][i][column]["blue"] * 255 + ')" colspan="' + Math.min(colspan[day][i][column], grade_start[grade] + headers_colspan[grade] - column) + '"/>').html(
                            val
                    ));
                }
            }

            // Adding each row to the table
            $(selector).append(row);
        }
    }
}


/**
 * Created headers for a table
 *
 * @param selector type of the table
 * @param grade current grade, or -1 otherwise
 * @param day
 * @returns {*[]} columns
 */
function Headers(selector, grade, day) {
    let columns = [];
    let header = $('<tr/>');

    for (let i = 0; i < table.length; i++) {
        let row = table[day][i];

        for (let k in row) {
            if ($.inArray(k, columns) === -1) {
                columns.push(k);

                // Creating the header
                if (table_columns[k] !== undefined) {
                    if (grade === "-1" || grade === table_columns[k]) {
                        // header.append($('<th colspan="' + headers_colspan[table_columns[k]] + '"/>').html(table_columns[k]));
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

    constructTable('#table', "-1");  // HTML element & json element: timetable
}
