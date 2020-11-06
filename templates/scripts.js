var binManagerReady = false;
var appendToJournal = function(entry) {
    var d = new Date();
    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: '{{ binTrackerID }}',
        range: 'Journal!A2:B2',
        valueInputOption: 'RAW',
        resource: { values: [[d.toString(), entry]]}
     }).then((response) => {
        var result = response.result;
        // console.log(`${result.updates.updatedCells} cells appended to Journal.`)
     }).catch(error => {
         alert("Failed to write Journal entry. Its Ryan time"); 
    });
};

var addConsolidationToJournal = function(old_bins, new_bin) {
    var d = new Date();
    var values = [];
    for (i in old_bins) {
        values.push([d.toString(), 'CONSOLIDATE BIN: ' + JSON.stringify(old_bins[i])]);
    }
    values.push([d.toString(), 'NEW CONSOLIDATED BIN: ' + JSON.stringify(new_bin)]);

    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: '{{ binTrackerID }}',
        range: 'Journal!A2:B2',
        valueInputOption: 'RAW',
        resource: { values: values}
     }).then((response) => {
        var result = response.result;
        // console.log(`${result.updates.updatedCells} cells appended to Journal.`)
     }).catch(error => {
         alert("Failed to write Consolidation Journal entry. Its Ryan time"); 
    });
}

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

        var data = new FormData(createBinForm);
        appendToJournal('CREATE BIN: ' + JSON.stringify(Object.fromEntries(data))).then(journal_response => {
            fetch(createBinScriptURL, {
                method: 'POST',
                body: data
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
        // console.log(data);
        appendToJournal('CHECKOUT BIN: ' + JSON.stringify(Object.fromEntries(data))).then(journal_response => {
            fetch(createBinScriptURL, {
                method: 'POST',
                body: data
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
        // console.log(data);
        appendToJournal('CHECKIN BIN: ' + JSON.stringify(Object.fromEntries(data))).then(journal_response => {
            fetch(createBinScriptURL, {
                method: 'POST',
                body: data
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

var consolidateOldBins = function(old_bins) {
    var fetch_calls = [];
    for (i in old_bins) {
        // Build the form data obj from the dictionary
        var form_data = new FormData();
        for ( var key in old_bins[i] ) {
            form_data.append(key, old_bins[i][key]);
        }

        // 
        // Set the New State
        // 
        form_data.set('State', 'consolidated')

        // make the fetch call
        var p = fetch(createBinScriptURL, {
            method: 'POST',
            body: form_data
        }).then(response => response.json()).catch(error => {
            alert("Failed to update bin: " + error);
        });
        fetch_calls.push(p);
    }
    // Wait on the results of all the fetch calls
    return Promise.all(fetch_calls).then(results => {
        for ( i in results) {
            console.log("consolidate old bin result: %o", results[i]);
        }
        return results;
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

        // Disable the button
        $("#consolidateBinButton").prop("disabled", true);

        // populate the weight for creating a new bin
        var data = new FormData(consolidateBinForm);
        var material_state = data.get("State");
        var weight = $("#consolidateBinWeight").val();
        if (material_state === "trimmed") {
            data.set('TrimmedWeight', weight);
        } else {
            data.set('RawWeight', weight);
        }

        // Hack for disabled fields (prefer it greyed out so no "readonly" tag)
        data.set('WaterActivity', $("#consolidateWA").val());

        console.log(data);
        
        // Add the journal entries
        addConsolidationToJournal(CONSOLIDATE_TABLE, Object.fromEntries(data)).then(journal_response => {
            // update each bin to consolidated
            consolidateOldBins(CONSOLIDATE_TABLE).then(reponse => {
                // clear the conslidation table
                CONSOLIDATE_TABLE = [];

                fetch(createBinScriptURL, {
                    method: 'POST',
                    body: data
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
    if ("Notes" in bin_info) {
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

var findBin = function(bin_container, bin_field, populate_function) {
    var bin_number = $(bin_field).val();
    if (bin_number === "") {
        return;
    }
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '{{ binTrackerID }}',
        range: 'Storage Inventory!A1:Z',
    }).then(function(response) {
        var range = response.result;
        if (range.values.length > 0) {
            // console.log(range.values);
            var keys = [];
            for (i in range.values[0]) {
                keys.push(range.values[0][i]);
            }

            for (i = 1; i < range.values.length; i++) {
                var row = range.values[i];
                var bin_info = {};

                // get the cells
                for (x in keys) {
                    bin_info[keys[x]] = row[x] !== undefined ? row[x].trim(): "";
                }
                // console.log(bin_info);
                if (bin_info["Bin"] === bin_number) {
                    console.log("bin_info %o", bin_info);
                    $(bin_field).val("");
                    populate_function(bin_container, bin_info);
                    return;
                }
            }
        }
    }, function(error) {
        alert("Failed to fetch Storage Inventory from Google");
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
      }, function(error) {
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
    if (binManagerReady) {
        return;
    }
    binManagerReady = true;
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