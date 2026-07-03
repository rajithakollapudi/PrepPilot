const pdfParse = require("pdf-parse")
const { 
    generateInterviewReport, 
    generateATSResume, 
    generateResumePdfData 
} = require("../services/ai.service")
const { suggestJobs } = require("../services/jobs.service")

const interviewReportModel = require("../models/interviewReport.model")




const crypto = require("crypto")
const redis = require("../config/redis.config")

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterviewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body
        const userId = req.user.id
        let resumeText = ""

        if (req.file?.buffer) {
            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = resumeContent.text
        }

        // 1. Generate hash for caching AI response
        const hash = crypto.createHash("md5").update(`${jobDescription}:${selfDescription}:${resumeText}`).digest("hex")
        const cacheKey = `cache:interview-report:${hash}`
        const cachedReport = await redis.get(cacheKey)

        let interviewReport

        if (cachedReport) {
            console.log("Returning cached interview report")
            const reportData = JSON.parse(cachedReport)
            
            interviewReport = await interviewReportModel.create({
                user: userId,
                resume: resumeText,
                selfDescription,
                jobDescription,
                ...reportData
            })
        } else {
            console.log("Generating new interview report via AI")
            const interviewReportByAi = await generateInterviewReport({
                resume: resumeText,
                selfDescription,
                jobDescription
            })

            interviewReport = await interviewReportModel.create({
                user: userId,
                resume: resumeText,
                selfDescription,
                jobDescription,
                ...interviewReportByAi
            })

            // Cache the AI result for 24 hours
            await redis.set(cacheKey, JSON.stringify(interviewReportByAi), "EX", 86400)
        }

        // 2. Fetch job suggestions and attach to the report
        try {
            const jobResult = await suggestJobs(selfDescription)
            if (jobResult.jobs && jobResult.jobs.length > 0) {
                interviewReport.jobs = jobResult.jobs
                await interviewReport.save()
            }
        } catch (jobErr) {
            console.error("Failed to fetch job suggestions for report:", jobErr.message)
        }

        // 3. Persist latest report ID for the user in Redis (Active Session)
        const latestKey = `interview:latest:${userId}`
        await redis.set(latestKey, interviewReport._id.toString(), "EX", 86400 * 7) // 7 days

        res.status(201).json({
            message: "Interview report generated successfully.",
            data: {
                ...interviewReport.toObject(),
                roleFit: interviewReport.matchScore
            }
        })
    } catch (error) {
        if (error?.isModelBusy) {
            console.error("Model busy while generating interview report:", error.message)
            return res.status(503).json({
                message: error.userMessage || "AI service is temporarily busy. Please try again shortly.",
                error: error.message
            })
        }

        console.error("Error generating interview report:", error);
        res.status(400).json({
            message: "Failed to generate interview report",
            error: error.message
        })
    }
}

/**
 * @description Controller to generate ATS-friendly resume
 */
async function generateATSResumeController(req, res) {
    try {
        const { selfDescription, jobDescription, personalInfo } = req.body
        let resumeText = ""

        if (req.file?.buffer) {
            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = resumeContent.text
        }

        const pdfBuffer = await generateATSResume({
            resume: resumeText,
            selfDescription,
            jobDescription,
            personalInfo
        })

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename="ATS_Resume.pdf"')
        res.send(pdfBuffer)
    } catch (error) {
        if (error?.isModelBusy) {
            console.error("Model busy while generating ATS resume:", error.message)
            return res.status(503).json({
                message: error.userMessage || "AI service is temporarily busy. Please try again shortly.",
                error: error.message
            })
        }

        console.error("Error generating ATS resume:", error.message)
        res.status(500).json({
            message: "Failed to generate ATS resume",
            error: error.message
        })
    }
}

/**
 * @description Controller to generate HTML resume for preview
 */
async function generateResumeHtmlController(req, res) {
    try {
        const { selfDescription, jobDescription, personalInfo } = req.body
        let resumeText = ""

        if (req.file?.buffer) {
            const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
            resumeText = resumeContent.text
        }

        const resumeData = await generateResumePdfData({
            resume: resumeText,
            selfDescription,
            jobDescription,
            personalInfo
        })

        res.status(200).json({
            message: "Resume HTML generated successfully.",
            data: resumeData.html
        })
    } catch (error) {
        console.error("Error generating resume HTML:", error.message)
        res.status(500).json({
            message: "Failed to generate resume HTML",
            error: error.message
        })
    }
}

const reportTemplate = require("../templates/report.template")
const { generatePdfFromHtml } = require("../services/ai.service")

/**
 * @description Controller to download interview report as PDF
 */
async function downloadInterviewReportController(req, res) {
    try {
        const { id } = req.params
        const report = await interviewReportModel.findById(id)

        if (!report) {
            return res.status(404).json({ message: "Report not found" })
        }

        // We need to fetch jobs if they aren't in the report model
        // Assuming they might be passed from frontend or we just use what's in DB
        const html = reportTemplate(report)
        const pdfBuffer = await generatePdfFromHtml(html)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="Interview_Report_${id}.pdf"`)
        res.send(pdfBuffer)
    } catch (error) {
        console.error("Error downloading report:", error)
        res.status(500).json({ message: "Failed to download report", error: error.message })
    }
}

/**
 * @description Controller to get the latest interview report for a user
 */
async function getLatestInterviewReportController(req, res) {
    try {
        const userId = req.user.id
        const latestKey = `interview:latest:${userId}`
        
        let reportId = await redis.get(latestKey)
        let report

        if (reportId) {
            report = await interviewReportModel.findById(reportId)
        }

        if (!report) {
            // Fallback to latest in DB if Redis key expired or missed
            report = await interviewReportModel.findOne({ user: userId }).sort({ createdAt: -1 })
            if (report) {
                // Re-sync with Redis
                await redis.set(latestKey, report._id.toString(), "EX", 86400 * 7)
            }
        }

        if (!report) {
            return res.status(404).json({ message: "No recent reports found" })
        }

        res.status(200).json({
            message: "Latest report retrieved successfully",
            data: {
                ...report.toObject(),
                roleFit: report.matchScore
            }
        })
    } catch (error) {
        console.error("Error fetching latest report:", error)
        res.status(500).json({ message: "Failed to fetch latest report", error: error.message })
    }
}

module.exports = {
    generateInterviewReportController,
    generateATSResumeController,
    generateResumeHtmlController,
    downloadInterviewReportController,
    getLatestInterviewReportController
}