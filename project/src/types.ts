export interface Population {
  id: string;
  name: string;
  size: number;
  created_at: string;
}

export interface Patient {
  id: string;
  population_id: string;
  age: number;
  gender: string;
  bmi: number;
  cholesterol_baseline: number;
  has_diabetes: boolean;
  genetic_marker: string;
}

export interface TrialResult {
  id: string;
  population_id: string;
  patient_id: string;
  dosage: number;
  duration: number;
  cholesterol_final: number;
  cholesterol_reduction: number;
  reduction_percent: number;
  had_adverse_event: boolean;
  adverse_event_type: string | null;
}

export interface SimulationSummary {
  success: boolean;
  population_id: string;
  dosage: number;
  duration: number;
  total_patients: number;
  avg_cholesterol_reduction: number;
  avg_reduction_percent: number;
  adverse_events: number;
  adverse_event_rate: number;
  message: string;
}
