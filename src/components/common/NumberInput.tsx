import React from 'react';
import { FieldTooltip } from './FieldTooltip';
import { AlertCircle } from 'lucide-react';

interface NumberInputProps {
  id: string;
  label: string;
  unit: string;
  value: number | '';
  onChange: (value: number | '') => void;
  tooltipText?: string;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  id,
  label,
  unit,
  value,
  onChange,
  tooltipText,
  helperText,
  min = 0,
  max,
  step = 1,
  placeholder = 'e.g. 5000',
  required = false,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.trim();
    if (rawVal === '') {
      onChange('');
      return;
    }

    const numVal = Number(rawVal);
    if (!isNaN(numVal)) {
      onChange(numVal);
    }
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label htmlFor={id} className="form-label">
          <span>{label}</span>
          {required && <span style={{ color: 'var(--status-danger-text)' }} aria-hidden="true">*</span>}
          {tooltipText && <FieldTooltip content={tooltipText} id={`${id}-tip`} />}
        </label>
      </div>

      <div className="input-affix-wrapper">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`form-input mono ${error ? 'has-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
          required={required}
          style={{ paddingRight: `${unit.length * 10 + 20}px` }}
        />
        <span className="input-suffix" aria-hidden="true">
          {unit}
        </span>
      </div>

      {error ? (
        <span id={`${id}-error`} className="form-error" role="alert">
          <AlertCircle size={13} />
          {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-help`} className="form-help">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
