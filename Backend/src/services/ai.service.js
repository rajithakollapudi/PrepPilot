const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function isTransientModelError(error) {
    const raw = `${error?.message || ""} ${error?.status || ""} ${error?.code || ""}`.toLowerCase()
    return (
        raw.includes("503") ||
        raw.includes("unavailable") ||
        raw.includes("high demand") ||
        raw.includes("resource exhausted") ||
        raw.includes("deadline exceeded")
    )
}

async function withModelRetry(fn, retries = 3, baseDelayMs = 800) {
    let lastError

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            const shouldRetry = isTransientModelError(error) && attempt < retries
            if (!shouldRetry) {
                break
            }

            const delay = baseDelayMs * Math.pow(2, attempt)
            await sleep(delay)
        }
    }

    if (lastError && isTransientModelError(lastError)) {
        lastError.isModelBusy = true
        lastError.userMessage = "AI service is temporarily busy. Please try again in a few seconds."
    }

    throw lastError
}

const cleanJson = (text) => {
    try {
        const cleaned = text.replace(/```json|```/g, "").trim()
        return JSON.parse(cleaned)
    } catch (e) {
        console.error("AI JSON Parse Error. Raw text:", text)
        throw new Error("AI response was in an invalid format.")
    }
}


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `You are an expert technical interviewer and career coach.

CRITICAL INSTRUCTION: Return ONLY valid JSON with ACTUAL VALUES, not key names.

WRONG FORMAT (DO NOT RETURN THIS):
{"technicalQuestions": ["question", "intention", "answer"]}

CORRECT FORMAT (RETURN THIS):
{"technicalQuestions": [{"question": "What is X?", "intention": "To test Y", "answer": "The answer is..."}]}

Generate a complete JSON interview report with:

{
  "title": "string - job title",
  "matchScore": number (0-100),
  
  "technicalQuestions": [
    {
      "question": "actual question",
      "intention": "what skill this tests",
      "answer": " answer"
    }
  ],
  
  "behavioralQuestions": [
    {
      "question": "tell me about...",
      "intention": "what this evaluates",
      "answer": "STAR format answer"
    }
  ],
  
  "skillGaps": [
    {
      "skill": "skill name",
      "severity": "low|medium|high"
    }
  ],
  
  "preparationPlan": [
    {
      "day": number,
      "focus": "what to learn",
      "tasks": ["task1", "task2"]
    }
  ]
}

REQUIREMENTS:
- At least 5 technical questions with full Q&A
- At least 5 behavioral questions with full Q&A  
- At least 3 skill gaps
- At least 7 days of planning with tasks

Resume:
${resume}

Job Description:
${jobDescription}

Self Description:
${selfDescription}

INSTRUCTIONS FOR ANSWERS:
- Keep technical answers CONCISE (max 3 sentences).
- Keep behavioral answers CONCISE (max 5 sentences, STAR format).
- Use markdown (e.g., **bold**) for emphasis where appropriate.
`;


    const response = await withModelRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.7,
            responseMimeType: "application/json"
        }
    }))

    const rawText = response.candidates[0].content.parts[0].text
    let parsedResponse = cleanJson(rawText)
    
    // Reconstruct objects from flattened arrays if needed
    const reconstructArray = (arr, objectKeys) => {
        if (!Array.isArray(arr) || arr.length === 0) return []
        
        // If first item is a string (flattened), reconstruct
        if (typeof arr[0] === 'string' && objectKeys.includes(arr[0])) {
            const result = []
            for (let i = 0; i < arr.length; i += objectKeys.length) {
                const obj = {}
                objectKeys.forEach((key, idx) => {
                    obj[key] = arr[i + idx] || ""
                })
                result.push(obj)
            }
            return result
        }
        return arr
    }
    
    const fixedResponse = {
        title: parsedResponse.title || "Interview Report",
        matchScore: typeof parsedResponse.matchScore === 'number' ? parsedResponse.matchScore : 0,
        technicalQuestions: reconstructArray(parsedResponse.technicalQuestions, ["question", "intention", "answer"]),
        behavioralQuestions: reconstructArray(parsedResponse.behavioralQuestions, ["question", "intention", "answer"]),
        skillGaps: reconstructArray(parsedResponse.skillGaps, ["skill", "severity"]),
        preparationPlan: reconstructArray(parsedResponse.preparationPlan, ["day", "focus", "tasks"])
    }
    
    // Filter out empty entries
    fixedResponse.technicalQuestions = fixedResponse.technicalQuestions.filter(q => q.question && q.question.length > 1)
    fixedResponse.behavioralQuestions = fixedResponse.behavioralQuestions.filter(q => q.question && q.question.length > 1)
    fixedResponse.skillGaps = fixedResponse.skillGaps.filter(s => s.skill && s.skill.length > 1)
    fixedResponse.preparationPlan = fixedResponse.preparationPlan.filter(p => p.day && typeof p.day === 'number')
    
    return fixedResponse


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdfData({ resume, selfDescription, jobDescription, personalInfo }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume")
    })

    const contactBlock = personalInfo ? `
Candidate Personal Info (USE THESE EXACT VALUES):
- Full Name: ${personalInfo.fullName || 'Not provided'}
- Phone: ${personalInfo.phone || 'Not provided'}
- Email: ${personalInfo.email || 'Not provided'}
- LinkedIn: ${personalInfo.linkedin || 'Not provided'}
- GitHub: ${personalInfo.github || 'Not provided'}
- Location: ${personalInfo.location || 'Not provided'}
` : ''

    const prompt = `You are a world-class resume writer. Generate a professional, ATS-optimized resume as clean HTML.
${contactBlock}
Candidate Background:
- Existing Resume: ${resume || 'Not provided'}
- Self Description: ${selfDescription}
- Target Job: ${jobDescription}

IMPORTANT RULES:
1. The HTML must be a self-contained document body (NO <html>, <head>, or <body> tags — just inner content).
2. Structure: Name & Contact → Professional Summary → Skills → Experience → Projects → Education → Certifications.
3. The candidate's name MUST be in a single <h1> tag at the top.
4. Contact info (phone, email, LinkedIn, GitHub, location) MUST be on ONE line below the name, centered, separated by " | " pipes. Use <a> tags for links. ONLY include fields that were provided above.
5. Each section heading: <h2> tags.
6. Experience/projects: <h3> for role/company, <ul>/<li> for bullet points.
7. For dates use <span class="date-range">dates</span> inside the <h3>.
8. Incorporate keywords from the job description naturally.
9. Keep to 1-2 pages worth of content.
10. Do NOT use any CSS or <style> tags. The parent app handles styling.
11. Do NOT use tables for layout.
12. Use the EXACT personal info values provided above. If a value says "Not provided", OMIT that field entirely.

Return a JSON object: { "html": "<the HTML content>" }`

    const response = await withModelRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    }))


    const jsonContent = cleanJson(response.candidates[0].content.parts[0].text)

    return jsonContent

}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const jsonContent = await generateResumePdfData({ resume, selfDescription, jobDescription })
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

