import * as stylex from '@stylexjs/stylex';
import { Fragment, useState } from 'react';
import { Button, Card, Chip, Density, Dropdown, Text } from '../src/index.js';
// Same shared native-checkbox treatment ListReport.tsx's row-selection column and Settings.tsx's
// Modules toggles already use — see examples/checkboxStyles.ts for the full history.
import { checkboxStyles } from './checkboxStyles.js';

const ROLE_ITEMS = ['Manager', 'Finance', 'Director'];
const ESCALATE_ITEMS = ['12 hours', '24 hours', '48 hours'];
const TEMPLATE_ITEMS = ['Standard approval request', 'Urgent approval request', 'Custom'];

// Reuses RolePage.tsx's own team/delegation names (Jordan Lee/Priya Shah) — the same shared
// personas other example pages already established, rather than inventing new ones.
const APPROVERS_IN_SEQUENCE = ['Jordan Lee', 'Priya Shah'];

type WorkflowStepKind = 'TRIGGER' | 'CONDITION' | 'APPROVAL' | 'ACTION';

type ConditionBranch = { label: string; detail: string };

type WorkflowStep = {
  id: string;
  kind: WorkflowStepKind;
  title: string;
  detail?: string;
  branches?: ConditionBranch[];
  chain?: string[];
  actions?: string[];
};

// The full sequence a real diagram would draw as a branching graph (the CONDITION step's "Yes"/
// "No" paths rejoin at different ACTION steps), rendered here as one static vertical list per this
// milestone's structural-first-pass scope — the branching CONCEPT is shown as text (each path's
// label plus where it leads), not real branching/connector UI. See the file header comment below
// for the full reasoning.
const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'trigger',
    kind: 'TRIGGER',
    title: 'Sales order submitted',
    detail: 'Runs whenever a sales order is created or resubmitted.',
  },
  {
    id: 'condition',
    kind: 'CONDITION',
    title: 'Total > 10,000?',
    branches: [
      { label: 'Yes', detail: 'Continue to approval' },
      { label: 'No', detail: 'Skip to auto-confirm' },
    ],
  },
  {
    id: 'approval',
    kind: 'APPROVAL',
    title: 'Manager → Finance',
    detail: 'Sequential approval chain — each approver must act before the next is notified.',
    chain: ['Manager', 'Finance'],
  },
  {
    id: 'action-notify',
    kind: 'ACTION',
    title: 'Set status & notify',
    actions: ['Set status → Approved', 'Notify → Requester'],
  },
  {
    id: 'action-auto-confirm',
    kind: 'ACTION',
    title: 'Auto-confirm',
    detail: 'Runs instead of the approval chain when the total is 10,000 or under.',
  },
];

const styles = stylex.create({
  // Same "thin div between cards" spine Delivery.tsx's TrackingTimeline draws between tracking
  // steps, centered under each Card rather than aligned to a left-hand dot column — a step here
  // is a full Card, not a compact list row, so a plain centered line reads as the connector
  // without needing the dot glyph that timeline uses to mark done/current state (these steps have
  // no such state to distinguish).
  connector: {
    width: '2px',
    height: '24px',
    marginInline: 'auto',
    backgroundColor: '#cbd5e1',
  },
});

/**
 * A vertical connector line between two adjacent step Cards — a locally-scoped `<div>`, not a new
 * package export, same precedent as Delivery.tsx's `TrackingTimeline` spine (see that file for the
 * full reasoning: a single consumer doesn't earn a shared component per AGENTS.md).
 */
function StepConnector() {
  return <div aria-hidden="true" {...stylex.props(styles.connector)} />;
}

/**
 * One step in the workflow's vertical sequence: an overline kind label, a title, and
 * kind-specific body content (a plain detail line, the condition's two branch paths, the
 * approval's sequential chain, or the action's bullet list).
 */
