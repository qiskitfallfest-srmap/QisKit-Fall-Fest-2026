/**
 * Ultra-Fast Built-in TypeScript Quantum Circuit Judge Engine
 * Designed for Next.js on Vercel Serverless (Zero External Python / Docker Dependency).
 * Evaluates participant solutions for Problems P1 through P9.
 */

import { QISKIT_CHALLENGES } from '@/data/qiskit/challenges';

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
  append(gate: any, qubits?: number[], clbits?: number[]) {
    if (gate && gate.gates) {
      for (const g of gate.gates) {
        this.gates.push({ ...g });
      }
    } else {
      this.gates.push({ name: gate?.name || 'custom_gate', qubits: qubits || [0], clbits: clbits || [] });
    }
    return this;
  }
  to_gate(options?: any) {
    return { name: options?.label || 'custom_gate', gates: this.gates.map((g) => ({ ...g })) };
  }
  remove_final_measurements(inplace: boolean = false) {
    const c = inplace ? this : this.copy();
    c.gates = c.gates.filter((g) => g.name !== 'measure');
    return c;
  }
  find_bit(bit: any) {
    return { index: typeof bit === 'number' ? bit : (bit?.index ?? 0) };
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
    trimmed = trimmed.replace(/\[::-1\]/g, '.split("").reverse().join("")');

    // def func(...) -> Ret:
    const defMatch = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)(\s*->.*?)?:$/);
    if (defMatch) {
      indentStack.push(indent + 4);
      const cleanArgs = defMatch[2].split(',').map((a) => a.split(':')[0].trim()).filter(Boolean).join(', ');
      jsLines.push(' '.repeat(indent) + `function ${defMatch[1]}(${cleanArgs}) {`);
      continue;
    }

    // while ...:
    const whileMatch = trimmed.match(/^while\s+(.*?):$/);
    if (whileMatch) {
      indentStack.push(indent + 4);
      let cond = whileMatch[1]
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\b/g, '!');
      jsLines.push(' '.repeat(indent) + `while (${cond}) { if (Date.now() - __eval_start_time > 2000) throw new Error("Execution timed out (infinite loop detected)");`);
      continue;
    }

    // for ... in range(...):
    const forRangeMatch = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\((.*?)\):$/);
    if (forRangeMatch) {
      indentStack.push(indent + 4);
      const varName = forRangeMatch[1];
      const rangeArgs = forRangeMatch[2].split(',').map((x) => x.trim());
      if (rangeArgs.length === 1) {
        jsLines.push(' '.repeat(indent) + `for (let ${varName} = 0; ${varName} < ${rangeArgs[0]}; ${varName}++) { if (Date.now() - __eval_start_time > 2000) throw new Error("Execution timed out");`);
      } else {
        jsLines.push(' '.repeat(indent) + `for (let ${varName} = ${rangeArgs[0]}; ${varName} < ${rangeArgs[1]}; ${varName}++) { if (Date.now() - __eval_start_time > 2000) throw new Error("Execution timed out");`);
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
      jsLines.push(' '.repeat(indent) + `for (let ${idxVar} = 0; ${idxVar} < _list_${idxVar}.length; ${idxVar}++) { if (Date.now() - __eval_start_time > 2000) throw new Error("Execution timed out"); const ${valVar} = _list_${idxVar}[${idxVar}];`);
      continue;
    }

    // for ... in ...:
    const forInMatch = trimmed.match(/^for\s+([a-zA-Z0-9_,\s()]+)\s+in\s+(.*?):$/);
    if (forInMatch) {
      indentStack.push(indent + 4);
      jsLines.push(' '.repeat(indent) + `for (const ${forInMatch[1]} of ${forInMatch[2]}) { if (Date.now() - __eval_start_time > 2000) throw new Error("Execution timed out");`);
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
    process: undefined,
    require: undefined,
    global: undefined,
    globalThis: undefined,
    console: undefined,
    setTimeout: undefined,
    setInterval: undefined,
    fetch: undefined,
    window: undefined,
    document: undefined,
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
    Parameter: function (name: string) { return { name }; },
    Statevector: function (qc: any) {
      return {
        probabilities_dict: () => ({ '0': 1.0 }),
        probabilities: () => [1.0, 0.0],
      };
    },
  };

  const fnBody = `const __eval_start_time = Date.now();\n${js}\nreturn typeof ${targetFunctionName} !== 'undefined' ? ${targetFunctionName} : null;`;
  const fn = new Function(...Object.keys(sandbox), fnBody);
  return fn(...Object.values(sandbox));
}

/**
 * Universal Problem Evaluators
 */

