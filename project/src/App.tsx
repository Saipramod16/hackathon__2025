import { useState } from 'react';
import { Loader2, FlaskConical, Users, Activity } from 'lucide-react';
import { generatePopulation, simulateTrial } from './lib/api';
import { supabase } from './lib/supabase';
import { SimulationSummary, TrialResult, Patient } from './types';
import TrialConfiguration from './components/TrialConfiguration';
import ResultsDashboard from './components/ResultsDashboard';

function App() {
  const [loading, setLoading] = useState(false);
  const [populationId, setPopulationId] = useState<string | null>(null);
  const [populationSize, setPopulationSize] = useState<number>(500);
  const [simulationResults, setSimulationResults] = useState<SimulationSummary | null>(null);
  const [trialResults, setTrialResults] = useState<TrialResult[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [step, setStep] = useState<'generate' | 'configure' | 'results'>('generate');

  const handleGeneratePopulation = async (size: number) => {
    setLoading(true);
    try {
      const result = await generatePopulation(`Clinical Trial ${Date.now()}`, size);
      if (result.success) {
        setPopulationId(result.population_id);
        setPopulationSize(size);
        setStep('configure');
      }
    } catch (error) {
      console.error('Error generating population:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTrial = async (dosage: number, duration: number) => {
    if (!populationId) return;

    setLoading(true);
    try {
      const result = await simulateTrial(populationId, dosage, duration);
      if (result.success) {
        setSimulationResults(result);

        const { data: resultsData } = await supabase
          .from('trial_results')
          .select('*')
          .eq('population_id', populationId)
          .eq('dosage', dosage)
          .eq('duration', duration);

        const { data: patientsData } = await supabase
          .from('patients')
          .select('*')
          .eq('population_id', populationId);

        if (resultsData) setTrialResults(resultsData);
        if (patientsData) setPatients(patientsData);

        setStep('results');
      }
    } catch (error) {
      console.error('Error simulating trial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPopulationId(null);
    setSimulationResults(null);
    setTrialResults([]);
    setPatients([]);
    setStep('generate');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FlaskConical className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">
              Clinical Trial Digital Twin Simulator
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Simulate drug trials with synthetic patient populations and analyze outcomes
          </p>
        </header>

        {step === 'generate' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-800">
                  Generate Patient Population
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                Create a synthetic population of patients with varied characteristics including age, gender, BMI, cholesterol levels, diabetes status, and genetic markers.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Population Size: {populationSize} patients
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={populationSize}
                    onChange={(e) => setPopulationSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>100</span>
                    <span>1000</span>
                  </div>
                </div>

                <button
                  onClick={() => handleGeneratePopulation(populationSize)}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Population...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Generate Population
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'configure' && populationId && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-semibold text-slate-800">
                  Configure Trial Parameters
                </h2>
              </div>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Population ready:</span> {populationSize} synthetic patients
                </p>
              </div>
              <TrialConfiguration
                onSimulate={handleSimulateTrial}
                loading={loading}
              />
            </div>
          </div>
        )}

        {step === 'results' && simulationResults && (
          <ResultsDashboard
            summary={simulationResults}
            trialResults={trialResults}
            patients={patients}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

export default App;
