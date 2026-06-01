import { AILabel, AILabelContent, TextArea } from '@carbon/react';
import { useMemo, useRef, useState } from 'react';
import type { DraftProvenance } from '../types/ai';

interface AISuggestedTextAreaProps {
  id: string;
  labelText: string;
  value: string;
  placeholder: string;
  aiSuggestion?: string;
  rows?: number;
  readOnly?: boolean;
  disabled?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
  onProvenanceChange?: (provenance: DraftProvenance) => void;
}

export function AISuggestedTextArea({
  id,
  labelText,
  value,
  placeholder,
  aiSuggestion,
  rows = 4,
  readOnly,
  disabled,
  helperText,
  onChange,
  onProvenanceChange,
}: AISuggestedTextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const acceptedSuggestionRef = useRef<string | null>(null);
  const suggestionVisible = Boolean(isFocused && !value && aiSuggestion && !dismissed && !disabled && !readOnly);
  const visiblePlaceholder = suggestionVisible ? aiSuggestion ?? placeholder : placeholder;
  const describedBy = useMemo(() => {
    const ids = [];
    if (helperText) ids.push(`${id}-helper`);
    if (suggestionVisible) ids.push(`${id}-ai-hint`);
    return ids.join(' ') || undefined;
  }, [helperText, id, suggestionVisible]);

  return (
    <div className={`cg-ai-suggested-field${isFocused ? ' is-focused' : ''}${suggestionVisible ? ' has-suggestion' : ''}`}>
      <TextArea
        id={id}
        labelText={labelText}
        rows={rows}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={visiblePlaceholder}
        value={value}
        aria-describedby={describedBy}
        onFocus={() => {
          setIsFocused(true);
          setDismissed(false);
        }}
        onBlur={() => {
          setIsFocused(false);
          setDismissed(false);
          if (!value) {
            acceptedSuggestionRef.current = null;
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && suggestionVisible) {
            event.preventDefault();
            setDismissed(true);
            return;
          }
          if (event.key === 'Tab' && suggestionVisible) {
            event.preventDefault();
            acceptedSuggestionRef.current = aiSuggestion ?? null;
            onChange(aiSuggestion ?? '');
            onProvenanceChange?.('AI-assisted');
          }
        }}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          const priorValue = value;
          onChange(nextValue);
          if (!nextValue) {
            acceptedSuggestionRef.current = null;
            setDismissed(false);
            return;
          }
          if (acceptedSuggestionRef.current) {
            if (nextValue !== acceptedSuggestionRef.current) {
              onProvenanceChange?.('AI-assisted-edited');
            } else if (!priorValue) {
              onProvenanceChange?.('AI-assisted');
            }
            return;
          }
          if (!priorValue) {
            onProvenanceChange?.('Analyst-authored');
          }
        }}
      />
      {helperText ? (
        <p id={`${id}-helper`} className="cds--form__helper-text">
          {helperText}
        </p>
      ) : null}
      {suggestionVisible ? (
        <div id={`${id}-ai-hint`} className="cg-ai-suggested-field__hint">
          <AILabel
            kind="inline"
            size="sm"
            textLabel="Suggestion available"
            aria-label="AI suggestion available"
            AILabelContent={<AILabelContent>Press Tab to accept this deterministic AI draft suggestion.</AILabelContent>}
          />
          <span>Tab to accept</span>
        </div>
      ) : null}
    </div>
  );
}
