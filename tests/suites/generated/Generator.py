import json
import random
import time
from argparse import ArgumentParser


class Cell:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.value = 0


class Field:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.cells = [[Cell(x, y) for x in range(width)] for y in range(height)]
        self.parts = []
        self.free_cells = width * height

    def print(self):
        for i in range(self.height):
            print([cell.value for cell in self.cells[i]])
        print()

    def add_part(self, part):
        self.parts.append(part)
        self.free_cells -= 1

    def cell_value(self, x, y):
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.cells[y][x].value
        return None


class Part:
    def __init__(self, uid, field, cells):
        self.uid = uid
        self.field = field
        self.cells = []
        self.connected = []

        for x, y in cells:
            self.add(x, y)

    def add(self, x, y):
        if x > 0 and self.field.cells[y][x-1].value == 0:
            self.connected.append(self.field.cells[y][x-1])
        if x < self.field.width-1 and self.field.cells[y][x+1].value == 0:
            self.connected.append(self.field.cells[y][x+1])
        if y > 0 and self.field.cells[y-1][x].value == 0:
            self.connected.append(self.field.cells[y-1][x])
        if y < self.field.height-1 and self.field.cells[y+1][x].value == 0:
            self.connected.append(self.field.cells[y+1][x])
        self.cells.append(self.field.cells[y][x])
        self.field.cells[y][x].value = self.uid

    def _check_connected(self):
        for cell in self.connected[:]:
            if cell.value != 0:
                self.connected.remove(cell)

    def grow(self):
        self._check_connected()
        if self.connected:
            new = random.choice(self.connected)
            self.add(new.x, new.y)
            self.field.free_cells -= 1
            self.connected.remove(new)


class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y


# Not magic numbers, just optimization
# X = x * cos(a) + y * sin(a)
# Y = y * cos(a) - x * sin(a)
# a = -90 / 0 / 90 degree
# cos(a) = 0 / 1 / 0 respectively
# sin(a) = -1 / 0 / 1 respectively
# Axis Y are inverted
def left(prev: Cell, current: Cell) -> Vector:
    dx = current.x - prev.x
    dy = current.y - prev.y
    assert((abs(dx) == 1) ^ (abs(dy) == 1))
    assert((dx == 0) ^ (dy == 0))
    return Vector(dy, -dx)

def forward(prev: Cell, current: Cell) -> Vector:
    dx = current.x - prev.x
    dy = current.y - prev.y
    assert((abs(dx) == 1) ^ (abs(dy) == 1))
    assert((dx == 0) ^ (dy == 0))
    return Vector(dx, dy)

def right(prev: Cell, current: Cell) -> Vector:
    dx = current.x - prev.x
    dy = current.y - prev.y
    assert((abs(dx) == 1) ^ (abs(dy) == 1))
    assert((dx == 0) ^ (dy == 0))
    return Vector(-dy, dx)

def get_point(cur_cell: Cell, direction: Vector) -> [int, int]:
    x = cur_cell.x + direction.x
    y = cur_cell.y + direction.y
    if direction.y == 1:
        x += 1
    if direction.y == -1:
        y += 1
    if direction.x == -1:
        y += 1
        x += 1
    return [x, y]

def optimize_geometry(geometry):
    result = []
    iterator = iter(geometry)
    prev_x, prev_y = next(iterator)
    result.append([prev_x, prev_y])
    x, y = next(iterator)
    while True:
        try:
            result.append([x, y])
            if x == prev_x:
                while x == prev_x:
                    result[-1] = [x, y]
                    x, y = next(iterator)
            elif y == prev_y:
                while y == prev_y:
                    result[-1] = [x, y]
                    x, y = next(iterator)
            prev_x, prev_y = result[-1]
        except StopIteration:
            break
    if result[0] == result[-1]:
        result.pop()
    return result

