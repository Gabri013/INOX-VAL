/plan
You will act as the “release owner” to bring INOX-VAL to a REAL factory-ready state. Do not stop at partial improvements. The job is only considered done when all acceptance criteria below are met (100% functional).

READ FIRST:
	•	Read CONTEXT.md at repo root.
	•	Read firestore.rules and firestore.indexes.json. You MUST NOT modify firestore.rules.

HARD CONSTRAINTS (NON-NEGOTIABLE):
	1.	Multi-tenant is mandatory: every read/write/query MUST be scoped by empresaId. No cross-tenant access is allowed.
	2.	Production module is already operational and stable. DO NOT change its core flow/logic. Only allow minimal fixes for security, data integrity, or internal reliability WITHOUT altering the flow.
	3.	Do NOT modify Firestore rules. If a new collection/path is not covered by current rules, you must adapt to an allowed path or defer persistence (use read-only or local mock) until explicit approval later.
	4.	Work must be incremental, low-risk, small PRs. System must remain functional at every step.
	5.	No TypeScript build breaks. No runtime crashes. Handle permission-denied safely.

PRIMARY GOAL:
Make the entire ERP fully usable end-to-end in real factory operations. “Usable” means: all critical flows work, data persists correctly, UI updates correctly, no silent failures, no tenant leakage, and Production remains intact.

SCOPE (WHAT MUST BE VERIFIED AND FIXED):
A) AUTH & TENANT CONTEXT (empresaId)
	•	Login, logout, session persistence, reset password
	•	User profile loading and empresaId resolution
	•	All pages/services must fail safely if empresaId is missing (no unsafe global query)
	•	Permission-denied must show controlled UI state (no crash)

B) PRODUCTION (do not change flow)
Data model: ordens_producao/{ordemId}/items/{itemId} + movimentacoes
Must validate these 4 flows with evidence:
	1.	Order appears in Production screens (list/detail) and in Dashboard TV
	2.	Item moves across sectors (e.g., Corte → Dobra → Solda) and EACH transition creates a movimentacao
	3.	Concluding an item sets status correctly, locks invalid transitions, and UI remains consistent
	4.	Multi-tenant test: company A cannot access company B by listing or direct ID, and queries always include empresaId filter
Additionally:

	•	Check for race conditions / duplicate movimentacoes; if present, propose transaction-based minimal fix without changing flow.
	•	Ensure no collectionGroup query can leak without empresaId.

C) DASHBOARD TV
	•	Real-time updates or refresh strategy works
	•	Filters by empresaId always
	•	Works with empty state, loading state, errors
	•	Performance: avoid N+1 queries per setor if possible (but do not change business logic)

D) APONTAMENTO DE OP
	•	Create, edit, list apontamentos
	•	Correct linkage to ordens/items (no orphan)
	•	Multi-tenant enforced

E) ORÇAMENTOS
	•	Create, edit, list, persist
	•	Totals/fields persist, no silent failures
	•	React Query cache invalidation is correct (UI reflects changes after writes)

F) CALCULADORA ATUAL (BANCADAS)
	•	Main calculation flows run without runtime errors
	•	Input validation prevents crashes
	•	Outputs are consistent and usable (BOM/consumo when applicable)
	•	Must not break existing quotation/production linkage (if any)

G) GLOBAL QUALITY GATES
	•	Zero TypeScript errors (build passes)
	•	No console errors on normal flows
	•	All Firestore calls handled (loading/error)
	•	No unhandled promise rejections
	•	Minimal logging/audit for critical actions (if already exists, ensure it’s used consistently)

DELIVERABLES YOU MUST PRODUCE IN THIS /plan:
	1.	A full “Functional Audit Matrix” (module x flow) with status: PASS / FAIL / PARTIAL, including evidence: file paths, key functions, and what to click/test.
	2.	A prioritized backlog of issues with severity: BLOCKER / HIGH / MEDIUM / LOW, including root cause and exact files involved.
	3.	A sequence of small PRs to fix everything until 100%:
	•	Each PR must be low-risk, independent, and include:
	•	What changes
	•	Files touched
	•	How to verify (step-by-step)
	•	Rollback plan
	4.	A “Factory Acceptance Checklist” to run after the last PR, covering all critical flows again.
	5.	A list of multi-tenant leakage vectors found (e.g., missing empresaId filters, collectionGroup without filter, direct doc reads by ID), and how each will be eliminated without changing Firestore rules or Production flow.

IMPORTANT:
	•	Do not invent repo details. If you cannot confirm a path, state “to be located” and how to locate it.
	•	The plan must be concrete enough that we can execute PR by PR until everything is green.

After you return this /plan, I will run /code to implement PR1 (BLOCKER fixes first). Do not implement anything in this message.