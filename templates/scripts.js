const createBinScriptURL = '{{ createBinScriptURL }}';

var createBinForm;
var createBinSetup = function() {
    // FIXME: re-enable
    populateCultivars();
    // Setup the form
    createBinForm = document.forms['createNewBin'];
    createBinForm.addEventListener('submit', e => {
        e.preventDefault();
        $('#createBinForm').addClass('hidden');
        $('#createBinProcessing').removeClass('hidden');
        fetch(createBinScriptURL, {
            method: 'POST',
            body: new FormData(createBinForm)
        }).then(response => response.json()).then(data => {
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
            })
        }).catch(error => {
            $('#createBinForm').trigger("reset");
            $('#createBinProcessing').addClass('hidden');
            $('#createBinPrinting').addClass('hidden');
            $('#createBinFailed').removeClass('hidden');
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
        fetch(createBinScriptURL, {
            method: 'POST',
            body: new FormData(checkoutBinForm)
        }).then(response => response.json()).then(data => {
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
            })
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


var populateBinInfo = function(bin_container, bin_info) {
    $(bin_container).append('<br><label class="bold">Bin:</label> ' + bin_info["bin"] + '<br>');
    $(bin_container).append('<br><label class="bold">Cultivar:</label> ' + bin_info["cultivar"] + '<br>');
    $(bin_container).append('<br><label class="bold">Water Activity:</label> ' + bin_info["wateractivity"] + '<br>');
    $(bin_container).append('<br><label class="bold">Raw Weight:</label> ' + bin_info["rawweight"] + '<br>');
    $(bin_container).append('<br><label class="bold">State:</label><b class="' + bin_info["state"] + '"> ' + bin_info["state"] + '</b><br>');
    $(bin_container).append('<br><label class="bold">Trimmer:</label> ' + bin_info["trimmer"] + '<br>');
    
    $(bin_container + 'Bin').val(bin_info["bin"]);
    
    var notes = "";
    if ("notes" in bin_info) {
        notes = bin_info["notes"];
        // HACK:
        $(bin_container + 'Notes').val(notes);
    }    
    $(bin_container).append('<br><label class="bold">Notes:</label> ' + notes + '<br>');

};

const binTrackerID = '{{ binTrackerID }}';
const binTrackerWorksheet = '{{ binTrackerWorksheet }}';
var findBin = function(bin_container, bin_field) {
    var bin_number = $(bin_field).val();
    if (bin_number === "") {
        return;
    }

    $.googleSheetToJSON(binTrackerID, binTrackerWorksheet)
    .done(function(rows){
        rows.forEach(function(row){
            bin_info = {};
            Object.getOwnPropertyNames(row).forEach(function(name) {
                bin_info[name] = row[name].trim();
            });
            if (bin_info["bin"] === bin_number) {
                console.log("bin_info %o", bin_info);
                populateBinInfo(bin_container, bin_info);
            }

        });
    })
    .fail(function(err){
        console.log('error!', err);
    });
};

// Code can be found using https://spreadsheets.google.com/feeds/worksheets/SPREADSHEET_ID/public/full?alt=json
const cultivarTrackerWorksheet = '{{ cultivarTrackerWorksheet }}';
var populateCultivars = function() {
    $.googleSheetToJSON(binTrackerID, cultivarTrackerWorksheet)
    .done(function(rows){
        var x = 1;
        rows.forEach(function(row){
            $('#cultivarList').append('<input type="radio" value="' + row['name'] + '" name="Cultivar" id="cult' + x + '"><label for="cult' + x + '">'+ row['name'] + '</label><br>\n')
            x = x + 1;
        });
    });
    $('#cultivarList').append('<br>')
};


var findCheckoutBin = function() {
    $('#checkoutBinContainer').empty();
    $('#checkoutBinContainerNotes').val('');
    findBin("#checkoutBinContainer", "#checkoutBinID");
};


var findCheckinBin = function() {
    $('#checkinBinContainer').empty();
    findBin("#checkinBinContainer", "#checkinBinID");
};


var findPrintBin = function() {
    $('#printBinContainer').empty();
    findBin("#printBinContainer", "#printBinID");
};

$(function () {  
    createBinSetup();
    checkoutBinSetup();
    checkinBinSetup();
    printBinSetup();

    $("#checkoutBinFilter").click(findCheckoutBin);
    $("#checkinBinFilter").click(findCheckinBin);
    $("#printBinFilter").click(findPrintBin);

});