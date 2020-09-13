import os
import uuid
import csv

from flask import (Flask,
                   request,
                   render_template,
                   jsonify,
                   send_from_directory)
import requests

# Local imports
import config
import labels


app = Flask(__name__)


@app.route('/print-label', methods=['POST'])
def print_label():
    # print("formdata:")
    # print(request.form)
    # print(request.form.get("Bin"))
    bin_number = request.form.get("Bin")

    # Fetch the data from the spreadsheet
    worksheet_url = "https://spreadsheets.google.com/feeds/list/{binTrackerID}/{binTrackerWorksheet}/public/values?alt=json".format(**config.values)
    bin_data = {}
    content = requests.get(worksheet_url).json()
    for entry in content['feed']['entry']:
        row_data = {}
        keys = [k.replace('gsx$', '') for k in entry if k.startswith('gsx$')]
        for key in keys:
            row_data[key] = entry['gsx$' + key]['$t']
        if "bin" in row_data:
            bin_data[row_data["bin"]] = row_data

    # print(binData)
    try:
        if bin_number in bin_data:
            print("Printing ", bin_data[bin_number])
            labels.printOneLabel(bin_data[bin_number])
            response = {
                "success": True
            }
        else:
            response = {
                "success": False,
                "error": "Unknown bin: '%s'"%(bin_number)
            }
    except Exception as e:
        print("Failed")
        print(str(e))
        response = {
            "success": False,
            "error_message": str(e)
        }
    
    return jsonify(response), 200

@app.route('/print-file', methods=['POST'])
def print_file():
    f = request.files['0']
    response = {
        "success": True
    }
    try:
        labels.printCSV(f)
    except Exception as e:
        print("Failed")
        print(str(e))
        response = {
            "success": False,
            "error_message": str(e)
        }
    
    return jsonify(response), 200    

@app.route('/', methods=['GET'])
def main():
    return render_template("index.html")

@app.route('/static/js/scripts.js', methods=['GET'])
def scripts():
    return render_template("scripts.js", **config.values)

@app.errorhandler(404)
def not_found(e):
    message = "404 We couldn't find the page"
    return render_template("index.html", error_message=message)


if __name__ == "__main__":
    IS_PROD = os.environ.get("PRODUCTION", False)
    app.run(debug=not IS_PROD, host="0.0.0.0", threaded=True)
