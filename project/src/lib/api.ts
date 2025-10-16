const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
};

export async function generatePopulation(name: string, size: number) {
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-population`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, size }),
  });
  return response.json();
}

export async function simulateTrial(populationId: string, dosage: number, duration: number) {
  const response = await fetch(`${supabaseUrl}/functions/v1/simulate-trial`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      population_id: populationId,
      dosage,
      duration,
    }),
  });
  return response.json();
}