function WorkflowStepCard({ step }: { step: WorkflowStep }) {
  return (
    <Card>
      <Text variant="overline">{step.kind}</Text>
      <Text variant="title">{step.title}</Text>
      {step.detail && <Text variant="body">{step.detail}</Text>}
      {step.branches && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {step.branches.map((branch) => (
            <div
              key={branch.label}
              style={{
                flex: '1 1 160px',
                minWidth: 140,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Text variant="caption" as="span">
                {branch.label}
              </Text>
              <Text variant="body">{branch.detail}</Text>
            </div>
          ))}
        </div>
      )}
      {step.chain && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {step.chain.map((name, index) => (
            <Fragment key={name}>
              {index > 0 && (
                <span aria-hidden="true" style={{ color: '#94a3b8' }}>
                  →
                </span>
              )}
              <Chip variant="status" tone="neutral">
                {name}
              </Chip>
            </Fragment>
          ))}
        </div>
      )}
      {step.actions && (
        <ul style={{ margin: 0, paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {step.actions.map((action) => (
            <li key={action}>
              <Text variant="body" as="span">
                {action}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/**
 * A workflow's vertical step sequence, plus a static "Approval step config" side panel. Mirrors
 * `templates/erp-skeleton`'s "24 Builder (workflow)" screen (Claude Design project "Busy Office
 * Design System"): a header (workflow name, an Active status `Chip`, and Test run/Run log/Save
 * actions), a vertical step flow — TRIGGER → CONDITION → APPROVAL → two ACTION steps → a "+"
 * add-step control — and a side panel configuring the APPROVAL step specifically. Meant to render
 * as `AppShell`'s content for module="Builder", route "Workflows" (see AppShell.tsx's
 * `NAV.Builder`, which already lists "Workflows" as a sibling of "Pages"/"Forms"/"Fields"/
 * "Publish").
 *
 * Per this milestone's structural-first-pass scope (ROADMAP M6, issue #17: no real diagram/canvas
 * library, no drag-and-drop), the reference's node-and-edge builder canvas is rebuilt as a plain
 * vertical list of `Card`s — same static-non-drag treatment as every other batch-4 screen. Each
 * step is connected to the next by a thin centered `<div>` line (`StepConnector` below), the same
 * locally-scoped-styling precedent as Delivery.tsx's `TrackingTimeline` spine — a single consumer,
 * so no new shared component (AGENTS.md: no prop/export with a single caller). The CONDITION
 * step's "Yes"/"No" branches and the ACTION steps that follow are rendered as plain sequential
 * text describing where each path leads, not real branching/routing UI — the branching CONCEPT is
 * shown, not built (see `WORKFLOW_STEPS`'s own comment). The trailing "+" control is a static
 * ghost `Button` with no add-step logic behind it, same judgment as every other static action
 * control this batch (e.g. Settings.tsx's "Upload logo").
 *
 * The side panel configures only the APPROVAL step, per the content spec — reusing RolePage.tsx's
 * own "Jordan Lee"/"Priya Shah" personas for "Approvers in sequence" rather than inventing new
 * ones. "Allow delegation"/"Comment required" reuse examples/checkboxStyles.ts's shared native
 * checkbox treatment, each wrapped in a `<label>` (same pattern as Settings.tsx's Modules toggle
 * rows) so the visible text is the checkbox's accessible name for free. "Role"/"Escalate after"/
 * "Notification template" are real `Dropdown` value pickers, not filters, so each passes
 * `active={false}` — same reasoning as Settings.tsx's Locale & currency section (a required field
 * always has exactly one item selected, so the `items.some(selected)` fallback would permanently
 * fill the trigger; see that file for the full explanation).
 */
export function BuilderWorkflow() {
  const [role, setRole] = useState(ROLE_ITEMS[0]);
  const [escalateAfter, setEscalateAfter] = useState(ESCALATE_ITEMS[1]);
  const [notificationTemplate, setNotificationTemplate] = useState(TEMPLATE_ITEMS[0]);
  const [allowDelegation, setAllowDelegation] = useState(true);
  const [commentRequired, setCommentRequired] = useState(false);

  return (
    <div
      style={{
        background: '#f8fafc',
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        // Matches ListReport.tsx/RecordDetail.tsx/Dashboard.tsx/RolePage.tsx/Settings.tsx's shared
        // 24px content padding / border-box frame (see RecordDetail.tsx for the full box-sizing
        // reasoning).
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* `margin: 0`, not `'0 auto'` — left-aligns, matching every other sample page's content
          frame. `maxWidth: 1120` matches RolePage.tsx/Dashboard.tsx/AdminOverview.tsx — the other
          pages whose content is wider than a single form column. */}
      <div style={{ maxWidth: 1120, margin: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Density value="compact">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text variant="heading">SO approval &gt; 10k</Text>
            <Chip variant="status" tone="strong">
              Active
            </Chip>
            <div style={{ flex: 1 }} />
            <Button variant="secondary">Test run</Button>
            <Button variant="ghost">Run log</Button>
            <Button variant="primary">Save</Button>
          </div>
        </Density>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 480px', minWidth: 320 }}>
            <ol aria-label="Workflow steps" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {WORKFLOW_STEPS.map((step) => (
                <li key={step.id}>
                  <WorkflowStepCard step={step} />
                  <StepConnector />
                </li>
              ))}
              <li>
                <Density value="compact">
                  <Button type="button" variant="ghost" style={{ width: '100%', justifyContent: 'center' }}>
                    + Add step
                  </Button>
                </Density>
              </li>
            </ol>
          </div>

          <div style={{ flex: '1 1 280px', minWidth: 260 }}>
            <Card>
              <Text variant="title">Approval step config</Text>
              <Text variant="caption">Configures the APPROVAL step — Manager → Finance.</Text>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant="caption" as="span">
                  Approvers in sequence
                </Text>
                <ol style={{ margin: 0, paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {APPROVERS_IN_SEQUENCE.map((name) => (
                    <li key={name}>
                      <Text variant="body" as="span">
                        {name}
                      </Text>
                    </li>
                  ))}
                </ol>
              </div>

              <Dropdown
                label={`Role · ${role}`}
                items={ROLE_ITEMS.map((label) => ({ label, selected: label === role }))}
                onSelect={setRole}
                active={false}
              />

              <Dropdown
                label={`Escalate after · ${escalateAfter}`}
                items={ESCALATE_ITEMS.map((label) => ({ label, selected: label === escalateAfter }))}
                onSelect={setEscalateAfter}
                active={false}
              />

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text variant="body">Allow delegation</Text>
                <input
                  type="checkbox"
                  checked={allowDelegation}
                  onChange={() => setAllowDelegation((prev) => !prev)}
                  {...stylex.props(checkboxStyles.checkbox)}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text variant="body">Comment required</Text>
                <input
                  type="checkbox"
                  checked={commentRequired}
                  onChange={() => setCommentRequired((prev) => !prev)}
                  {...stylex.props(checkboxStyles.checkbox)}
                />
              </label>

              <Dropdown
                label={`Notification template · ${notificationTemplate}`}
                items={TEMPLATE_ITEMS.map((label) => ({ label, selected: label === notificationTemplate }))}
                onSelect={setNotificationTemplate}
                active={false}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