async function generateATSResume({ resume, selfDescription, jobDescription, personalInfo }) {
    const contactBlock = personalInfo ? `
Candidate Personal Info (USE THESE EXACT VALUES):
- Full Name: ${personalInfo.fullName || 'Not provided'}
- Phone: ${personalInfo.phone || 'Not provided'}
- Email: ${personalInfo.email || 'Not provided'}
- LinkedIn: ${personalInfo.linkedin || 'Not provided'}
- GitHub: ${personalInfo.github || 'Not provided'}
- Location: ${personalInfo.location || 'Not provided'}
` : ''

    const prompt = `You are an expert resume writer specializing in ATS optimization.
${contactBlock}
Candidate Background:
- Existing Resume: ${resume || 'Not provided'}
- Self Description: ${selfDescription}
- Target Job: ${jobDescription}

IMPORTANT — HTML STRUCTURE RULES:
1. Output a FULL <html> document with embedded <style> inside <head>.
2. Single-column layout. No tables. No multi-column CSS.
3. CSS:
   - font-family: 'Segoe UI', Arial, sans-serif
   - body: max-width 720px, margin 0 auto, padding 40px, font-size 10pt, color #222
   - h1: 22pt, text-align center, margin-bottom 4px, color #000
   - Contact line: centered below h1, font-size 9pt, color #444, links in blue
   - h2: 11pt, uppercase, letter-spacing 2px, border-bottom 1.5px solid #000, padding-bottom 4px, margin-top 20px
   - h3: 11pt, font-weight 600, margin-bottom 2px
   - p, li: font-size 10pt, line-height 1.5, color #333
   - ul: padding-left 18px
   - .date-range: float right, font-weight normal, color #666
4. Sections: Name & Contact → Professional Summary → Technical Skills → Experience → Projects → Education
5. Candidate name as <h1>, contact on ONE line in <p> below it, separated by pipes. ONLY include fields with values.
6. Experience: <h3>Role — Company <span class="date-range">dates</span></h3> followed by <ul> bullets.
7. Quantify achievements. Incorporate JD keywords naturally.
8. Use the EXACT personal info provided above. If a value says "Not provided", OMIT that field.
9. Keep to 1-2 pages at A4.

Return ONLY a JSON object: { "html": "<html>...</html>" }`

    const response = await withModelRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    }))

    const jsonContent = cleanJson(response.candidates[0].content.parts[0].text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    
    return pdfBuffer
}


module.exports = {
    generateInterviewReport,
    generateResumePdf,
    generateATSResume,
    generateResumePdfData,
    generatePdfFromHtml
}