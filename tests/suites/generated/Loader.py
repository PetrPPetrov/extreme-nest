import os
import glob
import json


def test_list():
    dir_path = os.path.dirname(__file__)
    result = glob.glob(f'{dir_path}/*.json')
    return result


def load_from_file(filename: str):
    with open(filename) as f:
        data = json.load(f)
    return data
