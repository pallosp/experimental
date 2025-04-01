#!/usr/bin/env python

"""Computes the director circle of a conic.

https://en.wikipedia.org/wiki/Director_circle
"""

from sympy import factor
from sympy import init_printing
from sympy import Matrix
from sympy import pprint
from sympy import symbols

from lib.circle import Circle

init_printing(use_unicode=True)


a, b, c, d, e, f = symbols("a,b,c,d,e,f")
conic = Matrix([[a, b, d], [b, c, e], [d, e, f]])
disc = a * c - b * b
# √(semi-major axis**2 + semi-minor axis**2)
r_square = -conic.det() * (a + c) / disc**2
center_x = (b * e - c * d) / disc
center_y = (b * d - a * e) / disc
director_circle = Circle(center_x, center_y, r_square)

for i in range(9):
    director_circle[i] = factor(director_circle[i] * disc)

pprint(director_circle)
