
var appendToJournal = function(entry) {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/{{ binTrackerID }}/values/Journal!A2:B2:append?valueInputOption=RAW&key={{ googleAPIKey }}";
    var d = new Date();
    var journal_entry = {
        "range": "Journal!A2:B2",
        "majorDimension": "ROWS",
        "values": [
            [d.toString(), entry]
        ]
    };
    
    // return fetch(encodeURI(url), {
    //     method: 'POST',
    //     headers: {
    //         contentType: 'application/json'
    //     },
    //     body: JSON.stringify(journal_entry)
    // });
    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: '{{ binTackerID }}',
        range: 'Journal!A2:B2',
        valueInputOption: 'RAW',
        resource: { values: [[d.toString(), entry]]}
     }).then((response) => {
       var result = response.result;
       console.log(`${result.updates.updatedCells} cells appended.`)
     });
};


const createBinScriptURL = '{{ createBinScriptURL }}';
var createBinForm;
var createBinSetup = function() {
    populateCultivars();
    // Setup the form
    createBinForm = document.forms['createNewBin'];
    createBinForm.addEventListener('submit', e => {
        e.preventDefault();
        $('#createBinForm').addClass('hidden');
        $('#createBinProcessing').removeClass('hidden');

        var formData = new FormData(createBinForm);
        appendToJournal('CREATE BIN: ' + JSON.stringify(Object.fromEntries(formData))).then(response => response.json()).then(journal_response => {
            fetch(createBinScriptURL, {
                method: 'POST',
                body: formData
            }).then(response => response.json()).then(data => {
                if (data["result"] === "error") {
                    console.log(data["error"]);
                    $('#createBinForm').trigger("reset");
                    $('#createBinProcessing').addClass('hidden');
                    $('#createBinPrinting').addClass('hidden');
                    $('#createBinFailed').removeClass('hidden');
                    return;
                }

                $('#createBinForm').trigger("reset");
                $('#createBinProcessing').addClass('hidden');
                $('#createBinPrinting').removeClass('hidden');

                var form_data = new FormData();
                form_data.append('Bin', data["Bin"]);
                fetch(printBinURL, {
                    method: 'POST',
                    body: form_data
                }).then(response => response.json()).then(data => {
                    $('#createBinPrinting').addClass('hidden');
                    $('#createBinSuccess').removeClass('hidden');
                    setTimeout(function() {
                        $('#createBinSuccess').addClass('hidden');
                        $('#createBinForm').removeClass('hidden');
                    }, 1500);    
                }).catch(error => {
                    console.log(error);
                    $('#createBinForm').trigger("reset");
                    $('#createBinProcessing').addClass('hidden');
                    $('#createBinPrinting').addClass('hidden');
                    $('#createBinFailed').removeClass('hidden');
                });
            }).catch(error => {
                console.log(error);
                $('#createBinForm').trigger("reset");
                $('#createBinProcessing').addClass('hidden');
                $('#createBinPrinting').addClass('hidden');
                $('#createBinFailed').removeClass('hidden');
            });
        });
    });
};

var checkoutBinForm;
var checkoutBinSetup = function() {
    checkoutBinForm = document.forms['checkoutBin'];
    checkoutBinForm.addEventListener('submit', e => {
        e.preventDefault();
        $('#checkoutBinForm').addClass('hidden');
        $('#checkoutBinProcessing').removeClass('hidden');
        var data = new FormData(checkoutBinForm);
        console.log(data);
        appendToJournal('CHECKOUT BIN: ' + JSON.stringify(Object.fromEntries(data))).then(response => response.json()).then(journal_response => {
            fetch(createBinScriptURL, {
                method: 'POST',
                body: new FormData(checkoutBinForm)
            }).then(response => response.json()).then(data => {
                if (data["result"] === "error") {
                    console.log(data["error"]);
                    $('#createBinForm').trigger("reset");
                    $('#createBinProcessing').addClass('hidden');
                    $('#createBinPrinting').addClass('hidden');
                    $('#createBinFailed').removeClass('hidden');
                    return;
                }
                
                // clear form and bin values
                $('#checkoutBinForm').trigger("reset");
                $('#checkoutBinContainer').empty();
                $('#checkoutBinProcessing').addClass('hidden');
                $('#checkoutBinSuccess').removeClass('hidden');

                setTimeout(function() {
                    $('#checkoutBinSuccess').addClass('hidden');
                    $('#checkoutBinForm').removeClass('hidden');
                }, 1500);    
            }).catch(error => {
                console.log(error);
                $('#checkoutBinForm').trigger("reset");
                $('#checkoutBinProcessing').addClass('hidden');
                $('#checkoutBinFailed').removeClass('hidden');
            });
        });
    });
};