// P1: Ket Reader
function evaluateP1(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  const publicCases = ['0', '1', '10', '101'];
  const hiddenCases = [
    '00', '11', '000', '111', '010', '1010', '0101', '110011',
    '101010', '01101001', '111100001111', '000000000001',
  ];

  let func: any = null;
  try {
    func = executeUserFunction(userCode, 'prepare_ket');
  } catch (err: any) {
    return {
      success: false,
      mode,
      score: 0,
      max_score: 6,
      passed_tests: 0,
      total_tests: publicCases.length + (mode === 'submit' ? hiddenCases.length : 0),
      execution_time_ms: Date.now() - start,
      stdout: '',
      stderr: `Syntax error: ${err.message}`,
      error_message: `Compilation error: ${err.message}`,
      public_results: [],
      hidden_results: [],
    };
  }

  if (!func || typeof func !== 'function') {
    return {
      success: false,
      mode,
      score: 0,
      max_score: 6,
      passed_tests: 0,
      total_tests: publicCases.length,
      execution_time_ms: Date.now() - start,
      stdout: '',
      stderr: "Function 'prepare_ket' not found.",
      error_message: "Function 'prepare_ket' is not defined in submission.",
      public_results: [
        {
          test_type: 'public',
          test_number: 1,
          test_name: 'Function Presence',
          passed: false,
          execution_time_ms: 0,
          error_message: "Function 'prepare_ket' not defined.",
        },
      ],
      hidden_results: [],
    };
  }

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

  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 6);

  return {
    success: isFull,
    mode,
    score,
    max_score: 6,
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

// P2: Parity Probe
function evaluateP2(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  const publicCases = [2, 3];
  const hiddenCases = [1, 4, 5];

  let func: any = null;
  try {
    func = executeUserFunction(userCode, 'parity_probe');
  } catch (err: any) {
    return {
      success: false,
      mode,
      score: 0,
      max_score: 8,
      passed_tests: 0,
      total_tests: 2,
      execution_time_ms: Date.now() - start,
      stdout: '',
      stderr: err.message,
      error_message: `Compilation error: ${err.message}`,
      public_results: [],
      hidden_results: [],
    };
  }

  if (!func || typeof func !== 'function') {
    return {
      success: false,
      mode,
      score: 0,
      max_score: 8,
      passed_tests: 0,
      total_tests: 2,
      execution_time_ms: Date.now() - start,
      stdout: '',
      stderr: "Function 'parity_probe' not found.",
      error_message: "Function 'parity_probe' is not defined in submission.",
      public_results: [],
      hidden_results: [],
    };
  }

  function testCase(n: number, type: 'public' | 'hidden', num: number, name: string): TestResultItem {
    const t0 = Date.now();
    try {
      const qc = func(n);
      if (!qc || qc.numQubits !== n + 1) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${n + 1} qubits, got ${qc?.numQubits}.` };
      }
      if (qc.numClbits !== 1) {
        return { test_type: type, test_number: num, test_name: name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected 1 classical bit, got ${qc?.numClbits}.` };
      }

      // Check measurement
      const measures = (qc.gates || []).filter((g: any) => g.name === 'measure');
      if (measures.length !== 1 || measures[0].qubits[0] !== n || measures[0].clbits[0] !== 0) {
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

  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 8);

  return {
    success: isFull,
    mode,
    score,
    max_score: 8,
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

// Generic failure helper
function makeFailResult(mode: 'run' | 'submit', maxScore: number, errorMsg: string, testName: string = 'Verification'): JudgeEvaluationResult {
  return {
    success: false,
    mode,
    score: 0,
    max_score: maxScore,
    passed_tests: 0,
    total_tests: 1,
    execution_time_ms: 1,
    stdout: '',
    stderr: errorMsg,
    error_message: errorMsg,
    public_results: [
      {
        test_type: 'public',
        test_number: 1,
        test_name: testName,
        passed: false,
        execution_time_ms: 1,
        error_message: errorMsg,
      },
    ],
    hidden_results: [],
  };
}

// P3: Repair Shop
function evaluateP3(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  let func: any = null;
  try {
    func = executeUserFunction(userCode, 'repair_circuit');
  } catch (err: any) {
    return makeFailResult(mode, 10, `Compilation error: ${err.message}`, "Syntax Verification");
  }

  if (!func || typeof func !== 'function') {
    return makeFailResult(mode, 10, "Function 'repair_circuit' is not defined in submission.", "Function Presence");
  }

  const ALLOWED_GATES = new Set(['h', 'x', 'y', 'z', 's', 'sdg', 't', 'tdg', 'sx', 'rx', 'ry', 'rz', 'cx', 'cz', 'swap']);

  const publicCases = [
    {
      num: 1,
      name: "Identity / No Fault Case",
      buildBuggy: () => new MockQuantumCircuit(3).h(0).cx(0, 1).cx(1, 2),
      verify: (rep: MockQuantumCircuit) => {
        return rep.gates.some(g => g.name === 'cx' && g.qubits[0] === 0 && g.qubits[1] === 1);
      },
    },
    {
      num: 2,
      name: "Reversed CX Fault",
      buildBuggy: () => new MockQuantumCircuit(3).h(0).cx(1, 0).x(2),
      verify: (rep: MockQuantumCircuit) => {
        const hasReversed = rep.gates.some(g => g.name === 'cx' && g.qubits[0] === 1 && g.qubits[1] === 0);
        const hasCorrect = rep.gates.some(g => g.name === 'cx' && g.qubits[0] === 0 && g.qubits[1] === 1);
        if (hasReversed && !hasCorrect) return "Reversed CX(1, 0) fault was not corrected to CX(0, 1).";
        return hasCorrect;
      },
    },
    {
      num: 3,
      name: "Inverted Rotation Sign",
      buildBuggy: () => new MockQuantumCircuit(3).rx(-Math.PI / 4, 0).cz(0, 1),
      verify: (rep: MockQuantumCircuit) => {
        const rxGate = rep.gates.find(g => g.name === 'rx' && g.qubits[0] === 0);
        if (!rxGate) return "Missing rx gate on qubit 0.";
        const angle = rxGate.params?.[0] ?? 0;
        if (angle <= 0) return `Inverted rotation sign not corrected: angle is ${angle} (expected > 0).`;
        return true;
      },
    },
  ];

  const hiddenCases = [
    {
      num: 1,
      name: "Hidden Missing Gate",
      buildBuggy: () => new MockQuantumCircuit(3).h(0).h(1).cx(0, 2),
      verify: (rep: MockQuantumCircuit) => {
        const hasS = rep.gates.some(g => (g.name === 's' || g.name === 'rz') && g.qubits[0] === 1);
        if (!hasS) return "Missing S gate on qubit 1 was not added.";
        return true;
      },
    },
    {
      num: 2,
      name: "Hidden S/Sdg Phase Fault",
      buildBuggy: () => new MockQuantumCircuit(3).h(0).sdg(0),
      verify: (rep: MockQuantumCircuit) => {
        const hasSdg = rep.gates.some(g => g.name === 'sdg' && g.qubits[0] === 0);
        const hasS = rep.gates.some(g => g.name === 's' && g.qubits[0] === 0);
        if (hasSdg && !hasS) return "Sdg gate on qubit 0 was not replaced with S gate.";
        return true;
      },
    },
    {
      num: 3,
      name: "Hidden 2-Fault 4-Qubit",
      buildBuggy: () => new MockQuantumCircuit(4).h(0).cx(1, 0).cx(1, 2).z(3),
      verify: (rep: MockQuantumCircuit) => {
        const hasReversed = rep.gates.some(g => g.name === 'cx' && g.qubits[0] === 1 && g.qubits[1] === 0);
        const hasWrongZ = rep.gates.some(g => g.name === 'z' && g.qubits[0] === 3);
        if (hasReversed) return "Fault 1 (reversed CX(1, 0)) not corrected.";
        if (hasWrongZ) return "Fault 2 (Z(3) instead of X(3)) not corrected.";
        return true;
      },
    },
  ];

  function runCase(c: any, type: 'public' | 'hidden'): TestResultItem {
    const t0 = Date.now();
    try {
      const buggy = c.buildBuggy();
      const rep = func(buggy, null);
      if (!rep || typeof rep !== 'object') {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: "Expected return type QuantumCircuit, received NoneType or invalid object." };
      }
      if (rep.numQubits !== buggy.numQubits) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${buggy.numQubits} qubits, got ${rep.numQubits}.` };
      }
      if (rep.size() > buggy.size() + 3) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Repaired circuit size exceeds buggy.size()+3 limit.` };
      }
      for (const g of rep.gates || []) {
        if (!ALLOWED_GATES.has(g.name.toLowerCase())) {
          return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Gate '${g.name}' not in allowed gate set.` };
        }
      }
      const v = c.verify(rep, buggy);
      if (v !== true) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: typeof v === 'string' ? v : "State fidelity below threshold 1 - 1e-9." };
      }
      return { test_type: type, test_number: c.num, test_name: c.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || "Execution error in repair_circuit." };
    }
  }

  const pubResults = publicCases.map((c) => runCase(c, 'public'));
  const hidResults = mode === 'submit' ? hiddenCases.map((c) => runCase(c, 'hidden')) : [];
  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 10);

  return {
    success: isFull && (mode === 'run' || score === 10),
    mode,
    score: mode === 'submit' ? score : 0,
    max_score: 10,
    passed_tests: passedCount,
    total_tests: allTests.length,
    execution_time_ms: Date.now() - start,
    stdout: `[Evaluator] Passed ${passedCount}/${allTests.length} tests.`,
    stderr: '',
    error_message: isFull ? null : allTests.find(t => !t.passed)?.error_message || "Not all tests passed.",
    public_results: pubResults,
    hidden_results: hidResults,
  };
}

// P4: Floating-Ancilla Bernstein–Vazirani
function evaluateP4(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  let func: any = null;
  try {
    func = executeUserFunction(userCode, 'bernstein_vazirani');
  } catch (err: any) {
    return makeFailResult(mode, 10, `Compilation error: ${err.message}`, "Syntax Verification");
  }

  if (!func || typeof func !== 'function') {
    return makeFailResult(mode, 10, "Function 'bernstein_vazirani' is not defined in submission.", "Function Presence");
  }

  const publicCases = [
    { num: 1, name: "Standard Ancilla (Last) n=2", n: 2, anc: 2, s: "10", b: 0 },
    { num: 2, name: "First Qubit Ancilla n=3 with Bias", n: 3, anc: 0, s: "110", b: 1 },
    { num: 3, name: "Middle Qubit Ancilla n=3", n: 3, anc: 1, s: "011", b: 0 },
  ];

  const hiddenCases = [
    { num: 1, name: "Hidden n=4 Anc=0", n: 4, anc: 0, s: "1011", b: 0 },
    { num: 2, name: "Hidden n=4 Anc=2 with Bias", n: 4, anc: 2, s: "0110", b: 1 },
    { num: 3, name: "Hidden n=4 Anc=4", n: 4, anc: 4, s: "1111", b: 0 },
    { num: 4, name: "Hidden n=5 Anc=3 with Bias", n: 5, anc: 3, s: "10011", b: 1 },
    { num: 5, name: "Hidden n=5 Anc=0 Single Bit", n: 5, anc: 0, s: "00001", b: 0 },
  ];

  function runCase(c: any, type: 'public' | 'hidden'): TestResultItem {
    const t0 = Date.now();
    try {
      const mockOracle = {
        name: `U_f(s=${c.s},b=${c.b})`,
        to_gate: () => ({ name: `U_f` }),
      };

      const qc = func(mockOracle, c.n, c.anc);
      if (!qc || typeof qc !== 'object') {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: "Expected return type QuantumCircuit, received NoneType or invalid object." };
      }
      if (qc.numQubits !== c.n + 1) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${c.n + 1} qubits, got ${qc.numQubits}.` };
      }
      if (qc.numClbits !== c.n) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${c.n} classical bits, got ${qc.numClbits}.` };
      }

      const hasAncX = (qc.gates || []).some((g: any) => g.name === 'x' && g.qubits.includes(c.anc));
      if (!hasAncX) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Missing X gate on ancilla qubit (qubit ${c.anc}) for phase kickback.` };
      }

      const hasAncH = (qc.gates || []).some((g: any) => g.name === 'h' && g.qubits.includes(c.anc));
      if (!hasAncH) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Missing H gate on ancilla qubit (qubit ${c.anc}).` };
      }

      const dataQubits = Array.from({ length: c.n + 1 }, (_, i) => i).filter((q) => q !== c.anc);
      for (const dq of dataQubits) {
        const hCount = (qc.gates || []).filter((g: any) => g.name === 'h' && g.qubits.includes(dq)).length;
        if (hCount < 2) {
          return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Data qubit ${dq} must have Hadamard gates before and after the oracle query (found ${hCount}).` };
        }
      }

      const measures = (qc.gates || []).filter((g: any) => g.name === 'measure');
      if (measures.length < c.n) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Circuit must measure all ${c.n} data qubits.` };
      }

      return { test_type: type, test_number: c.num, test_name: c.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || "Execution error in bernstein_vazirani." };
    }
  }

  const pubResults = publicCases.map((c) => runCase(c, 'public'));
  const hidResults = mode === 'submit' ? hiddenCases.map((c) => runCase(c, 'hidden')) : [];
  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 10);

  return {
    success: isFull && (mode === 'run' || score === 10),
    mode,
    score: mode === 'submit' ? score : 0,
    max_score: 10,
    passed_tests: passedCount,
    total_tests: allTests.length,
    execution_time_ms: Date.now() - start,
    stdout: `[Evaluator] Passed ${passedCount}/${allTests.length} tests.`,
    stderr: '',
    error_message: isFull ? null : allTests.find(t => !t.passed)?.error_message || "Not all tests passed.",
    public_results: pubResults,
    hidden_results: hidResults,
  };
}

// P5: Any-Pauli Estimator
function evaluateP5(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  let circuitFn: any = null;
  let expectFn: any = null;
  try {
    circuitFn = executeUserFunction(userCode, 'pauli_measurement_circuit');
  } catch {}
  try {
    expectFn = executeUserFunction(userCode, 'expectation_from_counts');
  } catch {}

  const publicCases = [
    {
      num: 1,
      name: "Circuit Basis Rotation for X",
      run: () => {
        if (!circuitFn || typeof circuitFn !== 'function') return "Function 'pauli_measurement_circuit' not defined.";
        const qc = new MockQuantumCircuit(1).h(0);
        const measQc = circuitFn(qc, 'X');
        if (!measQc || measQc.numQubits !== 1 || measQc.numClbits !== 1) return "Circuit must have 1 qubit and 1 classical bit.";
        const hasH = (measQc.gates || []).some((g: any) => g.name === 'h' && g.qubits.includes(0));
        if (!hasH) return "X-basis rotation requires applying Hadamard before measurement.";
        return true;
      },
    },
    {
      num: 2,
      name: "Expectation from Counts for Z",
      run: () => {
        if (!expectFn || typeof expectFn !== 'function') return "Function 'expectation_from_counts' not defined.";
        const v1 = expectFn({ "0": 750, "1": 250 }, "Z");
        const v2 = expectFn({ "0": 100, "1": 900 }, "Z");
        if (typeof v1 !== 'number' || typeof v2 !== 'number') return "Expectation function must return float numbers.";
        if (Math.abs(v1 - 0.5) > 1e-3 || Math.abs(v2 - (-0.8)) > 1e-3) {
          return `Expected 0.5 and -0.8, received ${v1} and ${v2}.`;
        }
        return true;
      },
    },
    {
      num: 3,
      name: "All-Identity Expectation",
      run: () => {
        if (!expectFn || typeof expectFn !== 'function') return "Function 'expectation_from_counts' not defined.";
        const v1 = expectFn({ "01": 500, "10": 500 }, "II");
        const v2 = expectFn({ "00": 300, "11": 700 }, "II");
        if (Math.abs(v1 - 1.0) > 1e-3 || Math.abs(v2 - 1.0) > 1e-3) {
          return `Expected 1.0 for all-I expectation, received ${v1} and ${v2}.`;
        }
        return true;
      },
    },
  ];

  const hiddenCases = [
    {
      num: 1,
      name: "Hidden Y Rotation",
      run: () => {
        if (!circuitFn || typeof circuitFn !== 'function') return "Function 'pauli_measurement_circuit' not defined.";
        const qc = new MockQuantumCircuit(1);
        const measQc = circuitFn(qc, 'Y');
        const hasSdgOrRz = (measQc.gates || []).some((g: any) => (g.name === 'sdg' || g.name === 'rz') && g.qubits.includes(0));
        const hasH = (measQc.gates || []).some((g: any) => g.name === 'h' && g.qubits.includes(0));
        if (!hasSdgOrRz || !hasH) return "Y-basis rotation requires applying Sdg followed by Hadamard before measurement.";
        return true;
      },
    },
    {
      num: 2,
      name: "Hidden 2-Qubit Expectation XZ",
      run: () => {
        if (!expectFn || typeof expectFn !== 'function') return "Function 'expectation_from_counts' not defined.";
        const v = expectFn({ "00": 300, "01": 200, "10": 100, "11": 400 }, "XZ");
        if (Math.abs(v - 0.4) > 1e-3) return `Expected 0.4 for XZ, received ${v}.`;
        return true;
      },
    },
    {
      num: 3,
      name: "Hidden 3-Qubit Expectation ZIZ",
      run: () => {
        if (!expectFn || typeof expectFn !== 'function') return "Function 'expectation_from_counts' not defined.";
        const v = expectFn({ "000": 500, "101": 500 }, "ZIZ");
        if (Math.abs(v - 1.0) > 1e-3) return `Expected 1.0 for ZIZ, received ${v}.`;
        return true;
      },
    },
  ];

  function runCase(c: any, type: 'public' | 'hidden'): TestResultItem {
    const t0 = Date.now();
    try {
      const res = c.run();
      if (res !== true) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: typeof res === 'string' ? res : "Test assertion failed." };
      }
      return { test_type: type, test_number: c.num, test_name: c.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || "Execution error in P5." };
    }
  }

  const pubResults = publicCases.map((c) => runCase(c, 'public'));
  const hidResults = mode === 'submit' ? hiddenCases.map((c) => runCase(c, 'hidden')) : [];
  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 10);

  return {
    success: isFull && (mode === 'run' || score === 10),
    mode,
    score: mode === 'submit' ? score : 0,
    max_score: 10,
    passed_tests: passedCount,
    total_tests: allTests.length,
    execution_time_ms: Date.now() - start,
    stdout: `[Evaluator] Passed ${passedCount}/${allTests.length} tests.`,
    stderr: '',
    error_message: isFull ? null : allTests.find(t => !t.passed)?.error_message || "Not all tests passed.",
    public_results: pubResults,
    hidden_results: hidResults,
  };
}

// P6: Shift-Rule Gradient
function evaluateP6(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  let func: any = null;
  try {
    func = executeUserFunction(userCode, 'param_shift_gradient');
  } catch (err: any) {
    return makeFailResult(mode, 11, `Compilation error: ${err.message}`, "Syntax Verification");
  }

  if (!func || typeof func !== 'function') {
    return makeFailResult(mode, 11, "Function 'param_shift_gradient' is not defined in submission.", "Function Presence");
  }

  const publicCases = [
    {
      num: 1,
      name: "Single Parameter RX",
      run: () => {
        let calls = 0;
        const nominal = Math.PI / 4;
        const evalFn = (c: any) => {
          calls++;
          // Expect objective f(θ) = cos(θ)
          const theta = c?.params?.[0] ?? nominal;
          return Math.cos(theta);
        };
        const grad = func(new MockQuantumCircuit(1).rx(nominal, 0), [nominal], evalFn);
        if (!Array.isArray(grad) || grad.length !== 1) return "Gradient output must be a 1D array matching parameter count.";
        if (calls < 2) return "Parameter shift rule requires evaluating circuit at shifted parameter angles (+/- pi/2).";
        const ref = -Math.sin(nominal);
        if (Math.abs(grad[0] - ref) > 1e-4) return `Gradient error: expected ${ref.toFixed(6)}, got ${grad[0]}.`;
        return true;
      },
    },
    {
      num: 2,
      name: "Two Parameters (RY, RZ)",
      run: () => {
        let calls = 0;
        const vals = [0.6, 1.2];
        const evalFn = (c: any) => {
          calls++;
          const t1 = c?.params?.[0] ?? vals[0];
          return Math.cos(t1);
        };
        const grad = func(new MockQuantumCircuit(1).ry(vals[0], 0).rz(vals[1], 0), vals, evalFn);
        if (!Array.isArray(grad) || grad.length !== 2) return "Gradient output must be array of length 2.";
        if (calls < 4) return "Parameter shift rule requires evaluating each parameter (+/- pi/2).";
        const ref0 = -Math.sin(vals[0]);
        const ref1 = 0.0;
        if (Math.abs(grad[0] - ref0) > 1e-4 || Math.abs(grad[1] - ref1) > 1e-4) {
          return `Gradient error: expected [${ref0.toFixed(4)}, ${ref1.toFixed(4)}], got [${grad[0]}, ${grad[1]}].`;
        }
        return true;
      },
    },
  ];

  const hiddenCases = [
    {
      num: 1,
      name: "Hidden Repeated Parameter",
      run: () => {
        let calls = 0;
        const vals = [0.4];
        const evalFn = (c: any) => {
          calls++;
          const t = c?.params?.[0] ?? vals[0];
          return Math.cos(2 * t);
        };
        const grad = func(new MockQuantumCircuit(1).rx(0.4, 0).rx(0.4, 0), vals, evalFn);
        if (!Array.isArray(grad) || grad.length !== 1) return "Gradient shape mismatch: expected 1D array of length 1.";
        if (calls < 2) return "Parameter shift rule requires evaluating circuit at shifted parameter angles (+/- pi/2).";
        const ref = -2 * Math.sin(0.8);
        if (Math.abs(grad[0] - ref) > 1e-4) return `Gradient error: expected ${ref.toFixed(4)}, got ${grad[0]}.`;
        return true;
      },
    },
  ];

  function runCase(c: any, type: 'public' | 'hidden'): TestResultItem {
    const t0 = Date.now();
    try {
      const res = c.run();
      if (res !== true) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: typeof res === 'string' ? res : "Gradient verification failed." };
      }
      return { test_type: type, test_number: c.num, test_name: c.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || "Execution error in param_shift_gradient." };
    }
  }

  const pubResults = publicCases.map((c) => runCase(c, 'public'));
  const hidResults = mode === 'submit' ? hiddenCases.map((c) => runCase(c, 'hidden')) : [];
  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 11);

  return {
    success: isFull && (mode === 'run' || score === 11),
    mode,
    score: mode === 'submit' ? score : 0,
    max_score: 11,
    passed_tests: passedCount,
    total_tests: allTests.length,
    execution_time_ms: Date.now() - start,
    stdout: `[Evaluator] Passed ${passedCount}/${allTests.length} tests.`,
    stderr: '',
    error_message: isFull ? null : allTests.find(t => !t.passed)?.error_message || "Not all tests passed.",
    public_results: pubResults,
    hidden_results: hidResults,
  };
}

// P7: Directed-Coupling Router
function evaluateP7(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  let func: any = null;
  try {
    func = executeUserFunction(userCode, 'route_to_coupling');
  } catch (err: any) {
    return makeFailResult(mode, 12, `Compilation error: ${err.message}`, "Syntax Verification");
  }

  if (!func || typeof func !== 'function') {
    return makeFailResult(mode, 12, "Function 'route_to_coupling' is not defined in submission.", "Function Presence");
  }

  const ALLOWED_BASIS = new Set(['cx', 'rz', 'sx', 'x']);

  const publicCases = [
    {
      num: 1,
      name: "4-Qubit Distant CX",
      circuit: new MockQuantumCircuit(4).h(0).cx(0, 2),
      coupling: [[0, 1], [1, 2], [2, 3], [1, 0], [2, 1], [3, 2]],
      refCx: 7,
    },
  ];

  const hiddenCases = [
    {
      num: 1,
      name: "Hidden Directed Edge Reversal",
      circuit: new MockQuantumCircuit(2).cx(1, 0),
      coupling: [[0, 1]],
      refCx: 1,
    },
  ];

  function runCase(c: any, type: 'public' | 'hidden'): TestResultItem {
    const t0 = Date.now();
    try {
      const outQc = func(c.circuit, c.coupling);
      if (!outQc || typeof outQc !== 'object') {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: "Expected return type QuantumCircuit, received NoneType or invalid object." };
      }

      // Check basis gates
      for (const inst of outQc.gates || []) {
        if (!ALLOWED_BASIS.has(inst.name.toLowerCase())) {
          return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Gate '${inst.name}' not in allowed basis {cx, rz, sx, x}.` };
        }
      }

      // Check coupling map
      const couplingSet = new Set(c.coupling.map((pair: number[]) => `${pair[0]},${pair[1]}`));
      let cxCount = 0;
      for (const inst of outQc.gates || []) {
        if (inst.name.toLowerCase() === 'cx') {
          cxCount++;
          const u = inst.qubits[0];
          const v = inst.qubits[1];
          if (!couplingSet.has(`${u},${v}`)) {
            return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `CX(${u}, ${v}) violates directed coupling map.` };
          }
        }
      }

      if (cxCount === 0 && c.circuit.gates.some((g: any) => g.name === 'cx')) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: "Routed circuit is missing required CX entangling operations." };
      }

      if (cxCount > c.refCx * 2.5) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Excessive CX count: ${cxCount} (max allowed: ${Math.round(c.refCx * 2.5)}).` };
      }

      return { test_type: type, test_number: c.num, test_name: c.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || "Execution error in route_to_coupling." };
    }
  }

  const pubResults = publicCases.map((c) => runCase(c, 'public'));
  const hidResults = mode === 'submit' ? hiddenCases.map((c) => runCase(c, 'hidden')) : [];
  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 12);

  return {
    success: isFull && (mode === 'run' || score === 12),
    mode,
    score: mode === 'submit' ? score : 0,
    max_score: 12,
    passed_tests: passedCount,
    total_tests: allTests.length,
    execution_time_ms: Date.now() - start,
    stdout: `[Evaluator] Passed ${passedCount}/${allTests.length} tests.`,
    stderr: '',
    error_message: isFull ? null : allTests.find(t => !t.passed)?.error_message || "Not all tests passed.",
    public_results: pubResults,
    hidden_results: hidResults,
  };
}

// P8: Noise-Scaled Extrapolation (ZNE)
function evaluateP8(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  let func: any = null;
  try {
    func = executeUserFunction(userCode, 'zne_expectation');
  } catch (err: any) {
    return makeFailResult(mode, 15, `Compilation error: ${err.message}`, "Syntax Verification");
  }

  if (!func || typeof func !== 'function') {
    return makeFailResult(mode, 15, "Function 'zne_expectation' is not defined in submission.", "Function Presence");
  }

  const publicCases = [
    {
      num: 1,
      name: "Bell Pair ZZ Mitigation",
      circuit: new MockQuantumCircuit(2).h(0).cx(0, 1),
      zMask: "ZZ",
      idealVal: 1.0,
      noiseRate: 0.15,
    },
  ];

  const hiddenCases = [
    {
      num: 1,
      name: "Hidden GHZ ZZZ Mitigation",
      circuit: new MockQuantumCircuit(3).h(0).cx(0, 1).cx(1, 2),
      zMask: "ZZZ",
      idealVal: 1.0,
      noiseRate: 0.18,
    },
  ];

  function runCase(c: any, type: 'public' | 'hidden'): TestResultItem {
    const t0 = Date.now();
    try {
      let calls = 0;
      const scales: number[] = [];

      const mockNoisyRunner = (qc: any, shots: number) => {
        calls++;
        const scale = Math.max(1.0, (qc?.gates?.length || 1) / Math.max(1, c.circuit.gates.length));
        scales.push(scale);
        const noisyVal = c.idealVal * Math.exp(-c.noiseRate * scale);
        const evenProb = (1.0 + noisyVal) / 2.0;
        const nEven = Math.round(shots * evenProb);
        const nOdd = shots - nEven;
        return { "00": nEven, "11": nOdd };
      };

      const est = func(c.circuit, c.zMask, mockNoisyRunner, 4000);
      if (typeof est !== 'number' || isNaN(est)) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: "Function must return a float zero-noise expectation value." };
      }

      if (calls < 2) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `ZNE requires calling noisy_runner at least twice with scaled/folded circuits. Only ${calls} call made.` };
      }

      const distinctScales = new Set(scales.map((s) => s.toFixed(1))).size;
      if (distinctScales < 2) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: "ZNE requires evaluating at least 2 distinct noise scale factors." };
      }

      const err = Math.abs(est - c.idealVal);
      const rawNoisy = c.idealVal * Math.exp(-c.noiseRate);
      const rawErr = Math.abs(rawNoisy - c.idealVal);

      if (err > 0.08 || (err >= rawErr && rawErr > 0.05)) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `ZNE estimate ${est.toFixed(4)} failed to extrapolate accurately (error: ${err.toFixed(4)}, raw error: ${rawErr.toFixed(4)}).` };
      }

      return { test_type: type, test_number: c.num, test_name: c.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || "Execution error in zne_expectation." };
    }
  }

  const pubResults = publicCases.map((c) => runCase(c, 'public'));
  const hidResults = mode === 'submit' ? hiddenCases.map((c) => runCase(c, 'hidden')) : [];
  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 15);

  return {
    success: isFull && (mode === 'run' || score === 15),
    mode,
    score: mode === 'submit' ? score : 0,
    max_score: 15,
    passed_tests: passedCount,
    total_tests: allTests.length,
    execution_time_ms: Date.now() - start,
    stdout: `[Evaluator] Passed ${passedCount}/${allTests.length} tests.`,
    stderr: '',
    error_message: isFull ? null : allTests.find(t => !t.passed)?.error_message || "Not all tests passed.",
    public_results: pubResults,
    hidden_results: hidResults,
  };
}

// P9: Weighted-MaxCut QAOA
function evaluateP9(userCode: string, mode: 'run' | 'submit'): JudgeEvaluationResult {
  const start = Date.now();
  let func: any = null;
  try {
    func = executeUserFunction(userCode, 'qaoa_maxcut');
  } catch (err: any) {
    return makeFailResult(mode, 18, `Compilation error: ${err.message}`, "Syntax Verification");
  }

  if (!func || typeof func !== 'function') {
    return makeFailResult(mode, 18, "Function 'qaoa_maxcut' is not defined in submission.", "Function Presence");
  }

  const publicCases = [
    {
      num: 1,
      name: "Triangle Graph K3 (p=1)",
      n: 3,
      edges: [[0, 1, 1.0], [1, 2, 1.0], [0, 2, 1.0]],
      p: 1,
    },
    {
      num: 2,
      name: "Square Cycle C4 (p=1)",
      n: 4,
      edges: [[0, 1, 1.0], [1, 2, 1.0], [2, 3, 1.0], [3, 0, 1.0]],
      p: 1,
    },
  ];

  const hiddenCases = [
    {
      num: 1,
      name: "Hidden Line Graph 4Q (p=2)",
      n: 4,
      edges: [[0, 1, 1.0], [1, 2, 1.0], [2, 3, 1.0]],
      p: 2,
    },
    {
      num: 2,
      name: "Hidden Complete Graph K4 (p=2)",
      n: 4,
      edges: [[0, 1, 1.0], [1, 2, 1.0], [2, 3, 1.0], [0, 2, 1.0], [1, 3, 1.0], [0, 3, 1.0]],
      p: 2,
    },
  ];

  function runCase(c: any, type: 'public' | 'hidden'): TestResultItem {
    const t0 = Date.now();
    try {
      const qc = func(c.n, c.edges, c.p);
      if (!qc || typeof qc !== 'object') {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: "Expected return type QuantumCircuit, received NoneType or invalid object." };
      }
      if (qc.numQubits !== c.n) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${c.n} qubits, got ${qc.numQubits}.` };
      }
      if (qc.numClbits !== c.n) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${c.n} classical bits for measurement, got ${qc.numClbits}.` };
      }

      // Check initial H layer
      const hCount = (qc.gates || []).filter((g: any) => g.name === 'h').length;
      if (hCount < c.n) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `QAOA state preparation requires initial Hadamard gates on all ${c.n} qubits (found ${hCount}).` };
      }

      // Check cost unitary interactions: rzz or cx-rz-cx
      const rzzCount = (qc.gates || []).filter((g: any) => g.name === 'rzz').length;
      const cxCount = (qc.gates || []).filter((g: any) => g.name === 'cx').length;
      const expectedInteractions = c.p * c.edges.length;
      const hasInteractions = rzzCount >= expectedInteractions || cxCount >= expectedInteractions * 2;
      if (!hasInteractions) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${expectedInteractions} cost Hamiltonian edge interactions (RZZ or CX-RZ-CX pairs), found insufficient gates.` };
      }

      // Check mixer layer: rx gates
      const rxCount = (qc.gates || []).filter((g: any) => g.name === 'rx').length;
      const expectedMixers = c.p * c.n;
      if (rxCount < expectedMixers) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `Expected ${expectedMixers} RX mixer gates (p * n = ${c.p} * ${c.n}), found ${rxCount}.` };
      }

      // Check final measurements
      const measures = (qc.gates || []).filter((g: any) => g.name === 'measure');
      if (measures.length < c.n) {
        return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: `All ${c.n} qubits must be measured at the end of the circuit.` };
      }

      return { test_type: type, test_number: c.num, test_name: c.name, passed: true, execution_time_ms: Date.now() - t0, error_message: null };
    } catch (e: any) {
      return { test_type: type, test_number: c.num, test_name: c.name, passed: false, execution_time_ms: Date.now() - t0, error_message: e.message || "Execution error in qaoa_maxcut." };
    }
  }

  const pubResults = publicCases.map((c) => runCase(c, 'public'));
  const hidResults = mode === 'submit' ? hiddenCases.map((c) => runCase(c, 'hidden')) : [];
  const allTests = [...pubResults, ...hidResults];
  const passedCount = allTests.filter((t) => t.passed).length;
  const isFull = passedCount === allTests.length;
  const score = Math.round((passedCount / allTests.length) * 18);

  return {
    success: isFull && (mode === 'run' || score === 18),
    mode,
    score: mode === 'submit' ? score : 0,
    max_score: 18,
    passed_tests: passedCount,
    total_tests: allTests.length,
    execution_time_ms: Date.now() - start,
    stdout: `[Evaluator] Passed ${passedCount}/${allTests.length} tests.`,
    stderr: '',
    error_message: isFull ? null : allTests.find(t => !t.passed)?.error_message || "Not all tests passed.",
    public_results: pubResults,
    hidden_results: hidResults,
  };
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
