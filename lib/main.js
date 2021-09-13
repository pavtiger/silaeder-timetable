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
 *
 */
function clickCell(input) {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
}


// When the user clicks on <span> (x), close the modal
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    var modal = document.getElementById("myModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
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

                let colspan_length, in_range = (column >= grade_start[grade] && column < grade_start[grade] + headers_colspan[grade]);
                if (grade === "-1") {
                    colspan_length = colspan[day][i][column];
                } else if (in_range) {
                    colspan_length = Math.min(colspan[day][i][column], grade_start[grade] + headers_colspan[grade] - column);
                }
                let cl = 'rgb(' + color[day][i][column]["red"] * 255 + ',' +
                    color[day][i][column]["green"] * 255 + ',' +
                    color[day][i][column]["blue"] * 255 + ')';
                let subcl = '#0F0E17';

                // Change parsed colors to better-looking ones
                if (cl === 'rgb(255,255,255)') {
                    // Just black
                    console.log(val);
                    if (val === "") {
                        // Empty cell
                        cl = '#0F0E17';
                    } else {
                        cl = '#152030';
                    }
                } else if (cl === 'rgb(255,255,0)') {
                    // Orange
                    cl = '#FF8906';
                    subcl = '#FFAF42';
                } else if (cl === 'rgb(212.9999955,166.000002,189.0000075)') {
                    cl = '#7C5295'
                    subcl = '#663A82';  // Purple
                } else if (cl === 'rgb(183.0000105,183.0000105,183.0000105)') {
                    subcl = '#9E9E9E';  // Grey
                } else if (cl === 'rgb(0,255,255)') {
                    // Blue
                    cl = '#4ADEDE';
                    subcl = '#6F8FAD';
                } else if (cl === 'rgb(173.000007,255,90.000006)') {
                    // Light green
                    cl = '#B5E550';
                    subcl = '#607C3C';
                } else if (cl === 'rgb(0,255,0)') {
                    // Green
                    cl = '#4E9C81';
                    subcl = '#207567';
                }

                if (grade === "-1" || in_range) {
                    row.append($('<td style="background:linear-gradient(' + (125 + Math.random() * 30).toString() +
                        'deg, ' + subcl + ', 55%, ' + cl + '); ' +
                        'font-family:Whitney, sans-serif;line-height:15px;' +
                        'text-align:center; color:#FFF9E9; font-size:13px;" colspan="' + colspan_length + '"/>').html(
                        val
                    ).on("click", {i: i, j: column}, clickCell));
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
                        header.append($('<th style="background:linear-gradient(0deg, #F25F4C, 10%, #E53170); color:#FFF9E9" colspan="' + headers_colspan[table_columns[k]] + '"/>').html(table_columns[k]));
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
