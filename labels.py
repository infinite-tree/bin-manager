import csv
import os
import subprocess
import time

# local imports
import config

PRODUCTION = os.getenv("PRODUCTION")

LABEL_FILE = os.path.join(os.path.dirname(__file__), "glabels", "label.glabels")

TMP_DIR = os.path.join(os.path.dirname(__file__), "tmp")
LABEL_CSV = os.path.join(TMP_DIR, "label_data.csv")
PRINT_PDF = os.path.join(TMP_DIR, "labels.pdf")
MERGE_CSV = os.path.join(TMP_DIR, "merge.csv")


def _print():
    # generate the pdf to print
    if PRODUCTION:
        subprocess.run(["glabels-3-batch", "-i", MERGE_CSV, "-o", PRINT_PDF, LABEL_FILE])
        subprocess.run(["lp", PRINT_PDF])
    else:
        time.sleep(1.5)

    # glabels-3-batch -i <input.csv> -o <output.pdf> <label.glabel>
    # lp <output.pdf>


def printOneLabel(merge_dict):
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
    if merge_dict["state"] == "trimmed":
        new_merge["Lot"] = merge_dict["processlot"]
    else:
        new_merge["Lot"] = merge_dict["harvestlot"]


    # Generate the temporary csv file to merge with the labels
    with open(MERGE_CSV, "w") as f:
        w = csv.DictWriter(f, fieldnames=new_merge.keys())
        w.writeheader()
        w.writerow(new_merge)
    
    _print()
    return
