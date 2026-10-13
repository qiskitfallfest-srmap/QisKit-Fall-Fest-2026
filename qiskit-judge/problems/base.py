"""
Base test suite abstraction for Quantum Challenge Problems.
Handles public vs hidden test segregation, execution, timing, and error sanitization.
"""

from typing import List, Dict, Any, Optional
import time

class TestResult:
    def __init__(
        self,
        test_type: str,
        test_number: int,
        test_name: str,
        passed: bool = False,
        execution_time_ms: int = 0,
        error_message: Optional[str] = None,
    ):
        self.test_type = test_type  # 'public' or 'hidden'
        self.test_number = test_number
        self.test_name = test_name
        self.passed = passed
        self.execution_time_ms = execution_time_ms
        self.error_message = error_message

    def to_dict(self, sanitize_hidden: bool = True) -> Dict[str, Any]:
        """
        Sanitizes error messages for hidden tests so secrets/test inputs never leak.
        """
        err = self.error_message
        if self.test_type == 'hidden' and sanitize_hidden and not self.passed:
            err = "Hidden test failed. Check edge cases, conventions, and constraints."

        return {
            "test_type": self.test_type,
            "test_number": self.test_number,
            "test_name": self.test_name if self.test_type == 'public' else f"Hidden Test #{self.test_number}",
            "passed": self.passed,
            "execution_time_ms": self.execution_time_ms,
            "error_message": err,
        }

class BaseProblemJudge:
    problem_id: str = ""
    max_score: int = 0

    def run_public_tests(self, user_module) -> List[TestResult]:
        raise NotImplementedError

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        raise NotImplementedError

    def calculate_score(self, public_results: List[TestResult], hidden_results: List[TestResult]) -> int:
        """
        Default linear scoring across public and hidden tests.
        """
        all_results = public_results + hidden_results
        if not all_results:
            return 0
        passed = sum(1 for t in all_results if t.passed)
        fraction = passed / len(all_results)
        return int(round(fraction * self.max_score))
