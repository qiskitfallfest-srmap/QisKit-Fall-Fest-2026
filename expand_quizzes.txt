const fs = require('fs');
let content = fs.readFileSync('data/learning/quizzes.ts', 'utf-8');

const additions = {
  'session-1': `      },
      {
        id: 's1-q5',
        question:
          'What is the effect of applying the Pauli-Z gate to the |1⟩ state?',
        options: [
          'It flips it to |0⟩',
          'It adds a global phase of i',
          'It adds a relative phase of -1, producing -|1⟩',
          'It creates a superposition state',
        ],
        correctIndex: 2,
        explanation:
          'The Pauli-Z gate applies a phase shift of π to the |1⟩ state, effectively multiplying it by -1, while leaving the |0⟩ state unchanged.',
      },
      {
        id: 's1-q6',
        question:
          'In a quantum circuit, what is the purpose of a barrier instruction?',
        options: [
          'To entangle all qubits simultaneously',
          'To prevent the transpiler from optimizing or combining gates across the barrier',
          'To physically shield qubits from thermal noise',
          'To apply a classical IF conditional logic',
        ],
        correctIndex: 1,
        explanation:
          'The barrier acts as a directive to the Qiskit transpiler, preventing it from commuting, commuting, or merging gates across that point, which is useful for structural isolation and debugging.',
      },`,

  'session-2': `      },
      {
        id: 's2-q5',
        question:
          'What is the primary role of the PassManager in Qiskit?',
        options: [
          'To execute the final circuit on cloud hardware',
          'To authenticate the user’s IBM Quantum credentials',
          'To define a custom sequence of transpilation passes for circuit optimization and hardware routing',
          'To manage quantum state vectors in memory',
        ],
        correctIndex: 2,
        explanation:
          'The PassManager orchestrates a pipeline of transpiler passes (like layout, routing, translation, and optimization) to tailor a logical circuit to a specific backend topology.',
      },
      {
        id: 's2-q6',
        question:
          'Which of these best describes T1 relaxation time in superconducting qubits?',
        options: [
          'The time it takes for a qubit to lose its phase coherence without losing energy',
          'The characteristic time for a qubit in the excited |1⟩ state to decay to the ground |0⟩ state via energy loss',
          'The execution time of a single CNOT gate',
          'The time taken to cool the cryostat',
        ],
        correctIndex: 1,
        explanation:
          'T1 (longitudinal relaxation time) measures amplitude damping—the time scale over which a qubit loses energy to its environment and decays from |1⟩ to |0⟩.',
      },`,

  'session-3': `      },
      {
        id: 's3-q5',
        question:
          'What is the primary objective of the Variational Quantum Eigensolver (VQE)?',
        options: [
          'To factor large prime numbers exponentially faster',
          'To approximate the lowest energy eigenvalue (ground state) of a given Hamiltonian',
          'To perform quantum teleportation across a network',
          'To compile classical code into quantum assembly',
        ],
        correctIndex: 1,
        explanation:
          'VQE uses a parameterized quantum circuit and a classical optimizer (hybrid approach) to minimize the expectation value of a Hamiltonian, finding an upper bound to its ground state energy.',
      },
      {
        id: 's3-q6',
        question:
          'How does the Trotter-Suzuki decomposition enable quantum Hamiltonian simulation?',
        options: [
          'By splitting the exponential of a sum of non-commuting operators into a product of short-time exponentials that can be mapped to quantum gates',
          'By converting all fermionic operators into classical bits',
          'By increasing the physical temperature of the qubits',
          'By using Shor’s algorithm to factor the Hamiltonian matrix',
        ],
        correctIndex: 0,
        explanation:
          'Since many Hamiltonian terms do not commute, Trotterization approximates e^{-i(A+B)t} as (e^{-iAt/n} e^{-iBt/n})^n, allowing the simulation to be built from native rotation gates.',
      },`,

  'session-4': `      },
      {
        id: 's4-q5',
        question:
          'What is the Standard Quantum Limit (SQL) for phase estimation when using N independent, unentangled particles?',
        options: [
          'Δφ ~ 1/N',
          'Δφ ~ 1/N²',
          'Δφ ~ 1/√N',
          'Δφ ~ e^(-N)',
        ],
        correctIndex: 2,
        explanation:
          'Without entanglement, N independent probes provide a statistical precision scaling of 1/√N (the shot-noise limit or SQL), as dictated by classical probability.',
      },
      {
        id: 's4-q6',
        question:
          'Which technique is used in Ramsey interferometry to measure small static magnetic fields?',
        options: [
          'Mapping the accumulated quantum phase (acquired over time t) into measurable population differences',
          'Measuring the physical temperature change of the diamond',
          'Using a classical hall-effect sensor',
          'Executing Shor’s algorithm',
        ],
        correctIndex: 0,
        explanation:
          'In a Ramsey sequence (π/2 - wait - π/2), the qubit accumulates a relative phase proportional to the magnetic field during the free precession time, which the second π/2 pulse converts into a measurable Z-basis probability.',
      },`,

  'session-5': `      },
      {
        id: 's5-q5',
        question:
          'What is the role of the parameterized ansatz in a Variational Quantum Classifier (VQC)?',
        options: [
          'To act as a fixed random feature map',
          'To apply trainable rotation and entanglement gates whose parameters are optimized to separate classes',
          'To permanently store the training dataset',
          'To execute Shor’s algorithm',
        ],
        correctIndex: 1,
        explanation:
          'The ansatz serves as the trainable part of the model (akin to neural network weights). The classical optimizer iteratively updates its rotation angles to minimize the classification loss.',
      },
      {
        id: 's5-q6',
        question:
          'How does a Quantum Support Vector Machine (QSVM) utilize a quantum computer?',
        options: [
          'By training the classical SVM weights entirely on quantum hardware',
          'By using a quantum circuit to compute the inner product (kernel) between data points mapped to a quantum Hilbert space',
          'By replacing the classical CPU with a QPU for all OS tasks',
          'By using Grover’s algorithm to search for the best hyperparameter',
        ],
        correctIndex: 1,
        explanation:
          'A QSVM delegates only the kernel matrix evaluation K(x_i, x_j) to the quantum computer, passing the resulting matrix back to a standard classical SVM optimizer.',
      },`,

  'session-6': `      },
      {
        id: 's6-q5',
        question:
          'What principle guarantees the security of Quantum Key Distribution (QKD) protocols like BB84?',
        options: [
          'The computational difficulty of factoring large primes',
          'The no-cloning theorem and the fact that measurement disturbs a quantum state, revealing any eavesdropper',
          'The speed of light',
          'Symmetric block encryption',
        ],
        correctIndex: 1,
        explanation:
          'Unlike classical cryptography which relies on unproven mathematical hardness, QKD relies on quantum physics: an eavesdropper cannot copy unknown quantum states (no-cloning) and intercepting them introduces detectable errors.',
      },
      {
        id: 's6-q6',
        question:
          'Which approach to post-quantum cryptography is based on the difficulty of finding the shortest vector in a high-dimensional grid?',
        options: [
          'Isogeny-based cryptography',
          'Hash-based signatures',
          'Lattice-based cryptography',
          'Multivariate polynomials',
        ],
        correctIndex: 2,
        explanation:
          'Lattice-based cryptography (including NIST winners like CRYSTALS-Kyber/Dilithium) relies on the Shortest Vector Problem (SVP) and Learning With Errors (LWE), which are believed to be hard even for quantum computers.',
      },`
};

for (const session of Object.keys(additions)) {
  // Find where this session's questions array ends
  // We look for the last question in the session by matching the correct session ID
  const pattern = new RegExp(\`(id: '${session.replace('-', '\\\\-')}-q4',[\\\\s\\\\S]*?)\\\\},\\\\s*\\\\],\\\\s*\\\\}\`);
  const match = content.match(pattern);
  if (match) {
    content = content.replace(pattern, \`\$1\` + additions[session] + \`\n    ],\n  }\`);
  } else {
    console.log("Could not find match for", session);
  }
}

fs.writeFileSync('data/learning/quizzes.ts', content);