var checkinBinForm;
var checkinBinSetup = function() {
    checkinBinForm = document.forms['checkinBin'];
    checkinBinForm.addEventListener('submit', e => {
        e.preventDefault();
        $('#checkinBinForm').addClass('hidden');
        $('#checkinBinProcessing').removeClass('hidden');
        var data = new FormData(checkinBinForm);
        console.log(data);
        fetch(createBinScriptURL, {
            method: 'POST',
            body: new FormData(checkinBinForm)
        }).then(response => response.json()).then(data => {
            // clear form and bin values
            $('#checkinBinForm').trigger("reset");
            $('#checkinBinContainer').empty();

            $('#checkinBinProcessing').addClass('hidden');
            $('#checkinBinPrinting').removeClass('hidden');

            // trigger the printing!
            // using the response object
            var form_data = new FormData();
            form_data.append('Bin', data["Bin"]);
            fetch(printBinURL, {
                method: 'POST',
                body: form_data
            }).then(response => response.json()).then(data => {
                $('#checkinBinPrinting').addClass('hidden');
                $('#checkinBinSuccess').removeClass('hidden');
                setTimeout(function() {
                    $('#checkinBinSuccess').addClass('hidden');
                    $('#checkinBinForm').removeClass('hidden');
                }, 1500);    
            }).catch(error => {
                console.log(error);
                $('#checkinBinForm').trigger("reset");
                $('#checkinBinProcessing').addClass('hidden');
                $('#checkinBinFailed').removeClass('hidden');
            });
        }).catch(error => {
            console.log(error);
            $('#checkinBinForm').trigger("reset");
            $('#checkinBinProcessing').addClass('hidden');
            $('#checkinBinFailed').removeClass('hidden');
        });
    });
};

const printBinURL = '/print-label';
var printBinForm;
var printBinSetup = function() {
    printBinForm = document.forms["printBin"];
    printBinForm.addEventListener('submit', e => {
        e.preventDefault();
        $('#printBinForm').addClass('hidden');
        $('#printBinProcessing').removeClass('hidden');
        var data = new FormData(printBinForm);
        console.log(data);
        fetch(printBinURL, {
            method: 'POST',
            body: new FormData(printBinForm)
        }).then(response => response.json()).then(data => {
            console.log("Print result: %o", data);

            $('#printBinForm').trigger("reset");
            $('#printBinContainer').empty();
            $('#printBinProcessing').addClass('hidden');
            $('#printBinSuccess').removeClass('hidden');
            setTimeout(function() {
                $('#printBinSuccess').addClass('hidden');
                $('#printBinForm').removeClass('hidden');
            }, 1500);
        }).catch(error => {
            console.log(error);
            $('#printBinForm').trigger("reset");
            $('#printBinProcessing').addClass('hidden');
            $('#printBinFailed').removeClass('hidden');
        });
    });
};

