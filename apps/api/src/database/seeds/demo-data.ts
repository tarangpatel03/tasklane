import { Role, TaskPriority, TaskStatus } from '@task-app/shared';

/** Demo accounts use the reserved `.test` domain, so no email can ever reach a real inbox. */
export const DEMO_EMAIL_DOMAIN = 'demo.test';

export type DemoKey = 'maya' | 'daniel' | 'aisha' | 'ben' | 'chloe' | 'diego' | 'emma';
/** The existing Admin (from `seed:admin`) is referred to as `admin`. */
export type DemoActor = DemoKey | 'admin';

export interface DemoPerson {
  key: DemoKey;
  name: string;
  role: Role.MANAGER | Role.EMPLOYEE;
}

export const DEMO_PEOPLE: DemoPerson[] = [
  { key: 'maya', name: 'Maya Patel', role: Role.MANAGER },
  { key: 'daniel', name: 'Daniel Brooks', role: Role.MANAGER },
  { key: 'aisha', name: 'Aisha Khan', role: Role.EMPLOYEE },
  { key: 'ben', name: 'Ben Carter', role: Role.EMPLOYEE },
  { key: 'chloe', name: 'Chloe Nguyen', role: Role.EMPLOYEE },
  { key: 'diego', name: 'Diego Alvarez', role: Role.EMPLOYEE },
  { key: 'emma', name: 'Emma Rossi', role: Role.EMPLOYEE },
];

export function demoEmail(key: DemoKey): string {
  return `${key}@${DEMO_EMAIL_DOMAIN}`;
}

export interface DemoComment {
  author: DemoActor;
  body: string;
}

export interface DemoTask {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  /** `null` is a task an Admin handles directly. */
  manager: 'maya' | 'daniel' | null;
  createdBy: DemoActor;
  assignees: DemoKey[];
  requiresReview?: boolean;
  createdDaysAgo: number;
  /** Negative values are in the past. */
  dueInDays: number | null;
  /** The reviewer rejected it once before the current status. */
  rejectedOnce?: string;
  comments?: DemoComment[];
}

const { LOW, MEDIUM, HIGH } = TaskPriority;
const { TODO, WORKING, IN_REVIEW, COMPLETED } = TaskStatus;

export const DEMO_TASKS: DemoTask[] = [
  {
    title: 'Prepare Q4 sales report',
    description: 'Collect regional numbers and build the summary slides.',
    priority: HIGH,
    status: TODO,
    manager: 'maya',
    createdBy: 'maya',
    assignees: ['aisha', 'ben'],
    createdDaysAgo: 2,
    dueInDays: 5,
  },
  {
    title: 'Update onboarding checklist',
    description: 'Add the new laptop setup steps.',
    priority: LOW,
    status: TODO,
    manager: 'maya',
    createdBy: 'maya',
    assignees: ['chloe'],
    createdDaysAgo: 1,
    dueInDays: 10,
  },
  {
    title: 'Fix invoice export bug',
    description: 'Exported invoices show the wrong tax total for mixed carts.',
    priority: HIGH,
    status: TODO,
    manager: 'daniel',
    createdBy: 'admin',
    assignees: ['diego'],
    createdDaysAgo: 3,
    dueInDays: -2,
  },
  {
    title: 'Design customer survey',
    description: 'Ten questions, focused on onboarding experience.',
    priority: MEDIUM,
    status: WORKING,
    manager: 'maya',
    createdBy: 'maya',
    assignees: ['emma', 'chloe'],
    createdDaysAgo: 6,
    dueInDays: 2,
    comments: [
      { author: 'emma', body: 'First draft of the questions is in the shared folder.' },
      { author: 'maya', body: 'Thanks. Please keep it under ten minutes to answer.' },
    ],
  },
  {
    title: 'Migrate shared drive',
    description: 'Move team folders to the new storage and update the links.',
    priority: MEDIUM,
    status: WORKING,
    manager: 'daniel',
    createdBy: 'daniel',
    assignees: ['ben', 'diego'],
    createdDaysAgo: 8,
    dueInDays: -4,
    comments: [{ author: 'ben', body: 'Waiting on access to the finance folder.' }],
  },
  {
    title: 'Plan team offsite',
    description: 'Pick a venue and a date that works for everyone.',
    priority: LOW,
    status: WORKING,
    manager: 'daniel',
    createdBy: 'daniel',
    assignees: ['emma'],
    createdDaysAgo: 5,
    dueInDays: 14,
  },
  {
    title: 'Audit software licences',
    description: 'List every paid tool, its owner and its renewal date.',
    priority: HIGH,
    status: WORKING,
    manager: 'maya',
    createdBy: 'admin',
    assignees: ['aisha'],
    createdDaysAgo: 9,
    dueInDays: 1,
  },
  {
    title: 'Write release notes for v2.3',
    description: 'Summarise the changes for customers in plain language.',
    priority: MEDIUM,
    status: IN_REVIEW,
    manager: 'daniel',
    createdBy: 'daniel',
    assignees: ['aisha'],
    createdDaysAgo: 7,
    dueInDays: 1,
  },
  {
    title: 'Refresh landing page copy',
    description: 'New headline, shorter feature list, updated pricing text.',
    priority: MEDIUM,
    status: IN_REVIEW,
    manager: 'maya',
    createdBy: 'maya',
    assignees: ['chloe', 'emma'],
    createdDaysAgo: 6,
    dueInDays: -1,
    rejectedOnce: 'The pricing text still shows last year’s plans. Please update it.',
    comments: [{ author: 'chloe', body: 'Pricing text fixed and resubmitted.' }],
  },
  {
    title: 'Quarterly security training',
    description: 'Everyone completes the phishing module and signs off.',
    priority: HIGH,
    status: IN_REVIEW,
    manager: 'daniel',
    createdBy: 'admin',
    assignees: ['ben', 'diego', 'emma'],
    createdDaysAgo: 10,
    dueInDays: 3,
  },
  {
    title: 'Set up CI pipeline cache',
    description: 'Cache dependencies to cut build time.',
    priority: MEDIUM,
    status: COMPLETED,
    manager: 'maya',
    createdBy: 'maya',
    assignees: ['diego'],
    createdDaysAgo: 12,
    dueInDays: -6,
  },
  {
    title: 'Order office supplies',
    description: 'Monthly order of paper, pens and coffee.',
    priority: LOW,
    status: COMPLETED,
    requiresReview: false,
    manager: 'daniel',
    createdBy: 'daniel',
    assignees: ['chloe'],
    createdDaysAgo: 11,
    dueInDays: -8,
  },
  {
    title: 'Summarise customer interviews',
    description: 'One page per interview with the top three takeaways.',
    priority: MEDIUM,
    status: COMPLETED,
    manager: 'maya',
    createdBy: 'admin',
    assignees: ['aisha', 'ben'],
    createdDaysAgo: 14,
    dueInDays: -3,
    comments: [{ author: 'maya', body: 'Great summaries, approved.' }],
  },
  {
    title: 'Review vendor contracts',
    description: 'Check renewal terms for the three biggest vendors.',
    priority: HIGH,
    status: WORKING,
    manager: null,
    createdBy: 'admin',
    assignees: ['emma'],
    createdDaysAgo: 4,
    dueInDays: 7,
  },
];
