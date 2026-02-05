export async function generateMedicalReportWithTambo(userMessage: string): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_TAMBO_PROJECT_ID;

    console.log('🔑 API Key exists:', !!apiKey);
    console.log('📦 Project ID exists:', !!projectId);

    if (!apiKey || !projectId) {
      throw new Error('Missing Tambo API credentials. Check your .env.local file');
    }

    const systemPrompt = `You are a medical report generation AI assistant specialized in ophthalmology.

CRITICAL INSTRUCTION: You MUST generate ALL of the following sections. DO NOT skip any section. DO NOT only generate one section. Generate the COMPLETE report with ALL 7 sections.

## REQUIRED SECTIONS - ALL MUST BE PRESENT:

**1. PATIENT DEMOGRAPHICS**
- Patient name, age, gender, MRN
- Date of birth and examination date
- Referring physician

**2. CHIEF COMPLAINT**
- Primary reason for visit
- Duration of symptoms

**3. HISTORY OF PRESENT ILLNESS**
- Detailed symptom timeline
- Previous treatments
- Relevant medical history

**4. EXAMINATION FINDINGS**
- Visual acuity (both eyes)
- Intraocular pressure
- Fundoscopic examination
- Slit lamp findings

**5. IMAGING FINDINGS**
- OCT results with measurements
- Fundus photography findings
- Other imaging

**6. ASSESSMENT & DIAGNOSIS**
- Primary diagnosis with ICD-10 code
- Secondary considerations
- Severity assessment

**7. TREATMENT PLAN**
- Medications with dosages
- Procedures
- Follow-up schedule
- Patient counseling

Format each section with clear headers (use ## for section headers). Include realistic clinical data for each section.`;

    const fullPrompt = `${systemPrompt}\n\n---\n\nUSER REQUEST:\n${userMessage}`;

    console.log('🚀 Sending request to Tambo API...');

    const response = await fetch('https://api.tambo.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        stream: false
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Tambo API error response:', errorText);
      throw new Error(`Tambo API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Tambo response data:', data);

    // Extract the content from response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else if (data.content) {
      return data.content;
    } else if (data.response) {
      return data.response;
    }

    console.error('❌ Unexpected response structure:', data);
    throw new Error('Unexpected response format from Tambo');
  } catch (error: any) {
    console.error('❌ Error in generateMedicalReportWithTambo:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}
