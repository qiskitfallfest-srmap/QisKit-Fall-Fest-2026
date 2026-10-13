from problems.p1 import P1Judge
from problems.p2 import P2Judge
from problems.p3 import P3Judge
from problems.p4 import P4Judge
from problems.p5 import P5Judge
from problems.p6 import P6Judge
from problems.p7 import P7Judge
from problems.p8 import P8Judge
from problems.p9 import P9Judge

JUDGES = {
    "P1": P1Judge,
    "P2": P2Judge,
    "P3": P3Judge,
    "P4": P4Judge,
    "P5": P5Judge,
    "P6": P6Judge,
    "P7": P7Judge,
    "P8": P8Judge,
    "P9": P9Judge,
}

def get_judge(problem_id: str):
    cls = JUDGES.get(problem_id.upper())
    if not cls:
        raise ValueError(f"Unknown problem ID: '{problem_id}'. Available: {list(JUDGES.keys())}")
    return cls()
