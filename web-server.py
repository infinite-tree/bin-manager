import datetime
import os
import uuid
import csv

from flask import (Flask,
                   request,
                   render_template,
                   jsonify,
                   send_from_directory)
import requests
from requests.utils import requote_uri

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
    worksheet_url = "https://sheets.googleapis.com/v4/spreadsheets/{binTrackerID}/values/Storage Inventory!A1:Z?key={googleAPIKey}".format(**config.values)
    bin_data = {}
    content = requests.get(requote_uri(worksheet_url), headers={"referer": "http://bin-manager.infinite-tree.com"}).json()
    # There should be data in the shett at this point
    if 'values' not in content:
        response = {
            "success": False,
            "error": "Unknown response from google: %s"%(str(content))
        }
        return jsonify(response), 500

    keys = content['values'][0]
    for row in content['values'][1:]:
        row_data = {}
        for x,key in enumerate(keys):
            if x < len(row):
                row_data[key] = row[x]
            else:
                row_data[key] = ""
        if "Bin" in row_data:
            bin_data[row_data["Bin"]] = row_data

    # print(binData)
    code = 200
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
            code = 400
    except Exception as e:
        print("Failed")
        print(str(e))
        response = {
            "success": False,
            "error_message": str(e)
        }
        code = 500
    
    return jsonify(response), code

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
    today = datetime.datetime.today()
    min_days = (today - datetime.timedelta(days=18)).strftime("%Y-%m-%d")
    return render_template("index.html", min=min_days, max=today.strftime("%Y-%m-%d"))

@app.route('/static/js/gauth.js', methods=['GET'])
def gauth():
    return render_template("gauth.js", **config.values)

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
