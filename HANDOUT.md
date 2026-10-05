# Handout: Evolution von Vibe Coding zu Agentic Engineering

**Status:** Analyse, Evaluation & Konzeption  
**Projekt:** Universal Agent Setup (`@universal/agent-setup`)  
**Format:** AIC (Analysis, Interpretation, Conclusion)

---

## Executive Summary (TL;DR)

Der bestehende Vibe-Coding-Skill enthält bereits wesentliche Kontrollstrukturen (Phase Gates, DoD, Schema-First, Sparring), leidet jedoch unter dem irreführenden Namen („Vibe Coding“ suggeriert unkontrolliertes Prompt-and-Pray) und Lücken bei agentischen SOTA-Mustern (Dual-Loop Execution, deterministische Test-Gating-Loops, Anti-Thrashing Circuit Breakers, Spec-Driven Development). Die empfohlene Evolution ist **Agentic Engineering** als orchestrierende Master-Direktive.

---

## 1. Analysis (Ist-Zustand & SOTA-Recherche)

### A. Befund im Bestand (`vibe-coding.skill` & `core-vibe-coding`)

- **Dualität im Bestand:**
  1. `/home/torsten/vibe-coding.skill` (ZIP-Paket): Umfassende Master-Direktive (Behavioral Baseline, Execution Workflow, Architecture, Semantic Triggers, Project Bootstrapping).
  2. `~/.gemini/skills/core-vibe-coding/SKILL.md`: Gekürzte Variante (Modes, Gates, DoD, State Handoffs, KISS/DRY, AbsProduct).
- **Bereits vorhandene agentische Mechanismen:**
  - **Mode Separation:** Harte Trennung zwischen `ANALYSIS MODE` (Read-Only) und `EXECUTION MODE` (Mutierend).
  - **Phase Gates & DoD:** Explizite Stopp-Punkte mit `GO PHASE Y` und vorheriger Deklaration von Akzeptanzkriterien.
  - **Context Management:** Extractive Compression (`.agents/artifacts/` für Filter-Skripte) und Session Handoffs (`SESSION_STATE.md`).
  - **Architektur-Schranken:** Schema-First (Zod/DTOs), AbsProduct (Plugin-Modulatität statt Core-Hacking), ECS-Trennung (State vs. Logic).
- **Identifizierte Defizite / „Vibe“-Altlasten:**
  - **Semantischer Widerspruch:** „Vibe Coding“ (nach Karpathy: intuitives Wegwerf-Prompting ohne Code-Verständnis) steht diametral zu den geforderten strikten Architektur- und Typ-Garantien.
  - **Fehlende autonome Regelkreise (Inner Loop):** Außer dem Stopp nach Phasen fehlen Handlungsanweisungen, wie der Agent _innerhalb_ einer Phase autonom vorgeht (TDD-Loop, Selbstkorrektur, Abbruchbedingungen).
  - **Redundanz im Skill-Ökosystem:** Überschneidung mit modularen Skills (`core-technical-standards`, `core-code-craft`, `core-testing-strategies`, `core-project-workflows`).

### B. SOTA-Methodiken im Agentic Software Engineering (ASE / 2025–2026)

- **Dual-Loop Execution:**
  - _Outer Loop (Human Architect / Orchestrator):_ Architekt definiert Specs, setzt Phase Gates, steuert Richtungsentscheidungen.
  - _Inner Loop (Autonomous Agent Execution):_ Agent operiert autonom in einer `Plan -> Test/Reproduce -> Act -> Validate -> Self-Correct`-Schleife.
- **Spec-Driven Development (SDD):** Versionierte Spezifikationen und Schnittstellenverträge im Repository (`AGENTS.md`, OpenAPI, Zod) als Single Source of Truth vor jeglicher Code-Generierung.
- **Deterministic Validation Gates:** Trennung von probabilistischer LLM-Generierung und deterministischer Validierung. Kein Task gilt als abgeschlossen ohne grünen Exit-Code aus Typprüfung (`tsc`), Linter und Testrunner.
- **Anti-Thrashing / Circuit Breakers:** Erkennung von Korrekturschleifen. Wenn ein Agent nach 3 Iterationen denselben Fehler nicht behebt, greift ein Circuit Breaker (Hypothesen-Reset, Backtracking oder Eskalation an den Architekten) statt blindem Weitermachen.
- **Sub-Agent Orchestration & Context Budgeting:** Delegation von isolierten Tasks (Deep Research, High-Output Shell-Commands, Codebase Mapping) an spezialisierte Sub-Agenten zur Vermeidung von Degradation des Haupt-Context-Windows.

