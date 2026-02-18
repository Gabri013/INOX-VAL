export interface ValidatorResult {
  status: 'passed' | 'failed' | 'warning';
  duration: number;
  error?: string;
  details?: any;
}

export interface ValidationResult {
  timestamp: string;
  allPass: boolean;
  results: Array<{
    name: string;
    status: 'passed' | 'failed' | 'warning';
    duration: number;
    error?: string;
    details?: any;
  }>;
}

export interface TestCase {
  name: string;
  templateKey: string;
  inputs: Record<string, any>;
}
