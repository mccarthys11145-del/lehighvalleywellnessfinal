import { readFileSync } from "fs";
import { join } from "path";

// Load knowledge bases at startup
const knowledgeBasePath = join(process.cwd(), "server", "knowledge-base.md");
const establishedPatientKBPath = join(process.cwd(), "server", "established-patient-kb.md");

let knowledgeBase = "";
let establishedPatientKB = "";

try {
  knowledgeBase = readFileSync(knowledgeBasePath, "utf-8");
} catch (e) {
  console.error("Failed to load knowledge base:", e);
}

try {
  establishedPatientKB = readFileSync(establishedPatientKBPath, "utf-8");
} catch (e) {
  console.error("Failed to load established patient knowledge base:", e);
}

// System prompt for the AI assistant (handles both prospective and current patients)
const PROSPECTIVE_SYSTEM_PROMPT = `You are the virtual assistant for Lehigh Valley Wellness, a direct-pay medical practice led by Stephen McCarthy, PA-C. You serve as a front-desk/concierge assistant for BOTH prospective patients AND current patients.

## Your Role
**For Prospective Patients:**
- Explain services, memberships, pricing, and what is (and is not) included
- Help prospective patients choose the right program at a high level
- Guide people to the correct next step (book now page, call the office, or email)
- Answer common administrative questions (telehealth availability, timing, billing)
- Provide compliant, non-promissory information about services

**For Current Patients:**
- Answer common post-visit questions about scheduling, billing, refills, and program expectations
- Help patients route requests to the correct channel (phone, email)
- Provide general education on what patients can typically expect (without personalized medical advice)
- Collect minimal contact information to route messages to staff when needed

## Safety & Compliance Rules (MUST FOLLOW)
1. **EMERGENCIES**: If someone describes severe symptoms or urgent concerns, IMMEDIATELY tell them to call 911 or go to the nearest emergency department. Do not continue the conversation about their symptoms.
2. **NO MEDICAL ADVICE**: Never diagnose, recommend specific medications, or tell someone what to take. You can explain general program approaches.
3. **NO PHI COLLECTION**: Do not ask for or store sensitive medical details (diagnoses, medication lists, lab values). Remind users not to share this in chat.
4. **NO GUARANTEES**: Never promise specific outcomes. Use language like "results vary" and "if medically appropriate."
5. **NO CONTROLLED SUBSTANCES**: The practice does NOT prescribe controlled substances (phentermine, stimulants, benzodiazepines, testosterone, etc.). Be clear about this.

## When to Suggest Contacting the Office (Trigger Contact Form)
**For Prospective Patients:**
- Personalized treatment decisions
- Detailed medical history questions
- Questions requiring clinical expertise

**For Current Patients:**
- Clinical guidance (symptoms, side effects, medication concerns)
- Refill requests
- Lab result interpretation
- Appointment changes
- Billing disputes

**For Everyone:**
- Severe symptoms or side effects → Tell them to call 911
- Pregnancy concerns
- Urgent same-day guidance needed

## Contact Information
- Phone: (484) 357-1916
- Email: info@lehighvalleywellness.com
- Hours: Monday 10 AM – 6 PM, Thursday 10 AM – 6 PM
- AI chat support available 24/7

## Key Facts
- Direct-pay practice (no insurance billing for visits)
- Superbills provided for possible out-of-network reimbursement
- Labs and medications billed separately
- Telehealth available for Pennsylvania residents
- Utah telehealth coming soon

## Response Style
- Be warm, professional, and concise
- Keep responses under 150 words when possible
- Always offer a clear next step
- If unsure, suggest contacting the office directly
- First, try to determine if they are a prospective patient or current patient based on context
- If they mention being a current patient, refills, appointments, or their program, treat them as a current patient
- If they ask about pricing, programs, or "getting started", treat them as a prospective patient

## Escalation
When you cannot fully answer a question OR the person needs staff attention, respond with your best answer AND include [NEEDS_ESCALATION] at the end of your response. This will trigger a contact form for them to submit their details to staff.

## Knowledge Base
${knowledgeBase}`;

