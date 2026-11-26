import React, { useCallback, useLayoutEffect, useRef } from 'react';

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ minRows = 2, className = '', onChange, onInput, value, style, ...rest }, forwardedRef) => {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const assignRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  const syncHeight = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    syncHeight();
  }, [value, syncHeight]);

  return (
    <textarea
      ref={assignRef}
      rows={minRows}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        syncHeight();
      }}
      onInput={(e) => {
        onInput?.(e);
        syncHeight();
      }}
      style={{ overflow: 'hidden', resize: 'none', ...style }}
      className={className}
      {...rest}
    />
  );
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
