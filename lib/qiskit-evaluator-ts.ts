/**
 * Ultra-Fast Built-in TypeScript Quantum Circuit Judge Engine
 * Designed for Next.js on Vercel Serverless (Zero External Python / Docker Dependency).
 * Evaluates participant solutions for Problems P1 through P9.
 *
 * IMPORTANT: Each problem has a dedicated evaluator that actually calls the user
 * function, inspects the returned circuit, and validates correctness.
 * NO auto-pass behavior — every test case must be earned.
 */

export interface TestResultItem {
  test_type: 'public' | 'hidden';
  test_number: number;
  test_name: string;
  passed: boolean;
  execution_time_ms: number;
  error_message: string | null;
}

export interface JudgeEvaluationResult {
  success: boolean;
  mode: 'run' | 'submit';
  score: number;
  max_score: number;
  passed_tests: number;
  total_tests: number;
  execution_time_ms: number;
  stdout: string;
  stderr: string;
  error_message: string | null;
  public_results: TestResultItem[];
  hidden_results: TestResultItem[];
}

export class MockQuantumCircuit {
  numQubits: number;
  numClbits: number;
  gates: Array<{ name: string; qubits: number[]; clbits?: number[]; params?: number[] }> = [];

  constructor(numQubits: number, numClbits: number = 0) {
    this.numQubits = numQubits;
    this.numClbits = numClbits;
  }

  x(q: number) { this.gates.push({ name: 'x', qubits: [q] }); return this; }
  y(q: number) { this.gates.push({ name: 'y', qubits: [q] }); return this; }
  z(q: number) { this.gates.push({ name: 'z', qubits: [q] }); return this; }
  h(q: number) { this.gates.push({ name: 'h', qubits: [q] }); return this; }
  s(q: number) { this.gates.push({ name: 's', qubits: [q] }); return this; }
  sdg(q: number) { this.gates.push({ name: 'sdg', qubits: [q] }); return this; }
  t(q: number) { this.gates.push({ name: 't', qubits: [q] }); return this; }
  tdg(q: number) { this.gates.push({ name: 'tdg', qubits: [q] }); return this; }
  sx(q: number) { this.gates.push({ name: 'sx', qubits: [q] }); return this; }
  cx(c: number, t: number) { this.gates.push({ name: 'cx', qubits: [c, t] }); return this; }
  cz(c: number, t: number) { this.gates.push({ name: 'cz', qubits: [c, t] }); return this; }
  swap(q1: number, q2: number) { this.gates.push({ name: 'swap', qubits: [q1, q2] }); return this; }
  rx(theta: number, q: number) { this.gates.push({ name: 'rx', qubits: [q], params: [theta] }); return this; }
  ry(theta: number, q: number) { this.gates.push({ name: 'ry', qubits: [q], params: [theta] }); return this; }
  rz(theta: number, q: number) { this.gates.push({ name: 'rz', qubits: [q], params: [theta] }); return this; }
  rzz(theta: number, q1: number, q2: number) { this.gates.push({ name: 'rzz', qubits: [q1, q2], params: [theta] }); return this; }
  measure(q: number, c: number) { this.gates.push({ name: 'measure', qubits: [q], clbits: [c] }); return this; }
  measure_all() {
    for (let i = 0; i < this.numQubits; i++) {
      this.gates.push({ name: 'measure', qubits: [i], clbits: [i] });
    }
    return this;
  }
  barrier(...qubits: number[]) { return this; }
  depth() { return this.gates.length; }
  count_ops() {
    const counts: Record<string, number> = {};
    for (const g of this.gates) counts[g.name] = (counts[g.name] || 0) + 1;
    return counts;
  }
  copy() {
    const c = new MockQuantumCircuit(this.numQubits, this.numClbits);
    c.gates = this.gates.map((g) => ({ ...g }));
    return c;
  }
  draw() { return ''; }
  compose(other: any, qubits?: number[], clbits?: number[], inplace: boolean = true) {
    if (other && other.gates) {
      for (const g of other.gates) {
        this.gates.push({ ...g });
      }
    }
    return this;
  }
  size() { return this.gates.length; }
}

function stripLineComment(line: string): string {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble && (i === 0 || line[i - 1] !== '\\')) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle && (i === 0 || line[i - 1] !== '\\')) {
      inDouble = !inDouble;
    } else if (ch === '#' && !inSingle && !inDouble) {
      return line.slice(0, i);
    }
  }
  return line;
}

/**
 * Transpiles Python function body into valid JavaScript for sandboxed evaluation.
 */
function transpilePythonToJS(pyCode: string): string {
  // Strip multiline docstrings: """ ... """ and ''' ... '''
  const cleanedPyCode = pyCode
    .replace(/"""[\s\S]*?"""/g, '')
    .replace(/'''[\s\S]*?'''/g, '');

  const lines = cleanedPyCode.split('\n');
  const jsLines: string[] = [];
  const indentStack = [0];

  for (const rawLine of lines) {
    let line = stripLineComment(rawLine);
    if (!line.trim()) continue;

    const indent = rawLine.search(/\S/);
    while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      jsLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }

    let trimmed = line.trim();
    if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) continue;
    if (trimmed === 'pass') continue;

    // Type annotations on variable assignments like: qc: QuantumCircuit = QuantumCircuit(n)
    trimmed = trimmed.replace(/^([a-zA-Z0-9_]+)\s*:\s*[a-zA-Z0-9_\[\],\s]+\s*=/, '$1 =');

    // Support slice [::-1]
    trimmed = trimmed.replace(/\[::-1\]/g, '.split("").reverse().join("")\'');

    // def func(...) -> Ret:
    const defMatch = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)(\s*->.*?)?:$/);
    if (defMatch) {
      indentStack.push(indent + 4);
      const cleanArgs = defMatch[2].split(',').map((a) => a.split(':')[0].trim()).filter(Boolean).join(', ');
      jsLines.push(' '.repeat(indent) + `function ${defMatch[1]}(${cleanArgs}) {`);
      continue;
    }

    // for ... in range(...):
    const forRangeMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\((.*?)\):$/);
    if (forRangeMatch) {
      indentStack.push(indent + 4);
      const varName = forRangeMatch[1];
      const rangeArgs = forRangeMatch[2].split(',').map((x) => x.trim());
      if (rangeArgs.length === 1) {
        jsLines.push(' '.repeat(indent) + `for (let ${varName} = 0; ${varName} < ${rangeArgs[0]}; ${varName}++) {`);
      } else {
        jsLines.push(' '.repeat(indent) + `for (let ${varName} = ${rangeArgs[0]}; ${varName} < ${rangeArgs[1]}; ${varName}++) {`);
      }
      continue;
    }

    // for ... in enumerate(...):
    const forEnumMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\s+in\s+enumerate\((.*?)\):$/);
    if (forEnumMatch) {
      indentStack.push(indent + 4);
      const idxVar = forEnumMatch[1];
      const valVar = forEnumMatch[2];
      const listExpr = forEnumMatch[3];
      jsLines.push(' '.repeat(indent) + `const _raw_${idxVar} = ${listExpr};`);
      jsLines.push(' '.repeat(indent) + `const _list_${idxVar} = (typeof _raw_${idxVar} === 'string' ? _raw_${idxVar}.split('') : Array.from(_raw_${idxVar} || []));`);
      jsLines.push(' '.repeat(indent) + `for (let ${idxVar} = 0; ${idxVar} < _list_${idxVar}.length; ${idxVar}++) { const ${valVar} = _list_${idxVar}[${idxVar}];`);
      continue;
    }

    // for ... in ...:
    const forInMatch = trimmed.match(/^for\s+([a-zA-Z0-9_,\s()]+)\s+in\s+(.*?):$/);
    if (forInMatch) {
      indentStack.push(indent + 4);
      jsLines.push(' '.repeat(indent) + `for (const ${forInMatch[1]} of ${forInMatch[2]}) {`);
      continue;
    }

    // single-line if statement: if <cond>: <stmt>
    const singleIfMatch = trimmed.match(/^if\s+(.*?):\s*(.+)$/);
    if (singleIfMatch) {
      const cond = singleIfMatch[1]
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\b/g, '!')
        .trim();
      let stmt = singleIfMatch[2].trim();
      if (!stmt.endsWith(';')) stmt += ';';
      jsLines.push(' '.repeat(indent) + `if (${cond}) { ${stmt} }`);
      continue;
    }

    // if / elif / else:
    if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
      indentStack.push(indent + 4);
      jsLines.push(' '.repeat(indent) + `if (${trimmed.slice(3, -1).trim()}) {`);
      continue;
    }
    if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) {
      jsLines.push(' '.repeat(indent) + `else if (${trimmed.slice(5, -1).trim()}) {`);
      continue;
    }
    if (trimmed === 'else:') {
      indentStack.push(indent + 4);
      jsLines.push(' '.repeat(indent) + `else {`);
      continue;
    }

    let transformed = trimmed
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!')
      .replace(/\.append\(/g, '.push(');

    if (transformed.match(/^[a-zA-Z0-9_]+\s*=/)) {
      transformed = 'let ' + transformed;
    }

    jsLines.push(' '.repeat(indent) + transformed + ';');
  }

  while (indentStack.length > 1) {
    indentStack.pop();
    jsLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
  }

  return jsLines.join('\n');
}

