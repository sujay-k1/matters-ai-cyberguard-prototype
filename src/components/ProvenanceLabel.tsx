import { AILabel, AILabelContent, Tag } from '@carbon/react';
import type { ContentProvenance } from '../types/ai';

interface ProvenanceLabelProps {
  provenance: ContentProvenance;
  textLabel?: string;
  description?: string;
  compact?: boolean;
}

export function ProvenanceLabel({
  provenance,
  textLabel,
  description,
  compact = false,
}: ProvenanceLabelProps) {
  if (provenance === 'AI') {
    return (
      <span className={`cg-provenance-label cg-provenance-label--ai${compact ? ' is-compact' : ''}`}>
        <AILabel
          kind="inline"
          size="sm"
          textLabel={textLabel ?? 'AI'}
          aria-label={textLabel ?? 'AI-generated content'}
          AILabelContent={
            description ? <AILabelContent>{description}</AILabelContent> : undefined
          }
        />
      </span>
    );
  }

  return (
    <span className={`cg-provenance-label cg-provenance-label--${normalizeProvenanceClass(provenance)}${compact ? ' is-compact' : ''}`}>
      <Tag type={tagTypeForProvenance(provenance)}>{textLabel ?? defaultLabel(provenance)}</Tag>
      {description ? <span className="cg-provenance-label__description">{description}</span> : null}
    </span>
  );
}

function normalizeProvenanceClass(provenance: ContentProvenance) {
  return provenance.toLowerCase().replace(/[^a-z]+/g, '-');
}

function defaultLabel(provenance: ContentProvenance) {
  if (provenance === 'System-derived') return 'System-derived';
  if (provenance === 'Normalized evidence') return 'Normalized evidence';
  if (provenance === 'Raw evidence') return 'Raw source record';
  if (provenance === 'Analyst-authored') return 'Analyst-authored';
  if (provenance === 'AI-assisted') return 'AI-assisted draft';
  return 'AI-assisted · edited';
}

function tagTypeForProvenance(provenance: ContentProvenance) {
  if (provenance === 'System-derived') return 'cool-gray';
  if (provenance === 'Normalized evidence') return 'gray';
  if (provenance === 'Raw evidence') return 'red';
  if (provenance === 'Analyst-authored') return 'blue';
  return 'purple';
}
