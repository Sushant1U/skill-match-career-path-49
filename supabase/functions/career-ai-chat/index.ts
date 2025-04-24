
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Sarthi, a career guidance AI assistant focused on helping students with:
1. Resume writing and optimization
2. Job search strategies
3. Interview preparation
4. Career path guidance
5. Platform navigation help

Keep your responses focused, practical, and encouraging. If asked about technical skills, reference real-world job market demands.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!openRouterKey) {
      throw new Error('OpenRouter API key not configured');
    }

    console.log('Sending request to OpenRouter API with Meta Llama 4 Scout model');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev', // Optional, but recommended
        'X-Title': 'Sarthi Career Assistant',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          ...(context || []),
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error response:', errorData);
      throw new Error(`API responded with status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log('AI Response received successfully:', data);

    return new Response(JSON.stringify({
      response: data.choices[0].message.content,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

