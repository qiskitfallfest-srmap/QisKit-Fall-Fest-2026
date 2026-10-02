import React from 'react';
import { ProblemStatement } from '@/data/learning/types';
import { Cpu, FileText, CheckCircle2, Award, ShieldAlert, Layers } from 'lucide-react';

interface ProblemStatementDossierProps {
  ps: ProblemStatement;
}

export function ProblemStatementDossier({ ps }: ProblemStatementDossierProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded bg-burgundy/10 text-burgundy font-bold text-xs uppercase tracking-wider">
            {ps.vertical}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono font-bold text-xs">
            {ps.id}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{ps.title}</h2>
        <p className="text-xs text-slate-600 font-medium mt-1">{ps.subtitle}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Objective */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-burgundy" />
            1. Challenge Objective & Scientific Context
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            {ps.objective}
          </p>
        </div>

        {/* Mathematical & Quantum Formulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-burgundy" />
              Mathematical Formulation
            </h4>
            <p className="text-xs font-mono text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/60">
              {ps.mathematicalFormulation}
            </p>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-burgundy" />
              Quantum Algorithm & Primitives
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200/60">
              {ps.quantumFormulation}
            </p>
          </div>
        </div>

        {/* Hardware Benchmarking */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-burgundy" />
            2. Fixed Processor Benchmarking (Processors A, B, and C)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Processor A (5Q Linear)</span>
              <span className="text-slate-600 leading-relaxed">{ps.hardwareSpecs.processorA}</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Processor B (7Q Heavy-Hex)</span>
              <span className="text-slate-600 leading-relaxed">{ps.hardwareSpecs.processorB}</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Processor C (8-10Q Graph)</span>
              <span className="text-slate-600 leading-relaxed">{ps.hardwareSpecs.processorC}</span>
            </div>
          </div>
        </div>

        {/* Processor D Innovation Task */}
        <div className="p-4 rounded-lg border border-burgundy/20 bg-burgundy/[0.02]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-burgundy" />
            3. Custom Processor D Innovation Task (Max 12 Qubits)
          </h3>
          <p className="text-xs text-slate-800 leading-relaxed">{ps.processorDTask}</p>
        </div>

        {/* Deliverables Checklist */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-burgundy" />
            4. Submission Deliverables Checklist
          </h3>
          <ul className="space-y-1.5">
            {ps.deliverables.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-burgundy mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evaluation Rubric */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-burgundy" />
            5. The 100-Point Evaluation Rubric
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">
                Component A: Problem Formulation & Numerical Convergence (40 Points)
              </span>
              <span className="text-slate-600">{ps.evaluationRubric.componentA}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">
                Component B: Architectural Analysis & Hardware Benchmarks (30 Points)
              </span>
              <span className="text-slate-600">{ps.evaluationRubric.componentB}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">
                Component C: Custom Processor D Coupling Innovation (30 Points)
              </span>
              <span className="text-slate-600">{ps.evaluationRubric.componentC}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