var consolidateBinForm;
var consolidateBinSetup = function() {
    // Setup the form
    consolidateBinForm = document.forms['consolidateBin'];
    consolidateBinForm.addEventListener('submit', e => {
        e.preventDefault();
        $('#consolidateBinForm').addClass('hidden');
        $('#consolidateBinProcessing').removeClass('hidden');

        // populate the weight for creating a new bin
        var material_state = $("#consolidateBinWeight").val();
        var weight = $("#consolidateBinWeight").val();
        if (material_state === "trimmed") {
            consolidateBinForm.append('<input type="hidden" name="TrimmedWeight" value="' + weight + '">');
        } else {
            consolidateBinForm.append('<input type="hidden" name="RawWeight" value="' + weight + '">');
        }

        // Disable the button
        $("#consolidateBinButton").prop("disabled", true);

        // FIXME: add the journal entry

        // FIXME: update each bin to consolidated

        // FIXME: clear the conslidation table

        fetch(createBinScriptURL, {
            method: 'POST',
            body: new FormData(consolidateBinForm)
        }).then(response => response.json()).then(data => {
            if (data["result"] === "error") {
                console.log(data["error"]);
                $("#consolidateTableBody").empty();
                $('#consolidateBinForm').trigger("reset");
                $('#consolidateBinProcessing').addClass('hidden');
                $('#consolidateBinPrinting').addClass('hidden');
                $('#consolidateBinFailed').removeClass('hidden');
                return;
            }

            $("#consolidateTableBody").empty();
            $('#consolidateBinForm').trigger("reset");
            $('#consolidateBinProcessing').addClass('hidden');
            $('#consolidateBinPrinting').removeClass('hidden');

            var form_data = new FormData();
            form_data.append('Bin', data["Bin"]);
            fetch(printBinURL, {
                method: 'POST',
                body: form_data
            }).then(response => response.json()).then(data => {
                $('#consolidateBinPrinting').addClass('hidden');
                $('#consolidateBinSuccess').removeClass('hidden');
                setTimeout(function() {
                    $('#consolidateBinSuccess').addClass('hidden');
                    $('#consolidateBinForm').removeClass('hidden');
                }, 1500);    
            }).catch(error => {
                console.log(error);
                $("#consolidateTableBody").empty();
                $('#consolidateBinForm').trigger("reset");
                $('#consolidateBinProcessing').addClass('hidden');
                $('#consolidateBinPrinting').addClass('hidden');
                $('#consolidateBinFailed').removeClass('hidden');
            });
        }).catch(error => {
            console.log(error);
            $("#consolidateTableBody").empty();
            $('#consolidateBinForm').trigger("reset");
            $('#consolidateBinProcessing').addClass('hidden');
            $('#consolidateBinPrinting').addClass('hidden');
            $('#consolidateBinFailed').removeClass('hidden');
        });
    });
};


var populateBinInfo = function(bin_container, bin_info) {
    $(bin_container).append('<br><label class="bold">Bin:</label> ' + bin_info["Bin"] + '<br>');
    $(bin_container).append('<br><label class="bold">Cultivar:</label> ' + bin_info["Cultivar"] + '<br>');
    $(bin_container).append('<br><label class="bold">Water Activity:</label> ' + bin_info["WaterActivity"] + '<br>');
    $(bin_container).append('<br><label class="bold">Raw Weight:</label> ' + bin_info["RawWeight"] + '<br>');
    $(bin_container).append('<br><label class="bold">State:</label><b class="' + bin_info["State"] + '"> ' + bin_info["State"] + '</b><br>');
    $(bin_container).append('<br><label class="bold">Trimmer:</label> ' + bin_info["Trimmer"] + '<br>');
    
    $(bin_container + 'Bin').val(bin_info["Bin"]);
    
    var notes = "";
    if ("notes" in bin_info) {
        notes = bin_info["Notes"];
        // HACK:
        $(bin_container + 'Notes').val(notes);
    }    
    $(bin_container).append('<br><label class="bold">Notes:</label> ' + notes + '<br>');

};

var CONSOLIDATE_TABLE = [];
var populateConsolidateTable = function(table_id, bin_info) {
    if (CONSOLIDATE_TABLE.length > 0 && CONSOLIDATE_TABLE[0]["Cultivar"] !== bin_info["Cultivar"]) {
        alert('Bin ' + bin_info["Bin"] + ' is not ' + CONSOLIDATE_TABLE[0]["Cultivar"]);
        return;
    }

    CONSOLIDATE_TABLE.push(bin_info);
    var row = '<tr><th scope="row">' + bin_info["Bin"] + '</th>';
    row = row + '<td>' + bin_info["Cultivar"] + "</td>";
    row = row + '<td>' + bin_info["Size"] + "</td>";
    row = row + '<td>' + bin_info["State"] + '</td>';
    row = row + '<td>' + bin_info["Notes"] + '</td></tr>';
    $(table_id).append(row)

    // Populate Water Activity
    var wa_values = [];
    for (i in CONSOLIDATE_TABLE) {
        var wa = parseFloat(CONSOLIDATE_TABLE[i]["WaterActivity"]);
        if (wa > 0) {
            wa_values.push(wa);
        }
    }
    $("#consolidateWA").val(Math.max.apply(null, wa_values));

    // Default Material State
    var default_state = "";
    for (i in CONSOLIDATE_TABLE) {
        if (CONSOLIDATE_TABLE[i]["State"] === "trimmed" || CONSOLIDATE_TABLE[i]["State"] === "checkedout") {
            default_state = "trimmed";
            break;
        } else if (CONSOLIDATE_TABLE[i]["State"] === "bucked") {
            default_state = "bucked";
        }
    }
    if (default_state !== "") {
        var state_name = default_state.substr(0,1).toUpperCase() + default_state.substr(1);
        $("#consolidateBin" + state_name).attr('checked', 'checked');
    }

    // Populate Harvest Date
    var harvest_dates = [];
    for (i in CONSOLIDATE_TABLE) {
        harvest_dates.push(CONSOLIDATE_TABLE[i]["HarvestDate"]);
    }
    harvest_dates.sort();
    $("#consolidateBinHarvestDate").val(harvest_dates[0]);

    // Populate cultivar
    $("#consolidateBinCultivar").val(CONSOLIDATE_TABLE[0]["Cultivar"]);

    // Populate Trimmed vs Raw Weight
    // See consolidateBinSetup. This has to happen aftet the user confirms the material state

    // Enable the button
    if(CONSOLIDATE_TABLE.length > 1) {
        $("#consolidateBinButton").prop('disabled', false);
    }
};

