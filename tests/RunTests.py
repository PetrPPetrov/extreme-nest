import itertools
import posixpath
from math import sqrt, radians, sin, cos
from time import sleep
import argparse
from requests import post, get, head
from copy import deepcopy

from GeometryUtils import Point, Vector, Segment, Curve, BBox, midpoint
from GeometryUtils import is_bboxes_intersect, is_curve_segment_intersect, is_curves_intersect, is_segments_overlap

import suites.generated.Loader as generated



def curve_control_point(a, b, sag) -> Point:
        halfchord = midpoint(a, b)
        ba_norm = Vector(a, b).normalize()
        # Cx = x * cos(a) + y * sin(a)
        # Cy = y * cos(a) - x * sin(a)
        # a = 90 if sag >= 0 and -90 otherwise.
        # cos(a) always = 0; sin(a) = 1 on sag >= 0, and -1 otherwise
        control_point = Point(-ba_norm.y * sag, ba_norm.x * sag)
        return Point(halfchord.x + control_point.x, halfchord.y + control_point.y)


class Part(object):
    def __init__(self, part: dict, transformation: dict):
        self.id = part['id']
        self.primitives = []        
        points = []
        control_points = []

        def shift(value: Point):
            for point in points:
                point.x += value.x
                point.y += value.y
            for point in control_points:
                point.x += value.x
                point.y += value.y

        geometry = part['geometry']
        if isinstance(geometry[0][0], list):
            prev_point = Point(geometry[0][-1][0], geometry[0][-1][1])
            for x, y in geometry[0]:
                point = Point(x, y)
                points.append(point)
                self.primitives.append(Segment(prev_point, point))
                prev_point = point
        else:
            prev = geometry[0][-1]
            prev_point = Point(prev['x'], prev['y'])
            for position in geometry[0][0]:
                point = Point(position['x'], position['y'])
                control_point = None
                if 'sag' in prev:
                    control_point = curve_control_point(prev, point, prev['sag'])
                elif 'bul' in prev:
                    chord = Point(prev.x + point.x, prev.y + point.y)
                    lenght = sqrt(chord.x * chord.x + chord.y * chord.y)
                    control_point = curve_control_point(prev, point, prev['bul'] * lenght * 0.5)
                elif 'cir' in prev:
                    cir = Point(prev['cir']['x'], prev['cir']['y'])
                    oa = Vector(cir, prev)
                    radius = oa.length()

                    x = midpoint(prev_point, point)
                    ox = Vector(cir, x)
                    dir = 1 if prev['cir']['dir'] else -1
                    oc = ox.normalize(radius * dir)
                    control_point = Vector(cir, oc)
                if control_point:
                    # points.append(control_point)
                    points.append(midpoint(midpoint(prev_point, control_point),
                                           midpoint(control_point, point)))
                    self.primitives.append(Curve(prev_point, control_point, point))
                else:
                    self.primitives.append(Segment(prev_point, point))
                points.append(point)
                prev_point = point

        bbox = BBox(points)
        angle = transformation.get('angle', None)
        if angle:
            rad_a = radians(angle)
            sin_a = sin(rad_a)
            cos_a = cos(rad_a)
            if bbox.min.x != 0.0 or bbox.min.y != 0.0:
                shift(Point(-bbox.min.x, -bbox.min.y))
            for point in points:
                x = point.x * cos_a - point.y * sin_a
                y = point.x * sin_a + point.y * cos_a
                point.x = x
                point.y = y
            bbox = BBox(points)
        flip = transformation.get('flip', False)
        if flip:
            if bbox.min.x != 0.0 or bbox.min.y != 0.0:
                shift(Point(-bbox.min.x, -bbox.min.y))
                bbox = BBox(points)
            for point in points:
                point.x = bbox.max.x - point.x
                point.y = bbox.max.y - point.y
            for point in control_points:
                point.x = bbox.max.x - point.x
                point.y = bbox.max.y - point.y
        self.bbox = bbox


def is_parts_intersects(part1: Part, part2: Part) -> bool:
    if not is_bboxes_intersect(part1.bbox, part1.bbox):
        return False
    for primitives1 in part1.primitives:
        for primitives2 in part2.primitives:
            if isinstance(primitives1, Segment):
                if isinstance(primitives2, Segment):
                    if is_segments_overlap(primitives1, primitives2):
                        is_segments_overlap(primitives1, primitives2)
                        return True
                elif isinstance(primitives2, Curve):
                    if is_curve_segment_intersect(primitives2, primitives1):
                        return True
                else:
                    raise ValueError
            elif isinstance(primitives1, Curve):
                if isinstance(primitives2, Segment):
                    if is_curve_segment_intersect(primitives1, primitives2):
                        return True
                elif isinstance(primitives2, Curve):
                    if is_curves_intersect(primitives1, primitives2):
                        return True
                else:
                    raise ValueError
            else:
                raise ValueError
    return False


