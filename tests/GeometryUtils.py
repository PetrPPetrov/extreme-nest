import math
from typing import List

DEFAULT_TOLERANCE = 0.001


class Point(object):
    def __init__(self, x=0.0, y=0.0):
        self.x = x
        self.y = y


def is_same_points(p1: Point, p2: Point, tolerance=DEFAULT_TOLERANCE) -> bool:
    return ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) < tolerance ** 2


def midpoint(p1: Point, p2: Point) -> Point:
    return Point(p1.x+p2.x/2, p1.y+p2.y/2)


class Vector(object):
    def __init__(self, p1: Point, p2: Point):
        self.x = p2.x - p1.x
        self.y = p2.y - p1.y

    def normalize(self, new_length=1):
        ratio = new_length / self.length()
        self.x *= ratio
        self.y *= ratio

    def length(self):
        return math.sqrt(self.x**2 + self.y**2)

    def to_point(self, origin=Point(0.0, 0.0)):
        return Point(origin.x + self.x, origin.y + self.y)


class Segment(object):
    def __init__(self, p0: Point, p1: Point, offset=0.0):
        self.P0 = p0
        self.P1 = p1
        self.offset = offset

    def bbox(self):
        return BBox([self.P0, self.P1])


def is_segments_intersect(s1: Segment, s2: Segment, tolerance=DEFAULT_TOLERANCE) -> bool:
    dx1 = s1.P1.x - s1.P0.x
    dy1 = s1.P1.y - s1.P0.y

    dx2 = s2.P1.x - s2.P0.x
    dy2 = s2.P1.y - s2.P0.y

    delta = dx2*dy1 - dy2*dx1
    if abs(delta) < tolerance:
        return False

    s = (dx1 * (s2.P0.y - s1.P0.y) + dy1 * (s1.P0.x - s2.P0.x)) / delta
    t = (dx2 * (s1.P0.y - s2.P0.y) + dy2 * (s2.P0.x - s1.P0.x)) / (-delta)
    return (0 <= s <= 1) and (0 <= t <= 1)


def point_segment_distance(p: Point, s: Segment, tolerance=DEFAULT_TOLERANCE):
    dx = s.P1.x - s.P0.x
    dy = s.P1.y - s.P0.y
    if dx <= tolerance and dy <= tolerance:  # the segment's just a point
        return math.hypot(p.x - s.P0.x, p.y - s.P0.y)

    # Calculate the t that minimizes the distance.
    t = ((p.x - s.P0.x) * dx + (p.y - s.P0.y) * dy) / (dx * dx + dy * dy)

    if t < 0:
        dx = p.x - s.P0.x
        dy = p.y - s.P0.y
    elif t > 1:
        dx = p.x - s.P1.x
        dy = p.y - s.P1.y
    else:
        near_x = s.P0.x + t * dx
        near_y = s.P0.y + t * dy
        dx = p.x - near_x
        dy = p.y - near_y
    return math.hypot(dx, dy)


def is_segments_overlap(s1: Segment, s2: Segment, tolerance=DEFAULT_TOLERANCE) -> bool:
    # TODO check performance
    if not is_bboxes_intersect(offsetted_bbox(s1.bbox(), s1.offset), offsetted_bbox(s2.bbox(), s2.offset)):
        return False
    if is_segments_intersect(s1, s2):
        return True
    offset = max(max(s1.offset, s2.offset) - tolerance, 0.0)
    return point_segment_distance(s1.P0, s2) < offset \
        or point_segment_distance(s1.P1, s2) < offset \
        or point_segment_distance(s2.P0, s1) < offset \
        or point_segment_distance(s2.P1, s1) < offset


class BBox(object):
    def __init__(self, points: List[Point] = None):
        self.min = None
        self.max = None
        if points:
            self.add_points(points)

    def add_points(self, points: List[Point]):
        if self.min is None:
            self.min = points[0]
            self.max = points[0]
        for point in points:
            if point.x < self.min.x:
                self.min.x = point.x
            elif point.x > self.max.x:
                self.max.x = point.x

            if point.y < self.min.y:
                self.min.y = point.y
            elif point.y > self.max.y:
                self.max.y = point.y


def offsetted_bbox(bbox: BBox, offset) -> BBox:
    return BBox([Point(bbox.min.x - offset, bbox.min.y - offset), Point(bbox.max.x + offset, bbox.max.y + offset)])


