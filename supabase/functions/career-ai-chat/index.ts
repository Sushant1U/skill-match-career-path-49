
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SYSTEM_PROMPT = `You are Sarthi, a career guidance AI assistant focused on helping students with:
1. Resume writing and optimization
2. Job search strategies
3. Interview preparation
4. Career path guidance
5. Platform navigation help

If the user asks about available jobs or job recommendations, query the database and provide details of actual job listings.
If the user asks for resume building help, offer to create a professional resume based on their skills and experience.
For resume creation requests, collect details like: education, skills, experience, projects, and contact info.

Keep your responses focused, practical, and encouraging. If asked about technical skills, reference real-world job market demands.
`;

const RESUME_SYSTEM_PROMPT = `You are a professional resume writer. Create a well-structured, ATS-friendly resume based on the information provided by the user. Format the resume with appropriate sections:
1. Contact Information
2. Professional Summary
3. Skills
4. Education
5. Experience
6. Projects (if applicable)
7. Certifications (if applicable)

Use a clean, professional format with clear section headings and bullet points for accomplishments.
Use action verbs to start bullet points.
Make sure the content is well-organized and concise.
`;

async function fetchAvailableJobs() {
  // Fetch active jobs from the database
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title, company, location, skills, qualifications')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return null;
    }
    
    return jobs;
  } catch (error) {
    console.error('Error in fetching jobs:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, action, resumeData } = await req.json();
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!openRouterKey) {
      throw new Error('OpenRouter API key not configured');
    }
    
    // Handle specific actions
    if (action === 'get_jobs') {
      const jobs = await fetchAvailableJobs();
      return new Response(JSON.stringify({
        response: "Here are some available job opportunities:",
        jobs: jobs || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Create resume if requested
    if (action === 'create_resume') {
      console.log('Creating resume with data:', resumeData);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'Sarthi Resume Generator',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout',
          messages: [
            {
              role: 'system',
              content: RESUME_SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: `Create a professional resume with this information: ${JSON.stringify(resumeData)}`
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      
      return new Response(JSON.stringify({
        resumeContent: data.choices[0].message.content,
        usage: data.usage
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process normal chat messages
    console.log('Sending request to OpenRouter API with Meta Llama 4 Scout model');

    // Get jobs to inform the AI's context
    const jobsData = await fetchAvailableJobs();
    let jobsContext = '';
    
    if (jobsData && jobsData.length > 0) {
      jobsContext = 'Available jobs in the database: ' + 
        jobsData.map(job => 
          `Title: ${job.title}, Company: ${job.company}, Location: ${job.location}, Skills: ${job.skills.join(', ')}`
        ).join('; ');
    }

    const systemPromptWithContext = jobsData ? 
      `${SYSTEM_PROMPT}\n\n${jobsContext}` : 
      SYSTEM_PROMPT;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Sarthi Career Assistant',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout',
        messages: [
          {
            role: 'system',
            content: systemPromptWithContext
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
      hasJobContext: jobsData && jobsData.length > 0,
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
