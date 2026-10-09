const { spawn } = require('child_process');
const path = require('path');

const runnerPath = path.join(process.cwd(), 'qiskit-judge', 'runner.py');
const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

const code = `def route_to_coupling(circuit: QuantumCircuit, coupling: list)
-> QuantumCircuit:
    cmap = CouplingMap(couplinglist=coupling)
    out = transpile(
        circuit,
        basis_gates=["cx", "rz", "sx", "x"],
        coupling_map=cmap,
        initial_layout=list(range(circuit.num_qubits)),
        optimization_level=3,
        seed_transpiler=0,
        routing_method="sabre"
    )
    return out`;

const payload = JSON.stringify({
  problem_id: 'P7',
  code,
  mode: 'run',
});

console.log('Spawning:', pythonCmd, runnerPath);

const py = spawn(pythonCmd, [runnerPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    PYTHONPATH: path.join(process.cwd(), 'qiskit-judge'),
  },
});

let stdout = '';
let stderr = '';

py.stdout.on('data', (d) => { stdout += d.toString(); });
py.stderr.on('data', (d) => { stderr += d.toString(); });

py.on('error', (err) => {
  console.error('Spawn error:', err);
});

py.on('close', (code) => {
  console.log('Exit code:', code);
  console.log('STDOUT:', stdout);
  console.log('STDERR:', stderr);
});

py.stdin.write(payload);
py.stdin.end();
