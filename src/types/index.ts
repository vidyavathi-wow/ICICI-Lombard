import { PlateConfig } from '../utils/plateGenerator';

export type Screen = 'landing' | 'precheck' | 'test' | 'results';

export interface Response {
  plateIndex: number;
  plateId: string;
  answer: string;
  expectedAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
}