def is_bboxes_intersect(bb1: BBox, bb2: BBox, tolerance=DEFAULT_TOLERANCE) -> bool:
    if bb1.min.x - bb2.max.x > tolerance \
    or bb1.min.y - bb2.max.y > tolerance \
    or bb2.min.y - bb1.max.y > tolerance \
    or bb2.min.y - bb1.max.y > tolerance:
        return False
    return True


# Quadratic Bézier Curves
class Curve(object):
    def __init__(self, p0: Point, p1: Point, p2: Point, offset=0.0):
        self.P0 = p0
        self.P1 = p1
        self.P2 = p2
        self.offset = offset

    def bbox(self) -> BBox:
        return BBox([self.P0, self.P1, self.P2])

    def midpoint(self) -> Point:
        return midpoint(midpoint(self.P0, self.P1), midpoint(self.P1, self.P2))


def is_curves_intersect(curve1: Curve, curve2: Curve, tolerance=DEFAULT_TOLERANCE) -> bool:
    bb1 = curve1.bbox()
    bb2 = curve2.bbox()
    if not is_bboxes_intersect(offsetted_bbox(bb1, curve1.offset), offsetted_bbox(bb2, curve2.offset)):
        return False
    # Curve1 mid points
    curve1_midpoint01 = midpoint(curve1.P0, curve1.P1)
    curve1_midpoint12 = midpoint(curve1.P1, curve1.P2)
    midpoint1 = midpoint(curve1_midpoint01, curve1_midpoint12)
    # Curve2 mid points
    curve2_midpoint01 = midpoint(curve2.P0, curve2.P1)
    curve2_midpoint12 = midpoint(curve2.P1, curve2.P2)
    midpoint2 = midpoint(curve2_midpoint01, curve2_midpoint12)

    offset = max(curve1.offset, curve2.offset) - tolerance
    if is_same_points(midpoint1, midpoint2, offset):
        return True
    # check sub curves intersect
    curve1_subcurve1 = Curve(curve1.P0, curve1_midpoint01, midpoint1, curve1.offset)
    curve1_subcurve2 = Curve(midpoint1, curve1_midpoint12, curve1.P2, curve1.offset)
    curve2_subcurve1 = Curve(curve2.P0, curve2_midpoint01, midpoint2, curve2.offset)
    curve2_subcurve2 = Curve(midpoint2, curve2_midpoint12, curve2.P2, curve2.offset)
    return is_curves_intersect(curve1_subcurve1, curve2_subcurve1, tolerance) \
        or is_curves_intersect(curve1_subcurve1, curve2_subcurve2, tolerance) \
        or is_curves_intersect(curve1_subcurve2, curve2_subcurve1, tolerance) \
        or is_curves_intersect(curve1_subcurve2, curve2_subcurve2, tolerance)


def is_curve_segment_intersect(c: Curve, s: Segment, tolerance=DEFAULT_TOLERANCE) -> bool:
    curve_bb = c.bbox()
    segment_bb = s.bbox()
    if not is_bboxes_intersect(offsetted_bbox(curve_bb, c.offset), offsetted_bbox(segment_bb, s.offset)):
        return False
    curve_mid01 = midpoint(c.P0, c.P1)
    curve_mid12 = midpoint(c.P1, c.P2)
    curve_midpoint = midpoint(curve_mid01, curve_mid12)
    segment_midpoint = midpoint(s.P0, s.P1)

    offset = max(c.offset, s.offset) - tolerance
    if is_same_points(curve_midpoint, segment_midpoint, offset):
        return True
    sub_curve1 = Curve(c.P0, curve_mid01, curve_midpoint, c.offset)
    sub_curve2 = Curve(curve_midpoint, curve_mid12, c.P2, c.offset)
    sub_segment1 = Segment(s.P0, segment_midpoint, s.offset)
    sub_segment2 = Segment(s.P1, segment_midpoint, s.offset)
    return is_curve_segment_intersect(sub_curve1, sub_segment1, tolerance) \
        or is_curve_segment_intersect(sub_curve1, sub_segment2, tolerance) \
        or is_curve_segment_intersect(sub_curve2, sub_segment1, tolerance) \
        or is_curve_segment_intersect(sub_curve2, sub_segment2, tolerance)
