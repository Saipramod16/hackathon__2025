import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SimulateTrialRequest {
  population_id: string;
  dosage: number;
  duration: number;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function calculateCholesterolReduction(
  baseline: number,
  dosage: number,
  duration: number,
  age: number,
  bmi: number,
  geneticMarker: string,
  hasDiabetes: boolean
): number {
  let baseReduction = (dosage / 10) * 15;
  
  baseReduction *= (duration / 8);
  
  if (geneticMarker === 'fast') {
    baseReduction *= 1.3;
  } else {
    baseReduction *= 0.85;
  }
  
  if (age > 60) {
    baseReduction *= 0.9;
  }
  
  if (bmi > 30) {
    baseReduction *= 0.85;
  }
  
  if (hasDiabetes) {
    baseReduction *= 0.9;
  }
  
  const variance = randomFloat(-5, 5);
  baseReduction += variance;
  
  const actualReduction = Math.min(baseline * 0.5, Math.max(0, baseReduction));
  
  return parseFloat(actualReduction.toFixed(2));
}

function calculateAdverseEvent(
  dosage: number,
  age: number,
  bmi: number,
  hasDiabetes: boolean
): { hasEvent: boolean; eventType: string | null } {
  let riskScore = 0;
  
  riskScore += (dosage - 10) * 2;
  
  if (age > 65) {
    riskScore += 15;
  } else if (age > 55) {
    riskScore += 8;
  }
  
  if (bmi > 32) {
    riskScore += 10;
  } else if (bmi > 28) {
    riskScore += 5;
  }
  
  if (hasDiabetes) {
    riskScore += 8;
  }
  
  const randomFactor = Math.random() * 100;
  
  if (randomFactor < riskScore) {
    const eventRoll = Math.random();
    if (eventRoll < 0.6) {
      return { hasEvent: true, eventType: 'muscle pain' };
    } else {
      return { hasEvent: true, eventType: 'liver issue' };
    }
  }
  
  return { hasEvent: false, eventType: null };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { population_id, dosage, duration }: SimulateTrialRequest = await req.json();

    if (!population_id || !dosage || !duration) {
      throw new Error('Missing required parameters: population_id, dosage, duration');
    }

    const validDosage = Math.min(Math.max(dosage, 10), 30);
    const validDuration = Math.min(Math.max(duration, 4), 12);

    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .eq('population_id', population_id);

    if (patientsError) throw patientsError;
    if (!patients || patients.length === 0) {
      throw new Error('No patients found for this population');
    }

    const trialResults = patients.map((patient) => {
      const cholesterolReduction = calculateCholesterolReduction(
        patient.cholesterol_baseline,
        validDosage,
        validDuration,
        patient.age,
        patient.bmi,
        patient.genetic_marker,
        patient.has_diabetes
      );

      const cholesterolFinal = parseFloat(
        (patient.cholesterol_baseline - cholesterolReduction).toFixed(2)
      );

      const reductionPercent = parseFloat(
        ((cholesterolReduction / patient.cholesterol_baseline) * 100).toFixed(2)
      );

      const adverseEvent = calculateAdverseEvent(
        validDosage,
        patient.age,
        patient.bmi,
        patient.has_diabetes
      );

      return {
        population_id: population_id,
        patient_id: patient.id,
        dosage: validDosage,
        duration: validDuration,
        cholesterol_final: cholesterolFinal,
        cholesterol_reduction: cholesterolReduction,
        reduction_percent: reductionPercent,
        had_adverse_event: adverseEvent.hasEvent,
        adverse_event_type: adverseEvent.eventType,
      };
    });

    const { error: resultsError } = await supabase
      .from('trial_results')
      .insert(trialResults);

    if (resultsError) throw resultsError;

    const avgReduction = trialResults.reduce(
      (sum, r) => sum + r.cholesterol_reduction,
      0
    ) / trialResults.length;

    const avgReductionPercent = trialResults.reduce(
      (sum, r) => sum + r.reduction_percent,
      0
    ) / trialResults.length;

    const adverseEventCount = trialResults.filter((r) => r.had_adverse_event).length;

    return new Response(
      JSON.stringify({
        success: true,
        population_id,
        dosage: validDosage,
        duration: validDuration,
        total_patients: patients.length,
        avg_cholesterol_reduction: parseFloat(avgReduction.toFixed(2)),
        avg_reduction_percent: parseFloat(avgReductionPercent.toFixed(2)),
        adverse_events: adverseEventCount,
        adverse_event_rate: parseFloat(
          ((adverseEventCount / patients.length) * 100).toFixed(2)
        ),
        message: 'Trial simulation completed successfully',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});