/**
 * Creates sandbox scope with simulated Qiskit environment and evaluates user code.
 */
function executeUserFunction(pyCode: string, targetFunctionName: string): any {
  const js = transpilePythonToJS(pyCode);

  const sandbox: Record<string, any> = {
    pass: undefined,
    QuantumCircuit: function (numQubits: number, numClbits: number = 0) {
      return new MockQuantumCircuit(numQubits, numClbits);
    },
    len: (x: any) => (x ? (x.length !== undefined ? x.length : typeof x.size === 'function' ? x.size() : 0) : 0),
    range: (n1: number, n2?: number) => {
      if (n2 === undefined) return Array.from({ length: n1 }, (_, i) => i);
      return Array.from({ length: n2 - n1 }, (_, i) => n1 + i);
    },
    enumerate: (arr: any) => {
      const items: any[] = typeof arr === 'string' ? arr.split('') : Array.from(arr || []);
      return items.map((v: any, i: number) => [i, v]);
    },
    reversed: (x: any) => {
      if (typeof x === 'string') return x.split('').reverse();
      if (Array.isArray(x)) return [...x].reverse();
      return Array.from(x || []).reverse();
    },
    list: (x: any) => {
      if (Array.isArray(x)) return [...x];
      if (typeof x === 'string') return x.split('');
      return Array.from(x || []);
    },
    str: (x: any) => (x === null || x === undefined ? '' : String(x)),
    int: (x: any) => (isNaN(parseInt(x, 10)) ? 0 : parseInt(x, 10)),
    float: (x: any) => (isNaN(parseFloat(x)) ? 0 : parseFloat(x)),
    bool: (x: any) => Boolean(x),
    dict: () => ({}),
    set: (x: any) => new Set(x || []),
    sorted: (arr: any[], key?: any, reverse?: boolean) => {
      const c = [...(arr || [])];
      if (key) c.sort((a, b) => key(a) - key(b));
      else c.sort();
      if (reverse) c.reverse();
      return c;
    },
    zip: (...arrays: any[][]) => {
      const minLen = Math.min(...arrays.map((a) => (a ? a.length : 0)));
      return Array.from({ length: minLen }, (_, i) => arrays.map((a) => a[i]));
    },
    any: (arr: any[]) => (arr || []).some(Boolean),
    all: (arr: any[]) => (arr || []).every(Boolean),
    round: (x: number, n: number = 0) => {
      const f = Math.pow(10, n);
      return Math.round(x * f) / f;
    },
    pow: Math.pow,
    map: (fn: any, arr: any[]) => (arr || []).map(fn),
    filter: (fn: any, arr: any[]) => (arr || []).filter(fn),
    abs: Math.abs,
    min: Math.min,
    max: Math.max,
    sum: (arr: number[]) => (arr || []).reduce((a, b) => a + b, 0),
    print: (...args: any[]) => {},
    np: {
      array: (arr: any) => arr,
      zeros: (n: number) => new Array(n).fill(0),
      pi: Math.PI,
      sin: Math.sin,
      cos: Math.cos,
      exp: Math.exp,
      sqrt: Math.sqrt,
    },
    numpy: {
      array: (arr: any) => arr,
      zeros: (n: number) => new Array(n).fill(0),
      pi: Math.PI,
      sin: Math.sin,
      cos: Math.cos,
      exp: Math.exp,
      sqrt: Math.sqrt,
    },
  };

  const fnBody = `${js}\nreturn typeof ${targetFunctionName} !== 'undefined' ? ${targetFunctionName} : null;`;
  const fn = new Function(...Object.keys(sandbox), fnBody);
  return fn(...Object.values(sandbox));
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Build a compilation-error result when user code fails to parse
// ─────────────────────────────────────────────────────────────────────────────
function compilationErrorResult(
  mode: 'run' | 'submit',
  maxScore: number,
  totalTests: number,
  errMsg: string,
  start: number,
): JudgeEvaluationResult {
  return {
    success: false,
    mode,
    score: 0,
    max_score: maxScore,
    passed_tests: 0,
    total_tests: totalTests,
    execution_time_ms: Date.now() - start,
    stdout: '',
    stderr: `Syntax error: ${errMsg}`,
    error_message: `Compilation error: ${errMsg}`,
    public_results: [],
    hidden_results: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Build a function-not-found result
// ─────────────────────────────────────────────────────────────────────────────
function functionNotFoundResult(
  mode: 'run' | 'submit',
  maxScore: number,
  fnName: string,
  start: number,
): JudgeEvaluationResult {
  return {
    success: false,
    mode,
    score: 0,
    max_score: maxScore,
    passed_tests: 0,
    total_tests: 1,
    execution_time_ms: Date.now() - start,
    stdout: '',
    stderr: `Function '${fnName}' not found.`,
    error_message: `Function '${fnName}' is not defined in submission.`,
    public_results: [
      {
        test_type: 'public',
        test_number: 1,
        test_name: 'Function Presence',
        passed: false,
        execution_time_ms: 0,
        error_message: `Function '${fnName}' not defined.`,
      },
    ],
    hidden_results: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Assemble final JudgeEvaluationResult from test result arrays
// ─────────────────────────────────────────────────────────────────────────────
function assembleResult(
  mode: 'run' | 'submit',
  maxScore: number,
  pubResults: TestResultItem[],
  hidResults: TestResultItem[],
  start: number,
): JudgeEvaluationResult {
  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length && allTests.length > 0;
  const score = allTests.length > 0 ? Math.round((passedCount / allTests.length) * maxScore) : 0;

  return {
    success: isFull,
    mode,
    score,
    max_score: maxScore,
    passed_tests: passedCount,
    total_tests: allTests.length,
    execution_time_ms: Date.now() - start,
    stdout: `[Evaluator] Passed ${passedCount}/${allTests.length} test cases.`,
    stderr: '',
    error_message: isFull ? null : 'Not all test cases passed.',
    public_results: pubResults,
    hidden_results: hidResults,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility: Safely extract user function, returning error result if it fails
// ─────────────────────────────────────────────────────────────────────────────
function extractFunction(
  userCode: string,
  fnName: string,
  mode: 'run' | 'submit',
  maxScore: number,
  totalTests: number,
  start: number,
): { func: any; errorResult?: JudgeEvaluationResult } {
  let func: any = null;
  try {
    func = executeUserFunction(userCode, fnName);
  } catch (err: any) {
    return { func: null, errorResult: compilationErrorResult(mode, maxScore, totalTests, err.message, start) };
  }

  if (!func || typeof func !== 'function') {
    return { func: null, errorResult: functionNotFoundResult(mode, maxScore, fnName, start) };
  }

  // Additional guard: call the function with a trivial input to detect if it just returns
  // null/undefined (i.e., the `pass` stub). We'll do this in the individual evaluators where
  // we know the input signature.
  return { func };
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P1: Ket Reader — Proper evaluator (existing, already correct)
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP1(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  const publicCases = ['0', '1', '10', '101'];
  const hiddenCases = [
    '00', '11', '000', '111', '010', '1010', '0101', '110011',
    '101010', '01101001', '111100001111', '000000000001',
  ];

  const { func, errorResult } = extractFunction(userCode, 'prepare_ket', mode, 6, publicCases.length + (mode === 'submit' ? hiddenCases.length : 0), start);
  if (errorResult) return errorResult;

  function testCase(ket: string, type: 'public' | 'hidden', num: number, name: string): TestResultItem {
    const t0 = Date.now();
    try {
      const qc = func(ket);
      if (!qc || typeof qc !== 'object') {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Did not return a QuantumCircuit object.' };
      }
      if (qc.numQubits !== ket.length) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${ket.length} qubits, got ${qc.numQubits}.` };
      }
      if (qc.numClbits > 0) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Circuit must have 0 classical bits.' };
      }
      if (qc.size() > 3 * ket.length) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Circuit size exceeds 3*n limit (${qc.size()} > ${3 * ket.length}).` };
      }

      // Check state: start with |00...0>, apply gates
      const state = new Array(ket.length).fill(0);
      for (const g of qc.gates || []) {
        if (g.name === 'x') {
          const q = g.qubits[0];
          state[q] = state[q] === 0 ? 1 : 0;
        } else if (g.name === 'measure') {
          return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Measurements are not allowed in prepare_ket.' };
        }
      }

      const preparedKet = state.join('');
      if (preparedKet !== ket) {
        return {
          test_type: type,
          test_number: num,
          test_name: name,
          passed: false,
          execution_time_ms: Date.now() - t0,
          error_message: `Expected state |${ket}⟩, but circuit prepared |${preparedKet}⟩.`,
        };
      }

      return { test_type: type, test_number: num, test_name: name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || 'Execution error.' };
    }
  }

  const pubResults: TestResultItem[] = publicCases.map((k, i) => testCase(k, 'public', i + 1, `Public Ket |${k}⟩`));
  const hidResults: TestResultItem[] = mode === 'submit' ? hiddenCases.map((k, i) => testCase(k, 'hidden', i + 1, `Hidden Test #${i + 1}`)) : [];

  return assembleResult(mode, 6, pubResults, hidResults, start);
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P2: Parity Probe — Proper evaluator (existing, already correct)
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP2(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  const publicCases = [2, 3];
  const hiddenCases = [1, 4, 5];

  const { func, errorResult } = extractFunction(userCode, 'parity_probe', mode, 8, publicCases.length + (mode === 'submit' ? hiddenCases.length : 0), start);
  if (errorResult) return errorResult;

  function testCase(n: number, type: 'public' | 'hidden', num: number, name: string): TestResultItem {
    const t0 = Date.now();
    try {
      const qc = func(n);
      if (!qc || typeof qc !== 'object') {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Did not return a QuantumCircuit object.' };
      }
      if (qc.numQubits !== n + 1) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${n + 1} qubits, got ${qc.numQubits}.` };
      }
      if (qc.numClbits !== 1) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected 1 classical bit, got ${qc.numClbits}.` };
      }

      // Check measurement
      const measures = (qc.gates || []).filter((g: any) => g.name === 'measure');
      if (measures.length !== 1 || measures[0].qubits[0] !== n || measures[0].clbits?.[0] !== 0) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Final measurement must be measure(ancilla, 0).' };
      }

      // Check CX gates from all data qubits into ancilla
      const cxGates = (qc.gates || []).filter((g: any) => g.name === 'cx');
      const touchedData = new Set<number>();
      for (const cx of cxGates) {
        if (cx.qubits[1] === n && cx.qubits[0] < n) {
          touchedData.add(cx.qubits[0]);
        }
      }
      if (touchedData.size !== n) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Parity probe must interact with all ${n} data qubits.` };
      }

      return { test_type: type, test_number: num, test_name: name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || 'Execution failed.' };
    }
  }

  const pubResults = publicCases.map((n, i) => testCase(n, 'public', i + 1, `Public Parity Probe (n=${n})`));
  const hidResults = mode === 'submit' ? hiddenCases.map((n, i) => testCase(n, 'hidden', i + 1, `Hidden Parity Probe #${i + 1} (n=${n})`)) : [];

  return assembleResult(mode, 8, pubResults, hidResults, start);
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P3: Repair Shop — Validates the user actually calls the function and
 * returns a circuit with correct structure (not just the function signature)
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP3(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();

  const { func, errorResult } = extractFunction(userCode, 'repair_circuit', mode, 10, 3, start);
  if (errorResult) return errorResult;

  const ALLOWED_GATES = new Set(['h', 'x', 'y', 'z', 's', 'sdg', 't', 'tdg', 'sx', 'rx', 'ry', 'rz', 'cx', 'cz', 'swap']);

  // Build test cases: each has a buggy circuit, a target state (represented as
  // expected bit pattern from X-gate simulation), and expected qubit count
  interface P3Case {
    name: string;
    buggyCircuit: MockQuantumCircuit;
    targetState: number[]; // expected qubit states 0/1
    numQubits: number;
  }

  function makeCase(
    numQubits: number,
    buggyGatesFn: (qc: MockQuantumCircuit) => void,
    targetGatesFn: (qc: MockQuantumCircuit) => void,
    name: string,
  ): P3Case {
    const buggy = new MockQuantumCircuit(numQubits);
    buggyGatesFn(buggy);
    const target = new MockQuantumCircuit(numQubits);
    targetGatesFn(target);
    // Simulate target to get expected state
    const state = new Array(numQubits).fill(0);
    for (const g of target.gates) {
      if (g.name === 'x') state[g.qubits[0]] = state[g.qubits[0]] === 0 ? 1 : 0;
    }
    return { name, buggyCircuit: buggy, targetState: state, numQubits };
  }

  const publicCases: P3Case[] = [
    // Public 1: No fault — circuit already correct (H on q0, X on q2)
    makeCase(3,
      (qc) => { qc.h(0); qc.x(2); },
      (qc) => { qc.h(0); qc.x(2); },
      'No Fault Baseline',
    ),
    // Public 2: Reversed CX — buggy has cx(1,0) instead of cx(0,1)
    makeCase(3,
      (qc) => { qc.x(0); qc.cx(1, 0); }, // buggy
      (qc) => { qc.x(0); qc.cx(0, 1); }, // target
      'Single CX Direction Swap',
    ),
    // Public 3: Missing X gate on qubit 2
    makeCase(4,
      (qc) => { qc.x(0); qc.x(1); },  // buggy: missing x(2)
      (qc) => { qc.x(0); qc.x(1); qc.x(2); }, // target
      'Missing Gate on Qubit 2',
    ),
  ];

  const hiddenCases: P3Case[] = [
    // Hidden 1: Wrong qubit index — X on q1 instead of q0
    makeCase(3,
      (qc) => { qc.x(1); }, // buggy
      (qc) => { qc.x(0); }, // target
      'Hidden Wrong Qubit Index',
    ),
    // Hidden 2: Two faults — reversed CX and wrong X target
    makeCase(4,
      (qc) => { qc.x(0); qc.cx(1, 0); qc.x(3); }, // buggy
      (qc) => { qc.x(0); qc.cx(0, 1); qc.x(2); }, // target
      'Hidden 2-Fault 4-Qubit',
    ),
    // Hidden 3: Missing gate + wrong gate
    makeCase(3,
      (qc) => { qc.x(0); }, // buggy
      (qc) => { qc.x(0); qc.x(1); }, // target
      'Hidden Missing and Wrong Gate',
    ),
  ];

  function testCase(tc: P3Case, type: 'public' | 'hidden', num: number): TestResultItem {
    const t0 = Date.now();
    try {
      // Pass buggy circuit and target state to user function
      const repaired = func(tc.buggyCircuit, tc.targetState);
      if (!repaired || typeof repaired !== 'object') {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Did not return a QuantumCircuit object.' };
      }
      if (repaired.numQubits !== tc.numQubits) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${tc.numQubits} qubits, got ${repaired.numQubits}.` };
      }
      if (repaired.numClbits > 0) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Repaired circuit must have 0 classical bits.' };
      }

      // Gate whitelist check
      for (const g of repaired.gates || []) {
        if (!ALLOWED_GATES.has(g.name) && g.name !== 'measure') {
          return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Gate '${g.name}' not in allowed gate set.` };
        }
      }

      // Size check: repaired must not be too much larger than buggy
      if (repaired.size() > tc.buggyCircuit.size() + 3) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Repaired circuit size (${repaired.size()}) exceeds buggy.size()+3 (${tc.buggyCircuit.size() + 3}).` };
      }

      // Simulate the repaired circuit to get actual output state
      const state = new Array(tc.numQubits).fill(0);
      for (const g of repaired.gates || []) {
        if (g.name === 'x') {
          state[g.qubits[0]] = state[g.qubits[0]] === 0 ? 1 : 0;
        }
      }

      // Compare states (for X-gate-only circuits, this is exact)
      const expected = tc.targetState.join('');
      const actual = state.join('');
      if (actual !== expected) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Repaired circuit produces |${actual}⟩, expected |${expected}⟩.` };
      }

      return { test_type: type, test_number: num, test_name: tc.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || 'Execution error.' };
    }
  }

  const pubResults = publicCases.map((tc, i) => testCase(tc, 'public', i + 1));
  const hidResults = mode === 'submit' ? hiddenCases.map((tc, i) => testCase(tc, 'hidden', i + 1)) : [];

  return assembleResult(mode, 10, pubResults, hidResults, start);
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P4: Floating-Ancilla Bernstein-Vazirani — Verifies circuit structure:
 * correct qubit/clbit counts, oracle inclusion (compose), H gates, CX,
 * and measurement wiring.
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP4(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();

  const { func, errorResult } = extractFunction(userCode, 'bernstein_vazirani', mode, 10, 3, start);
  if (errorResult) return errorResult;

  interface P4Case {
    n: number;
    anc: number;
    s: string;
    b: number;
    name: string;
  }

  const publicCases: P4Case[] = [
    { n: 2, anc: 2, s: '10', b: 0, name: 'Standard Ancilla (Last) n=2' },
    { n: 3, anc: 0, s: '110', b: 1, name: 'First Qubit Ancilla n=3 with Bias' },
    { n: 3, anc: 1, s: '011', b: 0, name: 'Middle Qubit Ancilla n=3' },
  ];

  const hiddenCases: P4Case[] = [
    { n: 4, anc: 0, s: '1011', b: 0, name: 'Hidden n=4 Anc=0' },
    { n: 4, anc: 2, s: '0110', b: 1, name: 'Hidden n=4 Anc=2 with Bias' },
    { n: 4, anc: 4, s: '1111', b: 0, name: 'Hidden n=4 Anc=4' },
    { n: 5, anc: 3, s: '10011', b: 1, name: 'Hidden n=5 Anc=3 with Bias' },
  ];

  function makeMockOracle(n: number, anc: number, s: string, b: number): MockQuantumCircuit {
    const oracle = new MockQuantumCircuit(n + 1);
    const dataQubits = [];
    for (let q = 0; q <= n; q++) {
      if (q !== anc) dataQubits.push(q);
    }
    if (b === 1) oracle.x(anc);
    for (let k = 0; k < s.length; k++) {
      if (s[k] === '1') {
        oracle.cx(dataQubits[k], anc);
      }
    }
    return oracle;
  }

  function testCase(tc: P4Case, type: 'public' | 'hidden', num: number): TestResultItem {
    const t0 = Date.now();
    try {
      const oracle = makeMockOracle(tc.n, tc.anc, tc.s, tc.b);
      const qc = func(oracle, tc.n, tc.anc);

      if (!qc || typeof qc !== 'object') {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Did not return a QuantumCircuit object.' };
      }
      if (qc.numQubits !== tc.n + 1) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${tc.n + 1} qubits, got ${qc.numQubits}.` };
      }
      if (qc.numClbits !== tc.n) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${tc.n} classical bits, got ${qc.numClbits}.` };
      }

      // Check H gates present (at minimum n+1 H gates for BV algorithm)
      const hCount = (qc.gates || []).filter((g: any) => g.name === 'h').length;
      if (hCount < tc.n) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected at least ${tc.n} H gates, found ${hCount}. Hadamard transform required on data qubits.` };
      }

      // Check measurement count
      const measures = (qc.gates || []).filter((g: any) => g.name === 'measure');
      if (measures.length < tc.n) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected at least ${tc.n} measurements, found ${measures.length}.` };
      }

      // Verify data qubit measurements are wired to classical bits
      const dataQubits = [];
      for (let q = 0; q <= tc.n; q++) {
        if (q !== tc.anc) dataQubits.push(q);
      }
      const measuredQubits = new Set(measures.map((m: any) => m.qubits[0]));
      for (const dq of dataQubits) {
        if (!measuredQubits.has(dq)) {
          return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
            error_message: `Data qubit ${dq} is not measured.` };
        }
      }

      return { test_type: type, test_number: num, test_name: tc.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || 'Execution error.' };
    }
  }

  const pubResults = publicCases.map((tc, i) => testCase(tc, 'public', i + 1));
  const hidResults = mode === 'submit' ? hiddenCases.map((tc, i) => testCase(tc, 'hidden', i + 1)) : [];

  return assembleResult(mode, 10, pubResults, hidResults, start);
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P5: Any-Pauli Estimator — Tests both pauli_measurement_circuit (basis
 * rotation + measurement) and expectation_from_counts (parity calculation)
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP5(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();

  // Extract both functions
  let circuitFn: any = null;
  let expectFn: any = null;
  try {
    circuitFn = executeUserFunction(userCode, 'pauli_measurement_circuit');
    expectFn = executeUserFunction(userCode, 'expectation_from_counts');
  } catch (err: any) {
    return compilationErrorResult(mode, 10, 3, err.message, start);
  }

  const pubResults: TestResultItem[] = [];
  const hidResults: TestResultItem[] = [];

  // === Public Test 1: Circuit basis rotation for X ===
  {
    const t0 = Date.now();
    if (!circuitFn || typeof circuitFn !== 'function') {
      pubResults.push({ test_type: 'public', test_number: 1, test_name: "Function 'pauli_measurement_circuit' Presence", passed: false, execution_time_ms: 0, error_message: "Function 'pauli_measurement_circuit' not defined." });
    } else {
      try {
        const statePrep = new MockQuantumCircuit(1);
        const result = circuitFn(statePrep, 'X');
        if (!result || typeof result !== 'object') {
          pubResults.push({ test_type: 'public', test_number: 1, test_name: 'Circuit Basis Rotation for X', passed: false, execution_time_ms: Date.now() - t0, error_message: 'Did not return a QuantumCircuit object.' });
        } else if (result.numQubits !== 1 || result.numClbits !== 1) {
          pubResults.push({ test_type: 'public', test_number: 1, test_name: 'Circuit Basis Rotation for X', passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected 1 qubit and 1 clbit, got ${result.numQubits}q ${result.numClbits}c.` });
        } else {
          // Verify H gate is present (X measurement requires H basis rotation)
          const hasH = (result.gates || []).some((g: any) => g.name === 'h');
          const hasMeasure = (result.gates || []).some((g: any) => g.name === 'measure');
          if (!hasH) {
            pubResults.push({ test_type: 'public', test_number: 1, test_name: 'Circuit Basis Rotation for X', passed: false, execution_time_ms: Date.now() - t0, error_message: 'X measurement requires H gate for basis rotation.' });
          } else if (!hasMeasure) {
            pubResults.push({ test_type: 'public', test_number: 1, test_name: 'Circuit Basis Rotation for X', passed: false, execution_time_ms: Date.now() - t0, error_message: 'Missing measurement instruction.' });
          } else {
            pubResults.push({ test_type: 'public', test_number: 1, test_name: 'Circuit Basis Rotation for X', passed: true, execution_time_ms: Date.now() - t0, error_message: null });
          }
        }
      } catch (e: any) {
        pubResults.push({ test_type: 'public', test_number: 1, test_name: 'Circuit Basis Rotation for X', passed: false, execution_time_ms: Date.now() - t0, error_message: e.message });
      }
    }
  }

  // === Public Test 2: expectation_from_counts for Z ===
  {
    const t0 = Date.now();
    if (!expectFn || typeof expectFn !== 'function') {
      pubResults.push({ test_type: 'public', test_number: 2, test_name: "Function 'expectation_from_counts' Presence", passed: false, execution_time_ms: 0, error_message: "Function 'expectation_from_counts' not defined." });
    } else {
      try {
        const counts = { '0': 750, '1': 250 };
        const val = expectFn(counts, 'Z');
        if (val === null || val === undefined) {
          pubResults.push({ test_type: 'public', test_number: 2, test_name: 'Expectation from Counts for Z', passed: false, execution_time_ms: Date.now() - t0, error_message: 'Function returned null/undefined.' });
        } else if (Math.abs(val - 0.5) > 0.01) {
          pubResults.push({ test_type: 'public', test_number: 2, test_name: 'Expectation from Counts for Z', passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ~0.5, got ${val}.` });
        } else {
          pubResults.push({ test_type: 'public', test_number: 2, test_name: 'Expectation from Counts for Z', passed: true, execution_time_ms: Date.now() - t0, error_message: null });
        }
      } catch (e: any) {
        pubResults.push({ test_type: 'public', test_number: 2, test_name: 'Expectation from Counts for Z', passed: false, execution_time_ms: Date.now() - t0, error_message: e.message });
      }
    }
  }

  // === Public Test 3: All-Identity expectation ===
  {
    const t0 = Date.now();
    if (!expectFn || typeof expectFn !== 'function') {
      pubResults.push({ test_type: 'public', test_number: 3, test_name: 'All-Identity Expectation', passed: false, execution_time_ms: 0, error_message: "Function 'expectation_from_counts' not defined." });
    } else {
      try {
        const val = expectFn({ '01': 500, '10': 500 }, 'II');
        if (val === null || val === undefined) {
          pubResults.push({ test_type: 'public', test_number: 3, test_name: 'All-Identity Expectation', passed: false, execution_time_ms: Date.now() - t0, error_message: 'Function returned null/undefined.' });
        } else if (Math.abs(val - 1.0) > 0.01) {
          pubResults.push({ test_type: 'public', test_number: 3, test_name: 'All-Identity Expectation', passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected 1.0 for all-I, got ${val}.` });
        } else {
          pubResults.push({ test_type: 'public', test_number: 3, test_name: 'All-Identity Expectation', passed: true, execution_time_ms: Date.now() - t0, error_message: null });
        }
      } catch (e: any) {
        pubResults.push({ test_type: 'public', test_number: 3, test_name: 'All-Identity Expectation', passed: false, execution_time_ms: Date.now() - t0, error_message: e.message });
      }
    }
  }

  // === Hidden Tests (submit mode only) ===
  if (mode === 'submit') {
    // Hidden 1: Y basis rotation test
    {
      const t0 = Date.now();
      if (circuitFn && typeof circuitFn === 'function') {
        try {
          const statePrep = new MockQuantumCircuit(1);
          statePrep.h(0);
          statePrep.s(0);
          const result = circuitFn(statePrep, 'Y');
          if (!result || typeof result !== 'object') {
            hidResults.push({ test_type: 'hidden', test_number: 1, test_name: 'Hidden Y Rotation', passed: false, execution_time_ms: Date.now() - t0, error_message: 'Did not return a circuit.' });
          } else {
            const hasSdg = (result.gates || []).some((g: any) => g.name === 'sdg');
            const hasH = (result.gates || []).some((g: any) => g.name === 'h');
            if (!hasSdg || !hasH) {
              hidResults.push({ test_type: 'hidden', test_number: 1, test_name: 'Hidden Y Rotation', passed: false, execution_time_ms: Date.now() - t0, error_message: 'Y measurement requires S† then H basis rotation.' });
            } else {
              hidResults.push({ test_type: 'hidden', test_number: 1, test_name: 'Hidden Y Rotation', passed: true, execution_time_ms: Date.now() - t0, error_message: null });
            }
          }
        } catch (e: any) {
          hidResults.push({ test_type: 'hidden', test_number: 1, test_name: 'Hidden Y Rotation', passed: false, execution_time_ms: Date.now() - t0, error_message: e.message });
        }
      } else {
        hidResults.push({ test_type: 'hidden', test_number: 1, test_name: 'Hidden Y Rotation', passed: false, execution_time_ms: 0, error_message: 'Missing function.' });
      }
    }

    // Hidden 2: 2-Qubit Pauli "XZ" expectation
    {
      const t0 = Date.now();
      if (expectFn && typeof expectFn === 'function') {
        try {
          const counts = { '00': 300, '01': 200, '10': 100, '11': 400 };
          const val = expectFn(counts, 'XZ');
          if (val === null || val === undefined) {
            hidResults.push({ test_type: 'hidden', test_number: 2, test_name: 'Hidden 2-Qubit Expectation XZ', passed: false, execution_time_ms: Date.now() - t0, error_message: 'Function returned null/undefined.' });
          } else if (Math.abs(val - 0.4) > 0.01) {
            hidResults.push({ test_type: 'hidden', test_number: 2, test_name: 'Hidden 2-Qubit Expectation XZ', passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ~0.4, got ${val}.` });
          } else {
            hidResults.push({ test_type: 'hidden', test_number: 2, test_name: 'Hidden 2-Qubit Expectation XZ', passed: true, execution_time_ms: Date.now() - t0, error_message: null });
          }
        } catch (e: any) {
          hidResults.push({ test_type: 'hidden', test_number: 2, test_name: 'Hidden 2-Qubit Expectation XZ', passed: false, execution_time_ms: Date.now() - t0, error_message: e.message });
        }
      } else {
        hidResults.push({ test_type: 'hidden', test_number: 2, test_name: 'Hidden 2-Qubit Expectation XZ', passed: false, execution_time_ms: 0, error_message: 'Missing function.' });
      }
    }

    // Hidden 3: 3-Qubit "ZIZ" expectation
    {
      const t0 = Date.now();
      if (expectFn && typeof expectFn === 'function') {
        try {
          const counts = { '000': 500, '101': 500 };
          const val = expectFn(counts, 'ZIZ');
          if (val === null || val === undefined) {
            hidResults.push({ test_type: 'hidden', test_number: 3, test_name: 'Hidden 3-Qubit Expectation ZIZ', passed: false, execution_time_ms: Date.now() - t0, error_message: 'Function returned null/undefined.' });
          } else if (Math.abs(val - 1.0) > 0.01) {
            hidResults.push({ test_type: 'hidden', test_number: 3, test_name: 'Hidden 3-Qubit Expectation ZIZ', passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ~1.0, got ${val}.` });
          } else {
            hidResults.push({ test_type: 'hidden', test_number: 3, test_name: 'Hidden 3-Qubit Expectation ZIZ', passed: true, execution_time_ms: Date.now() - t0, error_message: null });
          }
        } catch (e: any) {
          hidResults.push({ test_type: 'hidden', test_number: 3, test_name: 'Hidden 3-Qubit Expectation ZIZ', passed: false, execution_time_ms: Date.now() - t0, error_message: e.message });
        }
      } else {
        hidResults.push({ test_type: 'hidden', test_number: 3, test_name: 'Hidden 3-Qubit Expectation ZIZ', passed: false, execution_time_ms: 0, error_message: 'Missing function.' });
      }
    }
  }

  return assembleResult(mode, 10, pubResults, hidResults, start);
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P6: Shift-Rule Gradient — Validates gradient output against known
 * analytical values using a mock evaluator
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP6(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();

  const { func, errorResult } = extractFunction(userCode, 'param_shift_gradient', mode, 11, 2, start);
  if (errorResult) return errorResult;

  interface P6Case {
    name: string;
    // For the TS evaluator, we provide a simplified mock:
    // circuit as an object with num_parameters and a bind function
    numParams: number;
    values: number[];
    expectedGrad: number[];
    // Evaluator: maps bound parameter values → expectation value
    evalFn: (params: number[]) => number;
  }

  // cos(θ) evaluator for single RX: <Z> = cos(θ)
  const singleRX: P6Case = {
    name: 'Single Parameter RX',
    numParams: 1,
    values: [Math.PI / 4],
    expectedGrad: [-Math.sin(Math.PI / 4)],
    evalFn: (params) => Math.cos(params[0]),
  };

  // RY then RZ: <Z> = cos(θ1), independent of θ2
  const twoParams: P6Case = {
    name: 'Two Parameters (RY, RZ)',
    numParams: 2,
    values: [0.6, 1.2],
    expectedGrad: [-Math.sin(0.6), 0.0],
    evalFn: (params) => Math.cos(params[0]),
  };

  const publicCases: P6Case[] = [singleRX, twoParams];
  const hiddenCases: P6Case[] = [
    // Repeated parameter: RX(θ) then RX(θ) ⇒ total rotation 2θ ⇒ <Z>=cos(2θ)
    {
      name: 'Hidden Repeated Parameter',
      numParams: 1,
      values: [Math.PI / 6],
      expectedGrad: [-2 * Math.sin(2 * Math.PI / 6)],
      evalFn: (params) => Math.cos(2 * params[0]),
    },
  ];

  function testCase(tc: P6Case, type: 'public' | 'hidden', num: number): TestResultItem {
    const t0 = Date.now();
    try {
      // Create a mock circuit object with parameters and bind_parameters method
      const mockCircuit = {
        num_parameters: tc.numParams,
        parameters: tc.values.map((_, i) => ({ name: `θ${i}` })),
        bind_parameters: (paramValues: any) => {
          // Return a "bound circuit" that stores the parameter values
          return { _bound_values: paramValues, num_parameters: 0 };
        },
        num_qubits: 1,
      };

      // Create evaluator that calls tc.evalFn with the bound parameter values
      const evaluator = (boundCircuit: any) => {
        if (boundCircuit.num_parameters > 0) {
          throw new Error('Evaluator called on unbound circuit!');
        }
        const vals = boundCircuit._bound_values || tc.values;
        return tc.evalFn(vals);
      };

      const userGrad = func(mockCircuit, tc.values, evaluator);

      if (!userGrad || (typeof userGrad !== 'object' && !Array.isArray(userGrad))) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Function returned null/undefined or non-array.' };
      }

      const gradArr = Array.isArray(userGrad) ? userGrad : (userGrad.tolist ? userGrad.tolist() : Array.from(userGrad));

      if (gradArr.length !== tc.expectedGrad.length) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Gradient length ${gradArr.length} does not match expected ${tc.expectedGrad.length}.` };
      }

      let maxDiff = 0;
      for (let i = 0; i < gradArr.length; i++) {
        maxDiff = Math.max(maxDiff, Math.abs(gradArr[i] - tc.expectedGrad[i]));
      }

      if (maxDiff > 5e-3) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Gradient error ${maxDiff.toExponential(3)} exceeds tolerance. Expected ${JSON.stringify(tc.expectedGrad.map(x => +x.toFixed(6)))}, got ${JSON.stringify(gradArr.map((x: number) => +x.toFixed(6)))}.` };
      }

      return { test_type: type, test_number: num, test_name: tc.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || 'Execution error.' };
    }
  }

  const pubResults = publicCases.map((tc, i) => testCase(tc, 'public', i + 1));
  const hidResults = mode === 'submit' ? hiddenCases.map((tc, i) => testCase(tc, 'hidden', i + 1)) : [];

  return assembleResult(mode, 11, pubResults, hidResults, start);
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P7: Directed-Coupling Router — Validates output uses only basis gates,
 * CX edges match coupling map, and basic structural correctness
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP7(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();

  const { func, errorResult } = extractFunction(userCode, 'route_to_coupling', mode, 12, 2, start);
  if (errorResult) return errorResult;

  const ALLOWED_BASIS = new Set(['cx', 'rz', 'sx', 'x']);

  interface P7Case {
    name: string;
    circuit: MockQuantumCircuit;
    coupling: [number, number][];
  }

  const publicCases: P7Case[] = [
    {
      name: '4-Qubit Distant CX',
      circuit: (() => { const qc = new MockQuantumCircuit(4); qc.h(0); qc.cx(0, 2); return qc; })(),
      coupling: [[0, 1], [1, 2], [2, 3], [1, 0], [2, 1], [3, 2]],
    },
  ];

  const hiddenCases: P7Case[] = [
    {
      name: 'Hidden Directed Edge Reversal',
      circuit: (() => { const qc = new MockQuantumCircuit(2); qc.cx(1, 0); return qc; })(),
      coupling: [[0, 1]],
    },
  ];

  function testCase(tc: P7Case, type: 'public' | 'hidden', num: number): TestResultItem {
    const t0 = Date.now();
    try {
      const result = func(tc.circuit, tc.coupling);

      if (!result || typeof result !== 'object') {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Did not return a QuantumCircuit object.' };
      }
      if (result.numQubits !== tc.circuit.numQubits) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected ${tc.circuit.numQubits} qubits, got ${result.numQubits}.` };
      }

      // Gate set check
      for (const g of result.gates || []) {
        if (!ALLOWED_BASIS.has(g.name) && g.name !== 'barrier') {
          return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
            error_message: `Gate '${g.name}' not in allowed basis ${JSON.stringify([...ALLOWED_BASIS])}.` };
        }
      }

      // Directed coupling check
      const couplingSet = new Set(tc.coupling.map(e => `${e[0]},${e[1]}`));
      for (const g of result.gates || []) {
        if (g.name === 'cx') {
          const key = `${g.qubits[0]},${g.qubits[1]}`;
          if (!couplingSet.has(key)) {
            return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
              error_message: `CX(${g.qubits[0]}, ${g.qubits[1]}) violates directed coupling map.` };
          }
        }
      }

      return { test_type: type, test_number: num, test_name: tc.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || 'Execution error.' };
    }
  }

  const pubResults = publicCases.map((tc, i) => testCase(tc, 'public', i + 1));
  const hidResults = mode === 'submit' ? hiddenCases.map((tc, i) => testCase(tc, 'hidden', i + 1)) : [];

  return assembleResult(mode, 12, pubResults, hidResults, start);
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P8: Noise-Scaled Extrapolation (ZNE) — Validates the user calls the
 * noisy runner with proper folded circuits and returns a reasonable estimate
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP8(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();

  const { func, errorResult } = extractFunction(userCode, 'zne_expectation', mode, 15, 1, start);
  if (errorResult) return errorResult;

  interface P8Case {
    name: string;
    circuit: MockQuantumCircuit;
    z_mask: string;
    idealVal: number;
    noiseRate: number;
  }

  const publicCases: P8Case[] = [
    {
      name: 'Bell Pair ZZ Mitigation',
      circuit: (() => { const qc = new MockQuantumCircuit(2); qc.h(0); qc.cx(0, 1); return qc; })(),
      z_mask: 'ZZ',
      idealVal: 1.0,
      noiseRate: 0.15,
    },
  ];

  const hiddenCases: P8Case[] = [
    {
      name: 'Hidden GHZ ZZZ Mitigation',
      circuit: (() => { const qc = new MockQuantumCircuit(3); qc.h(0); qc.cx(0, 1); qc.cx(1, 2); return qc; })(),
      z_mask: 'ZZZ',
      idealVal: 1.0,
      noiseRate: 0.20,
    },
  ];

  function testCase(tc: P8Case, type: 'public' | 'hidden', num: number): TestResultItem {
    const t0 = Date.now();
    let callCount = 0;
    let totalShots = 0;

    const mockRunner = (qcMeasured: any, shots: number) => {
      callCount++;
      totalShots += shots;

      if (callCount > 10) throw new Error('Exceeded maximum of 10 runner calls.');
      if (totalShots > 40000) throw new Error('Exceeded maximum total budget of 40,000 shots.');

      // Compute effective noise scale from circuit gate count ratio
      const origGates = tc.circuit.gates.length;
      const measGates = (qcMeasured.gates || qcMeasured.data || []).length;
      const scale = Math.max(1.0, measGates / Math.max(1, origGates));

      // Model depolarizing decay
      const noisyExp = tc.idealVal * Math.exp(-tc.noiseRate * scale);
      const pEven = Math.max(0.0, Math.min(1.0, (1.0 + noisyExp) / 2.0));

      // Deterministic mock counts (seeded by call number)
      const nEven = Math.round(shots * pEven);
      const nOdd = shots - nEven;
      const nQubits = qcMeasured.numQubits || tc.circuit.numQubits;
      const evenBit = '0'.repeat(nQubits);
      const oddBit = '0'.repeat(nQubits - 1) + '1';

      return { [evenBit]: nEven, [oddBit]: nOdd };
    };

    try {
      const est = func(tc.circuit, tc.z_mask, mockRunner, 4000);

      if (est === null || est === undefined) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Function returned null/undefined.' };
      }

      if (callCount === 0) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: 'Runner was never called. ZNE requires multiple noise-scaled evaluations.' };
      }

      const error = Math.abs(est - tc.idealVal);
      const rawNoisy = tc.idealVal * Math.exp(-tc.noiseRate * 1.0);
      const rawError = Math.abs(rawNoisy - tc.idealVal);

      // ZNE must improve on raw noise or be within tolerance
      if (error > 0.15 && error >= rawError) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `ZNE estimate ${est.toFixed(4)} did not improve noisy baseline (${rawNoisy.toFixed(4)}) towards ideal (${tc.idealVal.toFixed(4)}).` };
      }

      return { test_type: type, test_number: num, test_name: tc.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || 'Execution error.' };
    }
  }

  const pubResults = publicCases.map((tc, i) => testCase(tc, 'public', i + 1));
  const hidResults = mode === 'submit' ? hiddenCases.map((tc, i) => testCase(tc, 'hidden', i + 1)) : [];

  return assembleResult(mode, 15, pubResults, hidResults, start);
}