def parse_geometry_description(data):
    sheets = dict()
    for sheet in data['sheets']:
        sheets[sheet['id']] = dict()
    parts = dict()
    for part in data['parts']:
        part_copy = deepcopy(part)
        instances = part_copy.pop('instances')
        for instance in instances:
            parts[instance['id']] = part_copy
            for key, value in instance.items():
                part_copy[key] = value
    return sheets, parts,


def parse_nesting(nesting, sheets, parts):
    result = []
    sheet_id = nesting['sheet']
    sheet = sheets[sheet_id]
    for nested_part in nesting.get('nested_parts', None):
        part = parts[nested_part['id']]
        quantity = part.get('quantity', 1)
        part['quantity'] = quantity-1
        if quantity <= 0:
            raise ValueError
        result.append(Part(part, nested_part))
    return result


def get_no_placed_parts_count(parts):
    result = 0
    for key, value in parts.items():
        result += value.get('quantity', 1)
    return result


def validate(data, response):
    sheets_description, parts_description = parse_geometry_description(data)
    for nesting in response["nestings"]:
        parts = parse_nesting(nesting, sheets_description, parts_description)
        first_it = iter(parts)
        for part1 in first_it:
            first_it, second_it = itertools.tee(first_it)
            try:
                next(second_it)
                for part2 in second_it:
                    if is_parts_intersects(part1, part2):
                        print(f'Error: on sheet {nesting["sheet"]} part {part1.id} intersect with part {part2.id}')
                        return False
            except StopIteration:
                continue
    no_placed_part_number = get_no_placed_parts_count(parts_description)
    if no_placed_part_number > 0:
        print(f'Error: {no_placed_part_number} part no placed')
        return False
    # TODO
    # 2.1) check polygon holes do not intersects with polygon geometry
    # 2.2) check polygon holes do not intersects with other polygons(with offset)
    return True


def parse_cmd_args():
    parser = argparse.ArgumentParser(prog='RunTests.py')
    parser.add_argument('-a', '--address', help='Server address', default='http://127.0.0.1:80')
    parser.add_argument('-j', '--jobs', help='Maximum number of simultaneously processed tests', type=int,
                        default=4)
    parser.add_argument('-s', '--suites', nargs='+', help='Test suites list', type=str,
                        default=['generated'])
    parser.add_argument('-w', '--wait', help='Waiting time between sending requests stats', type=float,
                        default=1.0)

    args = parser.parse_args()
    return args


class Test(object):
    def __init__(self, filename, load_func):
        self.filename = filename
        self.load_func = load_func
        self.data = None
        self.order_id = None


def main():
    args = parse_cmd_args()
    headers = {
        'Accept': 'application/json; charset=utf-8',
        'Content-type': 'application/json; charset=utf-8'
    }
    address = args.address
    suites_map = {
        'terashima1': terashima1,
        'poly': poly,
        'generated': generated,
    }
    tests = []

    for suite_name in args.suites:
        suite = suites_map.get(suite_name, None)
        if not suite:
            print(f'Warning: suite {suite_name} not found')
        else:
            test_list = suite.test_list()
            for filename in test_list:
                tests.append(Test(filename, suite.load_from_file))
    test_succeed = 0
    test_count = len(tests)

    # TODO check connection
    # if not check_connection(f'{address}/new'):
    #     print('Error: Server unavailable')
    #     return

    cur_tests = []
    for i in range(args.jobs):
        if not tests:
            break
        test = tests.pop()
        cur_tests.append(test)
        data = test.load_func(test.filename)
        test.data = data
        response = post(f'{address}/new', headers=headers, json=data)
        if not response.status_code == 201:
            print(f'Error: Failed to send request. Status code {response.status_code}.')
        result = response.json()
        test.order_id = result['nesting_order_id']

    while cur_tests or tests:
        for test in cur_tests:
            response = get(f'{address}/result/{test.order_id}/stats')
            if response.status_code == 202:
                pass
            else:
                cur_tests.remove(test)
                if validate(test.data, response.json()):
                    print(f'Test {test.filename} succeed')
                    test_succeed += 1
                else:
                    print(f'Test {test.filename} failed')
                print()
        sleep(args.wait)
        for index in range(args.jobs - len(cur_tests)):
            if not tests:
                break
            test = tests.pop()
            cur_tests.append(test)
            data = test.load_func(test.filename)
            test.data = data
            response = post(f'{address}/new', headers=headers, json=data)
            if not response.status_code == 201:
                print(f'Error: Failed to send request. Status code {response.status_code}.')
            result = response.json()
            test.order_id = result['nesting_order_id']
    print(f'Succeed {test_succeed} of {test_count} tests.')


if __name__ == '__main__':
    main()
