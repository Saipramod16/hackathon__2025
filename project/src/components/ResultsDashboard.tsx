import { RotateCcw, TrendingDown, AlertTriangle, Users, Lightbulb } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { SimulationSummary, TrialResult, Patient } from '../types';
import { useMemo } from 'react';

interface ResultsDashboardProps {
  summary: SimulationSummary;
  trialResults: TrialResult[];
  patients: Patient[];
  onReset: () => void;
}

function ResultsDashboard({ summary, trialResults, patients, onReset }: ResultsDashboardProps) {
  const patientMap = useMemo(() => {
    return new Map(patients.map((p) => [p.id, p]));
  }, [patients]);

  const ageGroupData = useMemo(() => {
    const groups = {
      '30-45': { count: 0, totalReduction: 0, adverseEvents: 0 },
      '46-60': { count: 0, totalReduction: 0, adverseEvents: 0 },
      '61-80': { count: 0, totalReduction: 0, adverseEvents: 0 },
    };

    trialResults.forEach((result) => {
      const patient = patientMap.get(result.patient_id);
      if (!patient) return;

      let group: keyof typeof groups;
      if (patient.age <= 45) group = '30-45';
      else if (patient.age <= 60) group = '46-60';
      else group = '61-80';

      groups[group].count++;
      groups[group].totalReduction += result.cholesterol_reduction;
      if (result.had_adverse_event) groups[group].adverseEvents++;
    });

    return Object.entries(groups).map(([age, data]) => ({
      age,
      avgReduction: data.count > 0 ? (data.totalReduction / data.count).toFixed(1) : 0,
      adverseEventRate: data.count > 0 ? ((data.adverseEvents / data.count) * 100).toFixed(1) : 0,
    }));
  }, [trialResults, patientMap]);

  const geneticMarkerData = useMemo(() => {
    const markers = {
      fast: { count: 0, totalReduction: 0, adverseEvents: 0 },
      slow: { count: 0, totalReduction: 0, adverseEvents: 0 },
    };

    trialResults.forEach((result) => {
      const patient = patientMap.get(result.patient_id);
      if (!patient) return;

      const marker = patient.genetic_marker as keyof typeof markers;
      markers[marker].count++;
      markers[marker].totalReduction += result.cholesterol_reduction;
      if (result.had_adverse_event) markers[marker].adverseEvents++;
    });

    return Object.entries(markers).map(([marker, data]) => ({
      marker: `${marker.charAt(0).toUpperCase() + marker.slice(1)} Metabolizer`,
      avgReduction: data.count > 0 ? (data.totalReduction / data.count).toFixed(1) : 0,
      adverseEvents: data.adverseEvents,
    }));
  }, [trialResults, patientMap]);

  const adverseEventTypes = useMemo(() => {
    const types: Record<string, number> = {};
    trialResults.forEach((result) => {
      if (result.had_adverse_event && result.adverse_event_type) {
        types[result.adverse_event_type] = (types[result.adverse_event_type] || 0) + 1;
      }
    });

    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [trialResults]);

  const insights = useMemo(() => {
    const findings: string[] = [];

    const olderPatients = ageGroupData.find((g) => g.age === '61-80');
    const youngerPatients = ageGroupData.find((g) => g.age === '30-45');
    if (olderPatients && youngerPatients) {
      if (parseFloat(olderPatients.adverseEventRate) > parseFloat(youngerPatients.adverseEventRate) * 1.5) {
        findings.push('Older patients (61-80) show significantly higher adverse event rates compared to younger cohorts.');
      }
    }

    const fastMetabolizers = geneticMarkerData.find((g) => g.marker.includes('Fast'));
    const slowMetabolizers = geneticMarkerData.find((g) => g.marker.includes('Slow'));
    if (fastMetabolizers && slowMetabolizers) {
      if (parseFloat(fastMetabolizers.avgReduction) > parseFloat(slowMetabolizers.avgReduction) * 1.2) {
        findings.push('Fast metabolizers demonstrate 20%+ better cholesterol reduction, suggesting genetic screening could optimize outcomes.');
      }
    }

    if (summary.adverse_event_rate > 15) {
      findings.push(`Adverse event rate of ${summary.adverse_event_rate}% exceeds typical safety thresholds. Consider dosage adjustment.`);
    } else if (summary.adverse_event_rate < 10) {
      findings.push('Low adverse event rate indicates good safety profile at current dosage.');
    }

    if (summary.avg_reduction_percent > 25) {
      findings.push('Excellent efficacy with >25% average cholesterol reduction from baseline.');
    }

    return findings;
  }, [ageGroupData, geneticMarkerData, summary]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Trial Results</h2>
          <p className="text-slate-600">
            Statin-X {summary.dosage}mg for {summary.duration} weeks
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-slate-600">Patients</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{summary.total_patients}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-medium text-slate-600">Avg Reduction</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {summary.avg_reduction_percent}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.avg_cholesterol_reduction.toFixed(1)} mg/dL
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-medium text-slate-600">Adverse Events</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{summary.adverse_events}</p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.adverse_event_rate}% of patients
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-slate-600" />
            <h3 className="text-sm font-medium text-slate-600">Trial Duration</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{summary.duration}</p>
          <p className="text-xs text-slate-500 mt-1">weeks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Cholesterol Reduction by Age Group
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgReduction" fill="#3b82f6" name="Avg Reduction (mg/dL)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Adverse Events by Age Group
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ageGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="adverseEventRate"
                stroke="#ef4444"
                strokeWidth={2}
                name="Adverse Event Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Efficacy by Genetic Marker
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={geneticMarkerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="marker" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgReduction" fill="#10b981" name="Avg Reduction (mg/dL)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Adverse Event Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={adverseEventTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {adverseEventTypes.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">Key Insights</h3>
          </div>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <p className="text-slate-700 leading-relaxed">{insight}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ResultsDashboard;
