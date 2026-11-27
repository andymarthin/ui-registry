import { createContext, useContext, type ReactNode } from 'react';

export const InspectContext = createContext<boolean>(false);

export interface InspectProviderProps {
  active?: boolean;
  value?: boolean;
  children: ReactNode;
}

export function InspectProvider({
  active,
  value,
  children,
}: InspectProviderProps) {
  const isInspecting = active ?? value ?? false;
  return (
    <InspectContext.Provider value={isInspecting}>
      {children}
    </InspectContext.Provider>
  );
}

export interface InspectBoxProps {
  label: string;
  active?: boolean;
  className?: string;
  children: ReactNode;
}

export function InspectBox({
  label,
  active,
  className,
  children,
}: InspectBoxProps) {
  const contextActive = useContext(InspectContext);
  const isActive = active ?? contextActive;

  if (!isActive) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <div
      className={['relative', className].filter(Boolean).join(' ')}
      style={{
        outline: '1.5px dashed rgba(56, 189, 248, 0.75)',
        outlineOffset: '-1.5px',
      }}
      data-inspect-box="true"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1.5 left-1.5 z-40 rounded border border-sky-400/55 bg-sky-950/90 px-1.5 py-0.5 font-mono text-[10px] leading-none text-sky-300 whitespace-nowrap"
      >
        {label}
      </span>
      {children}
    </div>
  );
}
