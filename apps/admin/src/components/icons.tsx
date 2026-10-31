import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
}

function Svg({ size = 22, children }: IconProps & { children: ReactNode }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none' }}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="8" rx="2" />
      <rect x="12" y="3" width="7" height="5" rx="2" />
      <rect x="12" y="10" width="7" height="9" rx="2" />
      <rect x="3" y="13" width="7" height="6" rx="2" />
    </Svg>
  );
}

export function TasksIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="16" height="3.4" rx="1.7" fill="currentColor" stroke="none" />
      <rect x="3" y="9.3" width="16" height="3.4" rx="1.7" fill="currentColor" stroke="none" />
      <rect x="3" y="14.6" width="10" height="3.4" rx="1.7" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function UsersIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <circle cx="8.5" cy="8" r="3.3" />
      <path d="M2.5 18c.8-3.2 3-4.6 6-4.6s5.2 1.4 6 4.6" />
      <circle cx="15.5" cy="7" r="2.6" />
      <path d="M16.5 12.6c2 .3 3.2 1.7 3.6 3.9" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M4 6h14M4 11h14M4 16h14" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M5 5l12 12M17 5L5 17" />
    </Svg>
  );
}

export function ChevronsLeftIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M12 5l-6 6 6 6M18 5l-6 6 6 6" />
    </Svg>
  );
}

export function ChevronsRightIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M10 5l6 6-6 6M4 5l6 6-6 6" />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M6 8.5l5 5 5-5" />
    </Svg>
  );
}

export function EyeIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M1.8 11S5 4.8 11 4.8 20.2 11 20.2 11 17 17.2 11 17.2 1.8 11 1.8 11z" />
      <circle cx="11" cy="11" r="2.8" />
    </Svg>
  );
}

export function EyeOffIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M8.2 5.3A9 9 0 0111 4.8C17 4.8 20.2 11 20.2 11a15 15 0 01-2.6 3.3M13.3 13.3a2.8 2.8 0 01-4.6-3.6M5 7.3A15 15 0 001.8 11S5 17.2 11 17.2a8.6 8.6 0 004-1M3 3l16 16" />
    </Svg>
  );
}

export function SignOutIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M8.5 4H5.5a2 2 0 00-2 2v10a2 2 0 002 2h3M13 7l4 4-4 4M17 11H8.5" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <circle cx="9.5" cy="9.5" r="5.8" />
      <path d="M14 14l4.5 4.5" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M11 4.5v13M4.5 11h13" />
    </Svg>
  );
}

export function RefreshIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M18 11a7 7 0 11-2.1-5M18 3.5V7h-3.5" />
    </Svg>
  );
}

export function MoreIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <circle cx="11" cy="4.8" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="11" cy="11" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="11" cy="17.2" r="1.3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M4.5 11.5l4.2 4.2L17.5 6.5" />
    </Svg>
  );
}

export function MailIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <rect x="2.8" y="4.5" width="16.4" height="13" rx="3" />
      <path d="M3.5 6.5L11 12l7.5-5.5" />
    </Svg>
  );
}

export function EditIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M13.5 5l3.5 3.5M4 18l.8-3.8L14.4 4.6a2 2 0 012.8 0l.2.2a2 2 0 010 2.8L7.8 17.2 4 18z" />
    </Svg>
  );
}

export function BanIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7.5" />
      <path d="M5.7 5.7l10.6 10.6" />
    </Svg>
  );
}

export function UndoIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M8 5L4 9l4 4M4 9h9a4.5 4.5 0 010 9h-3" />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M13.5 5l-6 6 6 6" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps): ReactNode {
  return (
    <Svg {...props}>
      <path d="M8.5 5l6 6-6 6" />
    </Svg>
  );
}

/** Filled circle with an exclamation mark, used next to form and banner errors. */
export function AlertIcon({ size = 16 }: IconProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none' }}
    >
      <circle cx="7" cy="7" r="6" fill="currentColor" />
      <path d="M7 3.8v3.6M7 9.4v.1" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}