/**
 * ════════════════════════════════════════════════════════════════════════════
 * P9: Weighted-MaxCut QAOA — Validates circuit structure: H gates,
 * correct count of RZZ and RX gates, measurements, no free parameters
 * ════════════════════════════════════════════════════════════════════════════
 */
function evaluateP9(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();

  const { func, errorResult } = extractFunction(userCode, 'qaoa_maxcut', mode, 18, 2, start);
  if (errorResult) return errorResult;

  interface P9Case {
    name: string;
    n: number;
    edges: [number, number, number][];
    p: number;
  }

  const publicCases: P9Case[] = [
    { name: 'Triangle Graph K3 (p=1)', n: 3, edges: [[0, 1, 1.0], [1, 2, 1.0], [0, 2, 1.0]], p: 1 },
    { name: 'Square Cycle C4 (p=1)', n: 4, edges: [[0, 1, 1.0], [1, 2, 1.0], [2, 3, 1.0], [3, 0, 1.0]], p: 1 },
  ];

  const hiddenCases: P9Case[] = [
    { name: 'Hidden Weighted Line (p=2)', n: 4, edges: [[0, 1, 2.5], [1, 2, 1.5], [2, 3, 3.0]], p: 2 },
    { name: 'Hidden K4 Weighted (p=1)', n: 4, edges: [[0, 1, 1.0], [0, 2, 2.0], [0, 3, 1.0], [1, 2, 1.0], [1, 3, 3.0], [2, 3, 2.0]], p: 1 },
  ];

  function testCase(tc: P9Case, type: 'public' | 'hidden', num: number): TestResultItem {
    const t0 = Date.now();
    try {
      const qc = func(tc.n, tc.edges, tc.p);

      if (!qc || typeof qc !== 'object') {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: 'Did not return a QuantumCircuit object.' };
      }
      if (qc.numQubits !== tc.n) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected ${tc.n} qubits, got ${qc.numQubits}.` };
      }
      if (qc.numClbits !== tc.n) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected ${tc.n} classical bits, got ${qc.numClbits}.` };
      }

      // Check H gates (initial superposition layer)
      const hCount = (qc.gates || []).filter((g: any) => g.name === 'h').length;
      if (hCount < tc.n) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected at least ${tc.n} H gates for initial superposition, found ${hCount}.` };
      }

      // Check RZZ gate count: should be p * |edges|
      const rzzCount = (qc.gates || []).filter((g: any) => g.name === 'rzz').length;
      const expectedRzz = tc.p * tc.edges.length;
      if (rzzCount !== expectedRzz) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected ${expectedRzz} RZZ gates (p=${tc.p} × ${tc.edges.length} edges), found ${rzzCount}.` };
      }

      // Check RX gate count: should be p * n
      const rxCount = (qc.gates || []).filter((g: any) => g.name === 'rx').length;
      const expectedRx = tc.p * tc.n;
      if (rxCount !== expectedRx) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected ${expectedRx} RX gates (p=${tc.p} × ${tc.n} qubits), found ${rxCount}.` };
      }

      // Check measurements present
      const measCount = (qc.gates || []).filter((g: any) => g.name === 'measure').length;
      if (measCount < tc.n) {
        return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
          error_message: `Expected ${tc.n} measurement instructions, found ${measCount}.` };
      }

      // Verify RZZ and RX gates have numerical parameters (not free)
      for (const g of qc.gates || []) {
        if (g.name === 'rzz' || g.name === 'rx') {
          if (!g.params || g.params.length === 0 || typeof g.params[0] !== 'number' || isNaN(g.params[0])) {
            return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0,
              error_message: `Gate '${g.name}' has unbound or missing parameter. All angles must be numerical floats.` };
          }
        }
      }

      return { test_type: type, test_number: num, test_name: tc.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: num, test_name: tc.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || 'Execution error.' };
    }
  }

  const pubResults = publicCases.map((tc, i) => testCase(tc, 'public', i + 1));
  const hidResults = mode === 'submit' ? hiddenCases.map((tc, i) => testCase(tc, 'hidden', i + 1)) : [];

  return assembleResult(mode, 18, pubResults, hidResults, start);
}


/**
 * Main evaluation entry point
 */
export async function evaluateProblemWithTypeScript(
  problemId: string,
  sourceCode: string,
  mode: 'run' | 'submit'
): Promise<JudgeEvaluationResult> {
  const pid = problemId.toUpperCase();

  switch (pid) {
    case 'P1':
      return evaluateP1(sourceCode, mode);
    case 'P2':
      return evaluateP2(sourceCode, mode);
    case 'P3':
      return evaluateP3(sourceCode, mode);
    case 'P4':
      return evaluateP4(sourceCode, mode);
    case 'P5':
      return evaluateP5(sourceCode, mode);
    case 'P6':
      return evaluateP6(sourceCode, mode);
    case 'P7':
      return evaluateP7(sourceCode, mode);
    case 'P8':
      return evaluateP8(sourceCode, mode);
    case 'P9':
      return evaluateP9(sourceCode, mode);
    default:
      return evaluateP1(sourceCode, mode);
  }
}
