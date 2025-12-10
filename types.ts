export enum BubbleState {
  IDLE = 'IDLE',
  POPPED = 'POPPED',
  ERROR = 'ERROR',
}

export interface BubbleData {
  id: number;
  value: number;
  color: string;
}

export const COLORS = [
  'bg-red-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-green-400',
  'bg-emerald-400',
  'bg-teal-400',
  'bg-cyan-400',
  'bg-sky-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-purple-400',
  'bg-fuchsia-400',
  'bg-pink-400',
  'bg-rose-400',
];