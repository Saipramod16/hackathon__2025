import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GeneratePopulationRequest {
  name?: string;
  size?: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
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

    const { name = 'Population ' + new Date().toISOString(), size = 500 }: GeneratePopulationRequest = await req.json();

    const populationSize = Math.min(Math.max(size, 100), 1000);

    const { data: population, error: popError } = await supabase
      .from('populations')
      .insert({
        name,
        size: populationSize,
      })
      .select()
      .single();

    if (popError) throw popError;

    const patients = [];
    const genders = ['Male', 'Female'];
    const geneticMarkers = ['fast', 'slow'];

    for (let i = 0; i < populationSize; i++) {
      patients.push({
        population_id: population.id,
        age: randomInt(30, 80),
        gender: randomChoice(genders),
        bmi: randomFloat(18, 40, 1),
        cholesterol_baseline: randomFloat(150, 300, 1),
        has_diabetes: Math.random() < 0.25,
        genetic_marker: randomChoice(geneticMarkers),
      });
    }

    const { error: patientsError } = await supabase
      .from('patients')
      .insert(patients);

    if (patientsError) throw patientsError;

    return new Response(
      JSON.stringify({
        success: true,
        population_id: population.id,
        name: population.name,
        size: populationSize,
        message: `Generated ${populationSize} patients successfully`,
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