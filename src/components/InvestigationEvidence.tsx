import { Button, Tag, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@carbon/react';
import type { EvidenceItem, IncludedAlertItem } from '../types/investigation';

interface InvestigationEvidenceProps {
  alerts: IncludedAlertItem[];
  evidence: EvidenceItem[];
  onOpenAlert: (id: string) => void;
  onOpenEvidence: (id: string) => void;
  onUpdateAlertRelevance: (id: string, next: IncludedAlertItem['relevance']) => void;
  onUpdateEvidenceVerdict: (id: string, next: EvidenceItem['verdict']) => void;
  onToggleEvidenceAttached: (id: string) => void;
  onAddNote: () => void;
}

export function InvestigationEvidence({
  alerts,
  evidence,
  onOpenAlert,
  onOpenEvidence,
  onUpdateAlertRelevance,
  onUpdateEvidenceVerdict,
  onToggleEvidenceAttached,
  onAddNote,
}: InvestigationEvidenceProps) {
  return (
    <div className="cg-investigation-tab-stack">
      <section className="cg-investigation-pane">
        <div className="cg-investigation-pane__header">
          <h3>Included alerts</h3>
        </div>
        <div className="cg-investigation-card-list">
          {alerts.map((alert) => (
            <article key={alert.id} className="cg-investigation-card">
              <div className="cg-investigation-card__header">
                <div>
                  <Tag type={severityTagType(alert.severity)}>{alert.severity}</Tag>
                  <h4>{alert.id}</h4>
                </div>
                <Tag type={relevanceTagType(alert.relevance)}>{alert.relevance}</Tag>
              </div>
              <p>{alert.title}</p>
              <div className="cg-investigation-definition-list">
                <div>
                  <dt>Detection source</dt>
                  <dd>{alert.detectionSource}</dd>
                </div>
                <div>
                  <dt>System</dt>
                  <dd>{alert.system}</dd>
                </div>
                <div>
                  <dt>Linked events</dt>
                  <dd>{String(alert.linkedEventsCount)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{alert.status}</dd>
                </div>
              </div>
              <div className="cg-investigation-ai-insight">
                <p>{alert.linkingRationale}</p>
              </div>
              <div className="cg-investigation-action-row">
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() =>
                    onUpdateAlertRelevance(
                      alert.id,
                      alert.relevance === 'Relevant' ? 'Irrelevant' : 'Relevant',
                    )
                  }>
                  {alert.relevance === 'Relevant' ? 'Mark irrelevant' : 'Mark relevant'}
                </Button>
                <Button kind="ghost" size="sm" onClick={onAddNote}>
                  Add note
                </Button>
                <Button kind="ghost" size="sm" onClick={() => onOpenAlert(alert.id)}>
                  Open alert details
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cg-investigation-pane">
        <h3>Evidence items</h3>
        <div className="cg-investigation-table-shell">
          <Table size="sm" useZebraStyles={false}>
            <TableHead>
              <TableRow>
                <TableHeader>Evidence ID</TableHeader>
                <TableHeader>Event type</TableHeader>
                <TableHeader>Timestamp</TableHeader>
                <TableHeader>Source system</TableHeader>
                <TableHeader>Entity</TableHeader>
                <TableHeader>Verdict</TableHeader>
                <TableHeader>Attached</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {evidence.map((entry) => (
                <TableRow key={entry.id} onClick={() => onOpenEvidence(entry.id)} className="cg-investigation-table-row">
                  <TableCell>{entry.id}</TableCell>
                  <TableCell>{entry.eventType}</TableCell>
                  <TableCell>{entry.timestamp}</TableCell>
                  <TableCell>{entry.sourceSystem}</TableCell>
                  <TableCell>{entry.entity}</TableCell>
                  <TableCell>
                    <Tag type={relevanceTagType(entry.verdict)}>{entry.verdict}</Tag>
                  </TableCell>
                  <TableCell>{entry.attached ? 'Attached' : 'Detached'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="cg-investigation-action-row">
          <Button kind="ghost" size="sm" onClick={onAddNote}>
            Add note
          </Button>
          {evidence[0] ? (
            <>
              <Button
                kind="ghost"
                size="sm"
                onClick={() =>
                  onUpdateEvidenceVerdict(
                    evidence[0].id,
                    evidence[0].verdict === 'Relevant' ? 'Irrelevant' : 'Relevant',
                  )
                }>
                {evidence[0].verdict === 'Relevant' ? 'Mark irrelevant' : 'Mark relevant'}
              </Button>
              <Button kind="ghost" size="sm" onClick={() => onToggleEvidenceAttached(evidence[0].id)}>
                {evidence[0].attached ? 'Detach from case' : 'Attach to case'}
              </Button>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function severityTagType(severity: string) {
  if (severity === 'Critical') return 'red';
  if (severity === 'High') return 'magenta';
  if (severity === 'Medium') return 'blue';
  return 'gray';
}

function relevanceTagType(relevance: IncludedAlertItem['relevance'] | EvidenceItem['verdict']) {
  if (relevance === 'Relevant') return 'green';
  if (relevance === 'Irrelevant') return 'cool-gray';
  return 'blue';
}