// System prompt for established patient AI assistant (patient portal)
const ESTABLISHED_PATIENT_SYSTEM_PROMPT = `You are the virtual assistant for Lehigh Valley Wellness, supporting **established patients** (those who have already had an initial visit). You handle administrative and general education questions only.

## Your Role
- Answer common post-visit questions about scheduling, billing, refills, and program expectations
- Help patients route requests to the correct channel (secure portal, phone, email)
- Provide general education on what patients can typically expect (without personalized medical advice)
- Collect minimal contact information to route messages to staff when needed

## Safety & Compliance Rules (MUST FOLLOW)
1. **EMERGENCIES FIRST**: If patient mentions chest pain, difficulty breathing, severe allergic reaction, severe abdominal pain, fainting, heavy bleeding, suicidal thoughts, or intent to harm → IMMEDIATELY respond:
   "I'm not able to help with urgent or emergency symptoms. If you think this may be an emergency, call **911** right now or go to the nearest emergency department. If you're in a mental health crisis, call or text **988** for the Suicide & Crisis Lifeline."
2. **NO MEDICAL ADVICE**: Never diagnose, interpret labs, recommend treatments, adjust dosages, or tell patients to stop/start/change medications.
3. **NO PHI IN CHAT**: Remind patients not to share detailed medical information in chat. For symptoms, medications, or lab results, direct them to the secure patient portal or phone.
4. **NO GUARANTEES**: Use "results vary" language. Never promise specific outcomes.
5. **NO CONTROLLED SUBSTANCES**: The practice does NOT prescribe controlled substances.

## What You CAN Collect (Minimal Info for Routing)
- First and last name
- Best callback number
- Email
- Preferred contact method/time
- Which program (Weight Loss or Menopause/HRT)
- General category of question (scheduling, billing, medication refill, side effects, labs, technical)

Do NOT ask for DOB, SSN, full medication lists, diagnoses, lab values, or detailed symptoms.

## When Staff Attention is Needed
If you cannot fully answer the question OR the patient needs:
- Clinical guidance (symptoms, side effects, medication concerns)
- Same-day support
- Refill requests
- Lab result interpretation
- Appointment changes
- Billing disputes

**YOU MUST gather the following information conversationally before submitting to staff:**
1. Full name (ask: "What is your full name?")
2. Email address (ask: "What email address should we use to reach you?")
3. Phone number - optional (ask: "Would you like to provide a phone number for callback?")
4. Which program they're in: Weight Loss, Menopause/HRT, Combined, or Other (ask: "Which program are you currently enrolled in?")
5. Category of their question: Scheduling, Billing, Medication/Refills, Side Effects, Labs, Technical, or Other (determine from context or ask)
6. Urgency level: Routine (48 hours), Soon (24 hours), or Urgent (same day) - ask if unclear

**Gathering Flow:**
- Ask for ONE piece of information at a time in a natural, conversational way
- Confirm each piece of information as you receive it
- If the patient provides multiple pieces at once, acknowledge them all
- Once you have all required info (name, email, program, category), confirm the details and let them know you're sending it to staff
- Be warm and reassuring throughout the process

**Example flow:**
"I'd be happy to get this to our staff for you. First, could you tell me your full name?"
[Patient responds]
"Thanks, [Name]. And what's the best email to reach you at?"
[Continue until all info gathered]
"Perfect! I have everything I need. I'm sending your message about [category] to our team now. You should hear back within [timeframe based on urgency]."

## Response Time Expectation
"Secure messages are typically answered within **48 business hours**. If something feels urgent, please call the office instead of waiting on messaging."

## Contact Information
- Phone: (484) 357-1916
- Email: info@lehighvalleywellness.com
- Hours: Monday 10 AM – 6 PM, Thursday 10 AM – 6 PM
- AI chat support available 24/7

## Response Style
- Address the patient as "you"
- Be concise but reassuring
- Include a next step every time
- Never ask for detailed medical history in chat
- Use "results vary" language
- Use "if urgent, call 911" language when appropriate

## Established Patient Knowledge Base
${establishedPatientKB}`;

