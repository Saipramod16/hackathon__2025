/*
  # Clinical Trial Digital Twin Simulator Schema

  1. New Tables
    - `populations`
      - `id` (uuid, primary key) - Unique identifier for population
      - `name` (text) - Name/description of the population
      - `size` (integer) - Number of patients in population
      - `created_at` (timestamptz) - Creation timestamp
    
    - `patients`
      - `id` (uuid, primary key) - Unique patient identifier
      - `population_id` (uuid, foreign key) - Reference to population
      - `age` (integer) - Patient age (30-80 years)
      - `gender` (text) - Patient gender (Male/Female)
      - `bmi` (decimal) - Body Mass Index (18-40)
      - `cholesterol_baseline` (decimal) - Baseline cholesterol level (150-300 mg/dL)
      - `has_diabetes` (boolean) - Diabetes status
      - `genetic_marker` (text) - Metabolizer type (fast/slow)
      - `created_at` (timestamptz) - Creation timestamp
    
    - `trial_results`
      - `id` (uuid, primary key) - Unique result identifier
      - `population_id` (uuid, foreign key) - Reference to population
      - `patient_id` (uuid, foreign key) - Reference to patient
      - `dosage` (integer) - Drug dosage in mg (10-30)
      - `duration` (integer) - Trial duration in weeks (4-12)
      - `cholesterol_final` (decimal) - Final cholesterol level
      - `cholesterol_reduction` (decimal) - Cholesterol reduction amount
      - `reduction_percent` (decimal) - Percentage reduction
      - `had_adverse_event` (boolean) - Adverse event occurrence
      - `adverse_event_type` (text, nullable) - Type of adverse event
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is a demo app)
    
  3. Indexes
    - Add indexes on foreign keys for query performance
    - Add index on population_id for efficient filtering
*/

-- Create populations table
CREATE TABLE IF NOT EXISTS populations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size integer NOT NULL DEFAULT 500,
  created_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  population_id uuid NOT NULL REFERENCES populations(id) ON DELETE CASCADE,
  age integer NOT NULL,
  gender text NOT NULL,
  bmi decimal(5,2) NOT NULL,
  cholesterol_baseline decimal(6,2) NOT NULL,
  has_diabetes boolean NOT NULL DEFAULT false,
  genetic_marker text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create trial_results table
CREATE TABLE IF NOT EXISTS trial_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  population_id uuid NOT NULL REFERENCES populations(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dosage integer NOT NULL,
  duration integer NOT NULL,
  cholesterol_final decimal(6,2) NOT NULL,
  cholesterol_reduction decimal(6,2) NOT NULL,
  reduction_percent decimal(5,2) NOT NULL,
  had_adverse_event boolean NOT NULL DEFAULT false,
  adverse_event_type text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE populations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_results ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo app)
CREATE POLICY "Anyone can view populations"
  ON populations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create populations"
  ON populations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view patients"
  ON patients FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create patients"
  ON patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view trial results"
  ON trial_results FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create trial results"
  ON trial_results FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_population_id ON patients(population_id);
CREATE INDEX IF NOT EXISTS idx_trial_results_population_id ON trial_results(population_id);
CREATE INDEX IF NOT EXISTS idx_trial_results_patient_id ON trial_results(patient_id);