def field_to_json(field: Field):
    parts = []
    result = {
        'parts': parts,
        'sheets': [{
            'height': field.height+1,
            'length': field.width+1,
            'id': 1
        }],
        'time': 60
    }
    for part in field.parts:
        geometry = []
        json_part = {
            'geometry': [geometry],
            'instances': [{
                'id': part.uid
                #   TODO add angles
            }]
        }
        first_cell: Vector = Vector(None, None)
        for y, row in enumerate(field.cells):
            finded = False
            for x, cell in enumerate(row):
                if cell.value == part.uid:
                    finded = True
                    first_cell.x = x
                    break
            if finded:
                first_cell.y = y
                break
        assert(first_cell.y is not None)
        part_is_single_cell = False
        # left-handed walk
        geometry.append([first_cell.x, first_cell.y])
        geometry.append([first_cell.x+1, first_cell.y])
        prev_cell = Vector(first_cell.x, first_cell.y)
        if first_cell.x+1 < field.width and field.cells[first_cell.y][first_cell.x+1].value == part.uid:
            cur_cell = Vector(first_cell.x+1, first_cell.y)
        else:
            geometry.append([first_cell.x+1, first_cell.y+1])
            if first_cell.y+1 < field.height and field.cells[first_cell.y+1][first_cell.x].value == part.uid:
                cur_cell = Vector(first_cell.x, first_cell.y+1)
            else:
                geometry.append([first_cell.x, first_cell.y+1])
                part_is_single_cell = True

        if not part_is_single_cell:
            while not (geometry[0][0] == geometry[-1][0] and geometry[0][1] == geometry[-1][1]):
                #   Left
                direction = left(field.cells[prev_cell.y][prev_cell.x], field.cells[cur_cell.y][cur_cell.x])
                next_cell = Vector(cur_cell.x+direction.x, cur_cell.y+direction.y)
                if field.cell_value(next_cell.x, next_cell.y) != part.uid:
                    #   Forward
                    direction = forward(field.cells[prev_cell.y][prev_cell.x], field.cells[cur_cell.y][cur_cell.x])
                    geometry.append(get_point(field.cells[cur_cell.y][cur_cell.x], direction))
                    if geometry[0][0] == geometry[-1][0] and geometry[0][1] == geometry[-1][1]:
                        break
                    next_cell = Vector(cur_cell.x+direction.x, cur_cell.y+direction.y)
                    if field.cell_value(next_cell.x, next_cell.y) != part.uid:
                        #   Right
                        direction = right(field.cells[prev_cell.y][prev_cell.x], field.cells[cur_cell.y][cur_cell.x])
                        geometry.append(get_point(field.cells[cur_cell.y][cur_cell.x], direction))
                        if geometry[0][0] == geometry[-1][0] and geometry[0][1] == geometry[-1][1]:
                            break
                        next_cell = Vector(cur_cell.x+direction.x, cur_cell.y+direction.y)
                        if field.cell_value(next_cell.x, next_cell.y) != part.uid:
                            # Back
                            direction = forward(field.cells[cur_cell.y][cur_cell.x], field.cells[prev_cell.y][prev_cell.x])
                            next_cell = Vector(cur_cell.x + direction.x, cur_cell.y + direction.y)
                            geometry.append(get_point(field.cells[cur_cell.y][cur_cell.x], direction))
                prev_cell = cur_cell
                cur_cell = next_cell

        min_x, min_y = field.width, field.height
        for [x, y] in geometry:
            if x < min_x:
                min_x = x
            if y < min_y:
                min_y = y
        for coord in geometry:
            coord[0] -= min_x
            coord[1] -= min_y

        geometry[:] = optimize_geometry(geometry)
        parts.append(json_part)
    return result




def gen_cell_field(width, height, part_count):
    assert(width*height > part_count)
    field = Field(width, height)

    for i in range(1, part_count+1):
        x = random.randint(0, width-1)
        y = random.randint(0, height-1)
        while field.cells[y][x].value != 0:
            x = random.randint(0, width-1)
            y = random.randint(0, height-1)
        field.add_part(Part(i, field, [(x, y,)]))

    while field.free_cells > 0:
        parts = field.parts[:]
        random_part = random.choice(parts)
        random_part.grow()
        if not random_part.connected:
            parts.remove(random_part)
    field.print()
    return field


def parse_cmd_args():
    parser = ArgumentParser(prog='TestGenerator.py')
    parser.add_argument('-w', '--width', help='Page width', type=int, default=10)
    parser.add_argument('--height',  help='Page height', type=int, default=10)
    parser.add_argument('-p', '--parts', help='Parts count', type=int, default=9)
    parser.add_argument('-s', '--seed', type=int, default=None,
                        help='Seed of the generation, required for reproducibility. If doesn\'t set equal current time '
                             'in milliseconds')
    parser.add_argument('-o', '--output', type=str, default=None, help='Output file')
    args = parser.parse_args()
    if args.seed is None:
        args.seed = int(time.time() * 1000)
    random.seed(args.seed)
    if args.output is None:
        args.output = f'w{args.width}h{args.height}p{args.parts}s{args.seed}.json'
    return args


def main():
    args = parse_cmd_args()
    field = gen_cell_field(args.width, args.height, args.parts)
    data = field_to_json(field)
    with open(args.output, 'w')as outfile:
        json.dump(data, outfile)


if __name__ == '__main__':
    main()