const binTrackerID = '{{ binTrackerID }}';
var findBin = function(bin_container, bin_field, populate_function) {
    var bin_number = $(bin_field).val();
    if (bin_number === "") {
        return;
    }

    var url = "https://sheets.googleapis.com/v4/spreadsheets/{{ binTrackerID }}/values/Storage Inventory!A1:Z?key={{ googleAPIKey }}";
    $.getJSON(encodeURI(url), function(data) {
        var keys = [];
        for (i in data["values"][0]) {
            keys.push(data["values"][0][i]);
        }

        for (i in data["values"]) {
            if ( i== 0) {
                continue;
            }

            // get the cells
            var row = data["values"][i];
            var bin_info = {};
            for (x in keys) {
                bin_info[keys[x]] = row[x] !== undefined ? row[x].trim(): "";
            }
            // console.log(bin_info);
            if (bin_info["Bin"] === bin_number) {
                console.log("bin_info %o", bin_info);
                populate_function(bin_container, bin_info);
                return;
            }
        }
    })
    .fail(function(err){
        console.log('error!', err);
        alert("Failed to fetch Storage Inventory");
    });
};

var populateCultivars = function() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '{{ binTrackerID }}',
        range: 'Cultivars!A2:A',
    }).then(function(response) {
        var range = response.result;
        if (range.values.length > 0) {
            // console.log(range.values);
            for (i = 0; i < range.values.length; i++) {
                var row = range.values[i];
                var x = i+1;
                $('#cultivarList').append('<input type="radio" value="' + row[0] + '" name="Cultivar" id="cult' + x + '" required><label for="cult' + x + '"> &nbsp; '+ row[0] + '</label><br>\n')
            }
        }
      }, function(response) {
        alert("Failed to fetch Cultivars from Google");
    });
};


var findCheckoutBin = function() {
    $('#checkoutBinContainer').empty();
    $('#checkoutBinContainerNotes').val('');
    findBin("#checkoutBinContainer", "#checkoutBinID", populateBinInfo);
};


var findCheckinBin = function() {
    $('#checkinBinContainer').empty();
    findBin("#checkinBinContainer", "#checkinBinID", populateBinInfo);
};


var findPrintBin = function() {
    $('#printBinContainer').empty();
    findBin("#printBinContainer", "#printBinID", populateBinInfo);
};


var addConsolidationBin = function() {
    findBin("#consolidateTableBody", "#addConsolidateBinID", populateConsolidateTable);
    $('#addConsolidateBinID').val('');
};


var binManagerInit = function() {
    createBinSetup();
    checkoutBinSetup();
    checkinBinSetup();
    consolidateBinSetup();
    printBinSetup();

    $("#checkoutBinFilter").click(findCheckoutBin);
    $("#checkoutBinID").keyup(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            findCheckoutBin();
        }
    });

    $("#checkinBinFilter").click(findCheckinBin);
    $("#checkinBinID").keyup(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            findCheckinBin();
        }
    });

    $("#addConsolidateBinButton").click(addConsolidationBin);
    $("#addConsolidateBinID").keyup(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            addConsolidationBin();
        }
    });

    $("#printBinFilter").click(findPrintBin);
    $("#printBinID").keyup(function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            findPrintBin();
        }
    });

};

// 
// Application Entry Point
// 
$(function () {
    startGAuth(binManagerInit);
});