import { useState } from 'react';
import { Loader2, Play } from 'lucide-react';

interface TrialConfigurationProps {
  onSimulate: (dosage: number, duration: number) => void;
  loading: boolean;
}

function TrialConfiguration({ onSimulate, loading }: TrialConfigurationProps) {
  const [dosage, setDosage] = useState(20);
  const [duration, setDuration] = useState(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(dosage, duration);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Statin-X Dosage: {dosage}mg
          </label>
          <input
            type="range"
            min="10"
            max="30"
            step="5"
            value={dosage}
            onChange={(e) => setDosage(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>10mg</span>
            <span>20mg</span>
            <span>30mg</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Trial Duration: {duration} weeks
          </label>
          <input
            type="range"
            min="4"
            max="12"
            step="2"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>4 weeks</span>
            <span>8 weeks</span>
            <span>12 weeks</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Trial Overview</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>Drug: Statin-X (cholesterol reduction medication)</li>
          <li>Primary Endpoint: Cholesterol reduction from baseline</li>
          <li>Safety Monitoring: Muscle pain and liver function</li>
          <li>Factors: Age, BMI, diabetes status, genetic markers</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Simulating Trial...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Run Trial Simulation
          </>
        )}
      </button>
    </form>
  );
}

export default TrialConfiguration;