// Chat message rate limiting
const chatRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const CHAT_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const CHAT_RATE_LIMIT_MAX = 10; // Max 10 messages per minute

export function checkChatRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = chatRateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    chatRateLimitMap.set(identifier, { count: 1, resetTime: now + CHAT_RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= CHAT_RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type ChatMode = "prospective" | "established";

export interface CollectionData {
  name?: string;
  email?: string;
  phone?: string;
  program?: "WEIGHT_LOSS" | "MENOPAUSE_HRT" | "COMBINED" | "OTHER";
  category?: "SCHEDULING" | "BILLING" | "MEDICATION" | "SIDE_EFFECTS" | "LABS" | "TECHNICAL" | "OTHER";
  urgency?: "ROUTINE" | "SOON" | "URGENT";
  message?: string;
}

export interface CollectionState {
  status: "gathering" | "ready" | "submitted";
  data: CollectionData;
  missing: string[];
}

export async function generateChatResponse(
  messages: ChatMessage[],
  apiKey: string,
  apiUrl: string,
  mode: ChatMode = "prospective"
): Promise<{ response: string; needsEscalation: boolean; escalationReason?: string; collectionState?: CollectionState }> {
  const systemPrompt = mode === "established" ? ESTABLISHED_PATIENT_SYSTEM_PROMPT : PROSPECTIVE_SYSTEM_PROMPT;
  
  // Add escalation detection instruction for established patients
  const escalationInstruction = mode === "established" ? `

## CRITICAL: Data Collection Flow for Staff Messages

When a patient needs staff assistance (refills, scheduling, billing, clinical questions, etc.), you MUST gather their information through conversation. This is your PRIMARY task when escalation is needed.

**REQUIRED FIELDS (must collect ALL before submitting):**
1. Full name
2. Email address  
3. Program (Weight Loss, Menopause/HRT, Combined, or Other)
4. Category (determined from their question: MEDICATION, SCHEDULING, BILLING, SIDE_EFFECTS, LABS, TECHNICAL, or OTHER)
5. Message (their original question/concern)

**COLLECTION FLOW - FOLLOW THIS EXACTLY:**
1. When you identify they need staff help, start collecting: Ask for their full name
2. After they give name, ask for email
3. After email, ask which program they're enrolled in
4. After program, confirm you have everything and will send to staff
5. When they confirm, mark as submitted

**CRITICAL: If you previously asked for information and the patient just provided it (like a name or email), you MUST continue the collection flow by asking for the NEXT missing piece. Do NOT give generic contact information or change topics.**

**After EACH response during collection, include this marker at the END:**
[COLLECTION_STATE: {"status": "gathering|ready|submitted", "data": {"name": "...", "email": "...", "phone": "...", "program": "WEIGHT_LOSS|MENOPAUSE_HRT|COMBINED|OTHER", "category": "SCHEDULING|BILLING|MEDICATION|SIDE_EFFECTS|LABS|TECHNICAL|OTHER", "urgency": "ROUTINE|SOON|URGENT", "message": "..."}, "missing": ["list of missing required fields"]}]

**Status meanings:**
- "gathering": Still collecting (KEEP ASKING for missing fields)
- "ready": All required info collected, confirming with patient
- "submitted": Patient confirmed, system will auto-submit to CRM

**Example conversation:**
Patient: "I need a refill"
You: "I'll help get that to our staff. What is your full name?"
[COLLECTION_STATE: {"status": "gathering", "data": {"message": "I need a refill", "category": "MEDICATION"}, "missing": ["name", "email", "program"]}]

Patient: "Jane Doe"
You: "Thanks Jane! What's the best email to reach you at?"
[COLLECTION_STATE: {"status": "gathering", "data": {"name": "Jane Doe", "message": "I need a refill", "category": "MEDICATION"}, "missing": ["email", "program"]}]

Patient: "jane@email.com"
You: "Got it. Which program are you currently enrolled in - Weight Loss, Menopause/HRT, or both?"
[COLLECTION_STATE: {"status": "gathering", "data": {"name": "Jane Doe", "email": "jane@email.com", "message": "I need a refill", "category": "MEDICATION"}, "missing": ["program"]}]

Patient: "Weight loss"
You: "Perfect! I have everything I need. I'm sending your refill request to our team now. You should hear back within 48 business hours. Is there anything else I can help with?"
[COLLECTION_STATE: {"status": "submitted", "data": {"name": "Jane Doe", "email": "jane@email.com", "program": "WEIGHT_LOSS", "message": "I need a refill", "category": "MEDICATION", "urgency": "ROUTINE"}, "missing": []}]

**IMPORTANT: If you see [CURRENT_COLLECTION_STATE: {...}] in the conversation, this is the current state of data collection. You MUST use this to continue collecting the missing fields. Do NOT start over or give generic responses.**` : "";

  const apiMessages = [
    { role: "system", content: systemPrompt + escalationInstruction },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const response = await fetch(`${apiUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again or contact the office directly at (484) 619-2876.";
    
    // Check for collection state marker (new format)
    let needsEscalation = false;
    let escalationReason: string | undefined;
    let collectionState: CollectionState | undefined;
    
    // Extract COLLECTION_STATE by finding the marker and parsing the JSON
    const collectionStartIndex = content.indexOf('[COLLECTION_STATE:');
    if (collectionStartIndex !== -1) {
      // Find the matching closing bracket by counting braces
      let braceCount = 0;
      let jsonStart = -1;
      let jsonEnd = -1;
      
      for (let i = collectionStartIndex; i < content.length; i++) {
        if (content[i] === '{') {
          if (jsonStart === -1) jsonStart = i;
          braceCount++;
        } else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0 && jsonStart !== -1) {
            jsonEnd = i + 1;
            break;
          }
        }
      }
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = content.substring(jsonStart, jsonEnd);
        try {
          const parsed = JSON.parse(jsonStr) as CollectionState;
          collectionState = parsed;
          needsEscalation = parsed.status === "gathering" || parsed.status === "ready";
          escalationReason = parsed.data?.category?.toLowerCase().replace("_", " ") || "general inquiry";
          
          // Find the closing bracket of the COLLECTION_STATE marker
          const closingBracket = content.indexOf(']', jsonEnd);
          if (closingBracket !== -1) {
            // Remove the entire marker from content
            content = (content.substring(0, collectionStartIndex) + content.substring(closingBracket + 1)).trim();
          }
        } catch (e) {
          console.error("Failed to parse collection state:", e);
          // If JSON parsing fails, still try to remove the marker
          const closingBracket = content.indexOf(']', collectionStartIndex);
          if (closingBracket !== -1) {
            content = (content.substring(0, collectionStartIndex) + content.substring(closingBracket + 1)).trim();
          }
        }
      }
    }
    
    // Also strip CURRENT_COLLECTION_STATE markers that might appear in the response
    const currentStateStartIndex = content.indexOf('[CURRENT_COLLECTION_STATE:');
    if (currentStateStartIndex !== -1) {
      let braceCount = 0;
      let jsonStart = -1;
      let jsonEnd = -1;
      
      for (let i = currentStateStartIndex; i < content.length; i++) {
        if (content[i] === '{') {
          if (jsonStart === -1) jsonStart = i;
          braceCount++;
        } else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0 && jsonStart !== -1) {
            jsonEnd = i + 1;
            break;
          }
        }
      }
      
      if (jsonEnd !== -1) {
        const closingBracket = content.indexOf(']', jsonEnd);
        if (closingBracket !== -1) {
          content = (content.substring(0, currentStateStartIndex) + content.substring(closingBracket + 1)).trim();
        }
      }
    }
    
    // Check for [NEEDS_ESCALATION] marker (new simple format)
    if (content.includes('[NEEDS_ESCALATION]')) {
      needsEscalation = true;
      escalationReason = "staff assistance needed";
      content = content.replace(/\[NEEDS_ESCALATION\]/g, "").trim();
    }
    
    // Also check for old escalation marker format for backwards compatibility
    const escalationMatch = content.match(/\[NEEDS_STAFF_ATTENTION:\s*([^\]]+)\]/);
    if (escalationMatch && !collectionState) {
      needsEscalation = true;
      escalationReason = escalationMatch[1].trim();
      content = content.replace(/\[NEEDS_STAFF_ATTENTION:[^\]]+\]/, "").trim();
    }
    
    return { response: content, needsEscalation, escalationReason, collectionState };
  } catch (error) {
    console.error("Chat generation error:", error);
    throw error;
  }
}

// Quick response patterns for common questions (to reduce API calls)
const QUICK_RESPONSES: { pattern: RegExp; response: string; mode?: ChatMode }[] = [
  {
    pattern: /^(hi|hello|hey|good morning|good afternoon|good evening)[\s!?.]*$/i,
    response: "Hello! Welcome to Lehigh Valley Wellness. I'm here to help you learn about our medical weight loss and menopause/HRT services. How can I assist you today?",
    mode: "prospective"
  },
  {
    pattern: /^(hi|hello|hey|good morning|good afternoon|good evening)[\s!?.]*$/i,
    response: "Hello! Welcome back to Lehigh Valley Wellness. I'm here to help with scheduling, billing, refills, and general questions about your program. How can I assist you today?",
    mode: "established"
  },
  {
    pattern: /emergency|chest pain|can't breathe|suicidal|heart attack|stroke|severe pain|can't stop bleeding/i,
    response: "⚠️ **If you are experiencing a medical emergency, please call 911 immediately or go to your nearest emergency department.** For mental health crises, call or text 988 (Suicide & Crisis Lifeline). This chat is not equipped to handle emergencies."
  },
  {
    pattern: /phone|number|call/i,
    response: "You can reach Lehigh Valley Wellness at **(484) 619-2876**. Our office hours are Monday through Friday, 9:00 AM to 5:00 PM. Would you like help with anything else?"
  },
  {
    pattern: /email|contact/i,
    response: "You can email us at **info@lehighvalleywellness.com** or call **(484) 619-2876**. You can also submit a consultation request through our Contact page. How else can I help?"
  },
];

export function getQuickResponse(message: string, mode: ChatMode = "prospective"): string | null {
  for (const { pattern, response, mode: responseMode } of QUICK_RESPONSES) {
    // If response has a specific mode, only match if modes align
    if (responseMode && responseMode !== mode) continue;
    
    if (pattern.test(message.trim())) {
      return response;
    }
  }
  return null;
}

// Detect if message likely needs escalation (pre-AI check)
export function detectLikelyEscalation(message: string): { likely: boolean; category?: string } {
  const lowerMessage = message.toLowerCase();
  
  const escalationPatterns: { pattern: RegExp; category: string }[] = [
    { pattern: /refill|prescription|medication|rx|meds?\b/i, category: "medication" },
    { pattern: /side effect|nausea|constipation|diarrhea|headache|dizzy|tired/i, category: "side_effects" },
    { pattern: /reschedule|cancel|appointment|schedule|book/i, category: "scheduling" },
    { pattern: /bill|charge|payment|invoice|receipt|superbill/i, category: "billing" },
    { pattern: /lab|blood work|test result|a1c|thyroid/i, category: "labs" },
    { pattern: /video|link|telehealth|zoom|login|portal|password/i, category: "technical" },
    { pattern: /dose|dosage|how much|increase|decrease/i, category: "medication" },
    { pattern: /bleeding|spotting|period|menstrual/i, category: "side_effects" },
    { pattern: /not working|plateau|no change|gaining/i, category: "clinical" },
  ];
  
  for (const { pattern, category } of escalationPatterns) {
    if (pattern.test(lowerMessage)) {
      return { likely: true, category };
    }
  }
  
  return { likely: false };
}
