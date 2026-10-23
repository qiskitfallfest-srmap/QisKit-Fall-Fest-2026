-- Migration: 20261023230000_create_qctf_tables.sql
-- Description: Quantum Capture the Flag (QCTF, 27 October 2026).
--
-- Additive only: creates qctf_* tables and one platform_config row. No existing
-- table is altered. Every table is service-role only, like the lock-down
-- migrations of 17 October; all reads and writes go through app/api/qctf/* and
-- app/api/admin/qctf behind getServerSession.
--
-- Rounds: every team, member, submission and solve carries a `run` label
-- (e.g. 'rehearsal-1', 'live'). The active run is platform_config.qctf.run, so a
-- rehearsal is wiped from view by switching runs, without deleting rows.
--
-- Flags: only SHA-256 hashes of flags are stored (qctf_challenges.flag_hash).
-- Competition statements and flags are loaded with tools/qctf_challenges_to_sql.py
-- and never committed to the repository.

-- ============================================================================
-- qctf_challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.qctf_challenges (
    id TEXT PRIMARY KEY, -- e.g. 'PQC-02'
    track_id TEXT NOT NULL CHECK (track_id IN ('qml', 'qaoa', 'pqc', 'q-chemistry', 'quantum-simulation')),
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    statement TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'hard', 'advanced')),
    points INTEGER NOT NULL CHECK (points > 0),
    tags TEXT[] NOT NULL DEFAULT '{}',
    block TEXT NOT NULL CHECK (block IN ('practice', 'block_1', 'block_2', 'final')),
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ "label": "...", "url": "..." }]
    flag_hash TEXT NOT NULL CHECK (flag_hash ~ '^[0-9a-f]{64}$'),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qctf_challenges_block ON public.qctf_challenges (block, sort_order);

-- ============================================================================
-- qctf_eligible_emails (admin-managed entry list)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.qctf_eligible_emails (
    email TEXT PRIMARY KEY CHECK (email = lower(email)),
    note TEXT,
    added_by TEXT NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- qctf_teams / qctf_team_members
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.qctf_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run TEXT NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
    join_code TEXT NOT NULL UNIQUE,
    hackathon_team_id UUID REFERENCES public.hackathon_teams(id) ON DELETE SET NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_qctf_teams_run_name ON public.qctf_teams (run, lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS uq_qctf_teams_run_hackathon
    ON public.qctf_teams (run, hackathon_team_id) WHERE hackathon_team_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.qctf_team_members (
    run TEXT NOT NULL,
    email TEXT NOT NULL CHECK (email = lower(email)),
    team_id UUID NOT NULL REFERENCES public.qctf_teams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (run, email) -- one team per person per run
);

CREATE INDEX IF NOT EXISTS idx_qctf_team_members_team ON public.qctf_team_members (team_id);

-- ============================================================================
-- qctf_submissions (every attempt) / qctf_solves (first correct flag per team)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.qctf_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES public.qctf_teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    challenge_id TEXT NOT NULL REFERENCES public.qctf_challenges(id) ON DELETE CASCADE,
    submitted_flag TEXT NOT NULL CHECK (char_length(submitted_flag) <= 200),
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qctf_submissions_rate ON public.qctf_submissions (run, email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qctf_submissions_recent ON public.qctf_submissions (run, created_at DESC);

CREATE TABLE IF NOT EXISTS public.qctf_solves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES public.qctf_teams(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL REFERENCES public.qctf_challenges(id) ON DELETE CASCADE,
    solved_by TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    solved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_qctf_solves_team_challenge UNIQUE (run, team_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_qctf_solves_run_time ON public.qctf_solves (run, solved_at);

-- ============================================================================
-- Row Level Security: service role only
-- ============================================================================
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'qctf_challenges', 'qctf_eligible_emails', 'qctf_teams',
        'qctf_team_members', 'qctf_submissions', 'qctf_solves'
    ] LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Service role manages %s" ON public.%I', t, t);
        EXECUTE format(
            'CREATE POLICY "Service role manages %s" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)',
            t, t
        );
        EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    END LOOP;
END $$;

-- ============================================================================
-- Arena state (hidden until an organizer changes it in the admin console)
-- ============================================================================
INSERT INTO public.platform_config (key, value)
VALUES (
    'qctf',
    '{"state": "hidden", "run": "rehearsal-1", "releasedBlocks": ["practice"], "frozenAt": null}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- Practice set (safe to publish; used for rehearsals and the warm-up block)
-- ============================================================================
INSERT INTO public.qctf_challenges
    (id, track_id, title, summary, statement, difficulty, points, tags, block, flag_hash, sort_order)
VALUES
    ('PRV-QML-01', 'qml', 'Bell Pair Readout',
     'Prepare the first Bell state and read out both qubits.',
     E'Build a two-qubit circuit that prepares |Φ+⟩ = (|00⟩ + |11⟩)/√2 using one Hadamard and one CNOT, then measure both qubits on a noiseless simulator.\n\nWhat is the exact probability of reading the bitstring 11?\n\nSubmit the probability as a decimal, for example qctf{0.25}.',
     'easy', 50, ARRAY['state-prep', 'measurement'], 'practice',
     'c8dcf3c1a93f85e2c8969c36825d4b81ef362656c1738d93d1f22c0d60cf4b7b', 10),
    ('PRV-QAOA-01', 'qaoa', 'Triangle Cut',
     'Find the best cut on the smallest graph with a cycle.',
     E'Consider the unweighted triangle graph with vertices {0, 1, 2} and edges (0,1), (1,2), (0,2).\n\nA QAOA solver for MaxCut searches for the partition of the vertices into two sets that cuts the most edges. What is the maximum number of edges any partition can cut?\n\nSubmit the integer, for example qctf{7}.',
     'easy', 50, ARRAY['maxcut', 'graphs'], 'practice',
     '6b56247fae0dfbd273f7811320deb81a4b09cea64c33f46fbead4adf686805a5', 20),
    ('PRV-PQC-01', 'pqc', 'Period Hunt',
     'The classical heart of Shor''s algorithm, done by hand.',
     E'Shor''s algorithm factors N by finding the period r of f(x) = a^x mod N.\n\nFor N = 15 and a = 7, what is the smallest r > 0 such that 7^r mod 15 = 1?\n\nSubmit the integer, for example qctf{9}.',
     'easy', 50, ARRAY['shor', 'period-finding'], 'practice',
     '672e4162f917010398f37947857ba659ff057c18018ccdea35f102b4ac0c4b27', 30),
    ('PRV-PQC-02', 'pqc', 'Grover Iterations',
     'How many oracle calls does an optimal search need?',
     E'You search an unstructured space of N = 16 items (4 qubits) for a single marked item using Grover''s algorithm.\n\nHow many Grover iterations maximize the probability of measuring the marked item? Use the standard estimate ⌊(π/4)·√N⌋.\n\nSubmit the integer, for example qctf{5}.',
     'hard', 150, ARRAY['grover', 'search'], 'practice',
     '11f0d218939a9d4e77121db6e77a68e41585b43e1ac90c89f229b3b5edaece39', 40),
    ('PRV-QC-01', 'q-chemistry', 'Count the Qubits',
     'Map the smallest molecule onto a register.',
     E'The H₂ molecule in the minimal STO-3G basis has two spatial orbitals. Each spatial orbital holds two spin orbitals.\n\nUnder the Jordan-Wigner mapping, one qubit represents one spin orbital. How many qubits does the full H₂ / STO-3G Hamiltonian need, before any symmetry reduction?\n\nSubmit the integer, for example qctf{6}.',
     'easy', 50, ARRAY['h2', 'jordan-wigner'], 'practice',
     '672e4162f917010398f37947857ba659ff057c18018ccdea35f102b4ac0c4b27', 50),
    ('PRV-QS-01', 'quantum-simulation', 'Half a Rotation',
     'Evolve one qubit and predict the measurement.',
     E'A qubit starts in |0⟩ and is rotated by RX(π/2).\n\nWhat is the probability of measuring |1⟩ afterwards?\n\nSubmit the probability as a decimal, for example qctf{0.75}.',
     'easy', 50, ARRAY['evolution', 'single-qubit'], 'practice',
     'c8dcf3c1a93f85e2c8969c36825d4b81ef362656c1738d93d1f22c0d60cf4b7b', 60)
ON CONFLICT (id) DO NOTHING;
