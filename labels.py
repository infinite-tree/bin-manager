import csv
import os
import subprocess
import time

# local imports
import config

PRODUCTION = os.getenv("PRODUCTION")

BIN_LABEL_FILE = os.path.join(os.path.dirname(__file__), "glabels", "bin-label.glabels")
PKG_LABEL_FILE = os.path.join(os.path.dirname(__file__), "glabels", "pkg-label.glabels")

TMP_DIR = os.path.join(os.path.dirname(__file__), "tmp")
LABEL_CSV = os.path.join(TMP_DIR, "label_data.csv")
PRINT_PDF = os.path.join(TMP_DIR, "labels.pdf")
MERGE_CSV = os.path.join(TMP_DIR, "merge.csv")


def printPDF(pdf_file):
    if PRODUCTION:
        subprocess.run(["lp", pdf_file])
    else:
        print("DEV MODE: Printed PDF: %s"%(pdf_file))
        time.sleep(0.5)


def _print(label_file):
    # generate the pdf to print
    if PRODUCTION:
        subprocess.run(["glabels-3-batch", "-i", MERGE_CSV, "-o", PRINT_PDF, label_file])
    else:
        print("Merge Contents: ")
        with open(MERGE_CSV) as f:
            print(f.read())
        print()
        time.sleep(0.5)

    printPDF(PRINT_PDF)
    # glabels-3-batch -i <input.csv> -o <output.pdf> <label.glabel>
    # lp <output.pdf>


def printOneBinLabel(merge_dict):
    '''
    Prints one label using the dictionary as the merge data
    '''
    # Convert Label data
    merge_map = config.values.get("mergeFields", {})
    new_merge = {}
    for k,v in merge_map.items():
        if type(v) is list:
            for key in v:
                if merge_dict.get(key):
                    new_merge[k] = merge_dict[key]
                    break
        else:
            new_merge[k] = merge_dict[v]
    
    # FIXME: remove this hack
    if merge_dict["State"] == "trimmed":
        new_merge["Lot"] = merge_dict["ProcessLot"]
    else:
        new_merge["Lot"] = merge_dict["HarvestLot"]


    # Generate the temporary csv file to merge with the labels
    with open(MERGE_CSV, "w") as f:
        w = csv.DictWriter(f, fieldnames=new_merge.keys())
        w.writeheader()
        w.writerow(new_merge)
    
    _print(BIN_LABEL_FILE)
    return