---

## 2. Interpretation (Bewertung & Namensgebung)

### A. Naming: „Agentic Engineering“ vs. „Agentic Coding“

| Kriterium             | Agentic Coding                                            | Agentic Engineering                                            |
| :-------------------- | :-------------------------------------------------------- | :------------------------------------------------------------- |
| **Scope**             | Code-Ebene, Syntaxtransformation, Pair-Programming-Ersatz | Gesamter Software-Lifecycle (Systemdesign, CI/CD, Governance)  |
| **Methodik**          | Task-orientierte Codeerzeugung                            | Contract-First, Test-Driven Agency, Deterministische Schranken |
| **Passung zum Setup** | Zu eng gefasst                                            | **Optimal:** Deckt AbsProduct, Schema-First, State Handoffs ab |

- **Entscheidung:** Die im System verankerten Prinzipien sind genuines **Engineering**. Der Skill sollte zwingend **`agentic-engineering`** (bzw. `core-agentic-engineering`) heißen.

### B. Rolle im Skill-Gefüge (Meta-Orchestrator)

Der neue Skill sollte nicht die detaillierten Regeln von `core-technical-standards` oder `core-testing-strategies` duplizieren, sondern als **Meta-Orchestrator** fungieren:

1. **Orchestrierungs-Framework:** Definiert das Protokoll der Zusammenarbeit (Outer Loop vs. Inner Loop).
2. **Autonomous Execution Protocol:** Regelt, wie der Agent innerhalb einer Phase agiert (Plan -> Test -> Patch -> Validate -> Gate).
3. **Circuit Breaker & Guardrails:** Verhindert Halluzinationen, Endlosschleifen und unvalidierte Übergaben.

---

## 3. Conclusion (Konkrete Empfehlungen & Blueprint)

### A. Empfohlene Struktur für `core-agentic-engineering`

#### I. The Dual-Loop Governance

- **Outer Loop (Architect Control):** Phase Gates, DoD, Architekturentscheidungen, Stop-and-Wait für `GO PHASE Y`.
- **Inner Loop (Autonomous Execution):** Autonome Test-Implementierung, iterative Korrektur und deterministische Validierung ohne Zwischenfragen bei Routine-Schritten.

#### II. Specification & Verification Gates (Deterministic Guardrails)

- **Spec-First / Contract-Driven:** Vor Code zwingend Typen/Zod/Interfaces festzurren.
- **Verification-First:** Kein Merge/Phase-Abschluss ohne echten Shell-Befehl (Compiler, Tests, Linter). „It should work“ ist verboten; nur verifizierte Exit-Codes zählen.

#### III. Anti-Thrashing & Circuit Breaker

- **3-Strike Rule:** Nach 3 fehlgeschlagenen Korrekturversuchen für denselben Fehler: Sofortiger Stopp, Annahmen auflisten, alternativen Architekturansatz vorschlagen oder Rücksprache halten.
- **Fail-Fast on Drift:** Automatische Bereinigung bei thematischem Drift oder repetitiven Erklärungen.

#### IV. Context & Multi-Agent Allocation

- **Extractive Compression:** Weiterhin primär Log-Filterung und Artefakt-Auslagerung.
- **Strategic Delegation:** Batch-Operationen (>3 Dateien) oder High-Output-Recherchen an Subagenten (`codebase_investigator`, `generalist`) auslagern, um den Main-Loop schlank zu halten.

#### V. Architectural Baselines (High-Level Leitplanken)

- KISS > DRY, AbsProduct-Modulatität, ECS/Data-Logic-Separation (Detailregeln verbleiben in `core-technical-standards` und `core-code-craft`).

### B. Nächste Schritte

1. **Entscheidung:** Bestätigung des Namens (`agentic-engineering` vs. `agentic-coding`) und des Scopes (Meta-Orchestrator).
2. **Drafting:** Entwurf der neuen `SKILL.md` (als Markdown-Vorschlag im Chat, vor jedem Schreibzugriff).
3. **Migration & Konsolidierung:** Ablösung von `vibe-coding.skill` und Aktualisierung von `~/.gemini/skills/core-vibe-coding/SKILL.md` sowie der Modul-Dokumentation im Setup-Repo.
