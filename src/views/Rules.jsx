// Rules engine — dedicated tab for authoring, tuning and
// weighting the routing rules the agent uses.

import React from 'react';
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Icon,
  Modal,
  SectionHead,
  Segmented,
  Toggle,
  cx,
  useState,
} from '../ui.jsx';
import { useFactory } from '../state.jsx';

// -----------------------------------------------------------------------
// New rule modal
// -----------------------------------------------------------------------
function NewRuleModal({ open, onClose, onCreate, variants }) {
  const [signalType, setSignalType] = useState('device');
  const [signalValue, setSignalValue] = useState('Mobile');
  const [targetVariant, setTargetVariant] = useState(variants[0]?.id || '');
  const [weight, setWeight] = useState(0.6);

  const signals = {
    device: ['Mobile', 'Desktop'],
    channel: ['Paid Social', 'Organic Search', 'Email', 'Referral', 'TikTok'],
    session: ['First-time', 'Returning', 'Lapsed client', 'Power user'],
    intent: ['Uncertain about style', 'Fashion-forward', 'Budget-conscious'],
  };

  function create() {
    const targetName = variants.find((v) => v.id === targetVariant)?.name || 'variant';
    onCreate({
      when: `${signalType === 'device' ? 'Device' : signalType === 'channel' ? 'Channel' : signalType === 'session' ? 'Session' : 'Intent'} is ${signalValue}`,
      then: `Route to ${targetName}`,
      weight,
    });
    onClose();
    // reset for next time
    setSignalType('device');
    setSignalValue('Mobile');
    setWeight(0.6);
  }

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-[560px]">
      <div className="p-8">
        <Eyebrow className="text-lime-700">Author a rule</Eyebrow>
        <h2 className="type-headline-md text-navy mt-2 mb-6">New routing rule</h2>

        <div className="space-y-5">
          <div>
            <Eyebrow className="mb-2">Trigger type</Eyebrow>
            <Segmented
              value={signalType}
              onChange={(t) => {
                setSignalType(t);
                setSignalValue(signals[t][0]);
              }}
              options={[
                { value: 'device', label: 'Device' },
                { value: 'channel', label: 'Channel' },
                { value: 'session', label: 'Session' },
                { value: 'intent', label: 'Intent' },
              ]}
            />
          </div>

          <div>
            <Eyebrow className="mb-2">When value equals</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {signals[signalType].map((v) => (
                <button
                  key={v}
                  onClick={() => setSignalValue(v)}
                  className={cx(
                    'px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.08em] font-bold border transition-colors',
                    signalValue === v
                      ? 'bg-teal text-navy border-teal'
                      : 'bg-surface-lowest text-ink-soft border-outline-variant hover:border-navy',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow className="mb-2">Route to</Eyebrow>
            <div className="grid grid-cols-2 gap-1.5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setTargetVariant(v.id)}
                  className={cx(
                    'flex items-center gap-2 px-3 py-2 rounded border text-left transition-colors',
                    targetVariant === v.id
                      ? 'border-teal bg-teal/15'
                      : 'border-outline-variant bg-surface-lowest hover:border-navy',
                  )}
                >
                  <span className={cx('w-5 h-6 rounded-sm ph-tex flex-shrink-0', v.thumb)} />
                  <span className="text-[12px] text-navy font-semibold truncate">{v.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Eyebrow>Weight</Eyebrow>
              <span className="text-[13px] text-navy font-bold tabular-nums">
                {weight.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full accent-teal-500"
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-7">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={create}>
            <Icon name="plus" /> Create rule
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// -----------------------------------------------------------------------
// Single rule row
// -----------------------------------------------------------------------
function RuleRow({ rule, onToggle, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="py-5 grid grid-cols-[auto_1fr_160px_auto] gap-5 items-start">
      <div className="pt-1">
        <Toggle on={rule.status === 'on'} onChange={() => onToggle(rule.id)} />
      </div>
      <div className="min-w-0">
        <Eyebrow>when</Eyebrow>
        <div className="type-body-md text-navy mt-1 leading-snug">{rule.when}</div>
        <Eyebrow className="mt-3">then</Eyebrow>
        <div className="type-body-md text-navy mt-1 leading-snug">{rule.then}</div>
        <div className="mt-3 flex items-center gap-2">
          <Badge tone={rule.status === 'on' ? 'teal' : 'outline'}>
            {rule.status === 'on' ? 'Active' : 'Draft'}
          </Badge>
          <span className="text-[11px] text-ink-soft font-bold uppercase tracking-[0.08em]">
            id · {rule.id}
          </span>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Eyebrow>weight</Eyebrow>
          <span className="text-[13px] text-navy font-bold tabular-nums">
            {rule.weight.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={rule.weight}
          onChange={(e) => onUpdate(rule.id, { weight: parseFloat(e.target.value) })}
          className="w-full accent-teal-500"
          style={{ boxShadow: 'none' }}
        />
      </div>
      <div className="flex items-start gap-1">
        <button
          onClick={() => setEditing(!editing)}
          className="w-8 h-8 rounded border border-outline-variant text-ink-soft hover:border-navy hover:text-navy transition-colors flex items-center justify-center"
          aria-label="Edit rule"
          title="Edit"
        >
          <Icon name="drag" size={14} />
        </button>
        <button
          onClick={() => onRemove(rule.id)}
          className="w-8 h-8 rounded border border-outline-variant text-ink-soft hover:border-danger hover:text-danger transition-colors flex items-center justify-center"
          aria-label="Delete rule"
          title="Delete"
        >
          <Icon name="x" size={14} />
        </button>
      </div>
      {editing && (
        <div className="col-span-4 mt-2 p-4 rounded border border-outline-variant bg-surface-low space-y-3">
          <div>
            <Eyebrow className="mb-1">When (free text)</Eyebrow>
            <input
              value={rule.when}
              onChange={(e) => onUpdate(rule.id, { when: e.target.value })}
              className="w-full bg-surface-lowest border border-outline-variant rounded px-3 py-2 text-[13px]"
            />
          </div>
          <div>
            <Eyebrow className="mb-1">Then</Eyebrow>
            <input
              value={rule.then}
              onChange={(e) => onUpdate(rule.id, { then: e.target.value })}
              className="w-full bg-surface-lowest border border-outline-variant rounded px-3 py-2 text-[13px]"
            />
          </div>
        </div>
      )}
    </li>
  );
}

// -----------------------------------------------------------------------
// Principles side panel — decorative, explains the mental model
// -----------------------------------------------------------------------
function PrinciplesPanel({ rules }) {
  const onCount = rules.filter((r) => r.status === 'on').length;
  const avgWeight =
    rules.length === 0
      ? 0
      : (rules.reduce((s, r) => s + r.weight, 0) / rules.length).toFixed(2);
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <Eyebrow>At a glance</Eyebrow>
        <div className="mt-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-ink-soft">Total rules</span>
            <span className="text-[1.5rem] text-navy font-bold tabular-nums">
              {rules.length}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-ink-soft">Active</span>
            <span className="text-[1.5rem] text-teal-500 font-bold tabular-nums">
              {onCount}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-ink-soft">Avg weight</span>
            <span className="text-[1.5rem] text-navy font-bold tabular-nums">
              {avgWeight}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-teal border-teal">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded bg-navy text-white flex items-center justify-center">
            <Icon name="sparkle" size={14} />
          </div>
          <Eyebrow className="text-navy/80">Rulebook</Eyebrow>
        </div>
        <div className="space-y-3 text-[13.5px] text-navy leading-relaxed">
          <p>
            Rules don’t replace the agent — they <em>inform</em> it. The router
            blends rule weights with behavioral priors before routing.
          </p>
          <p>
            Prefer fewer, well-weighted rules. Conflicting high-weight rules
            cancel. Aim for clear signals with weights between 0.50 and 0.85.
          </p>
          <p>
            Draft rules won’t affect live traffic — use them to stage changes
            and preview the effect in Simulation.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <Eyebrow className="mb-3">Trigger taxonomy</Eyebrow>
        <ul className="space-y-2.5 text-[12px] text-ink-soft">
          <li>
            <span className="text-navy font-semibold">Device</span> — Mobile / Desktop / Tablet
          </li>
          <li>
            <span className="text-navy font-semibold">Channel</span> — Paid Social / Organic / Email / Referral
          </li>
          <li>
            <span className="text-navy font-semibold">Session</span> — First-time / Returning / Lapsed
          </li>
          <li>
            <span className="text-navy font-semibold">Intent</span> — Uncertain / Fashion-forward / Budget
          </li>
          <li>
            <span className="text-navy font-semibold">Behavior</span> — Dwell / scroll depth / tap velocity
          </li>
        </ul>
      </Card>
    </div>
  );
}

// -----------------------------------------------------------------------
// View
// -----------------------------------------------------------------------
export default function RulesView() {
  const { rules, variants, toggleRule, updateRule, addRule, removeRule } =
    useFactory();
  const [filter, setFilter] = useState('all');
  const [newOpen, setNewOpen] = useState(false);

  const filtered =
    filter === 'all'
      ? rules
      : filter === 'active'
        ? rules.filter((r) => r.status === 'on')
        : rules.filter((r) => r.status !== 'on');

  return (
    <div className="px-6 md:px-10 py-12 max-w-[1400px] mx-auto">
      <SectionHead
        eyebrow="Rules / engine"
        title="How the agent decides."
        sub="The router is agentic — it reads visitors, blends these rules, and picks the door most likely to land. Author, tune, toggle, retire."
        right={
          <Button variant="primary" onClick={() => setNewOpen(true)}>
            <Icon name="plus" /> New rule
          </Button>
        }
      />

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
            <div>
              <Eyebrow>Routing rules</Eyebrow>
              <div className="type-headline-md text-navy mt-2">The current rulebook</div>
            </div>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: `All (${rules.length})` },
                { value: 'active', label: `Active (${rules.filter((r) => r.status === 'on').length})` },
                { value: 'draft', label: `Draft (${rules.filter((r) => r.status !== 'on').length})` },
              ]}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Eyebrow className="text-ink-soft">No rules here</Eyebrow>
              <p className="type-body-md text-ink-soft mt-3 max-w-md mx-auto">
                {filter === 'draft'
                  ? 'Every rule is live. Draft rules stage changes before they hit traffic.'
                  : 'Start with a clear signal. Mobile + Paid Social → Swipe is a good first rule.'}
              </p>
              <div className="mt-5">
                <Button variant="primary" onClick={() => setNewOpen(true)}>
                  <Icon name="plus" /> Author first rule
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant px-6">
              {filtered.map((r) => (
                <RuleRow
                  key={r.id}
                  rule={r}
                  onToggle={toggleRule}
                  onUpdate={updateRule}
                  onRemove={removeRule}
                />
              ))}
            </ul>
          )}
        </Card>

        <PrinciplesPanel rules={rules} />
      </div>

      <div className="mt-16 pt-8 border-t border-outline-variant text-[11px] text-ink-soft font-bold uppercase tracking-[0.12em] flex items-center justify-between">
        <span>Dayone / Rules / v1.4</span>
        <span>Last edit · just now</span>
      </div>

      <NewRuleModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreate={addRule}
        variants={variants}
      />
    </div>
  );
}
