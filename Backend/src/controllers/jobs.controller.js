const { suggestJobs } = require('../services/jobs.service')

/**
 * @description Suggest relevant jobs based on the user's self description
 * @input req.body.selfDescription
 * @output { searchQuery, skills, jobs: [{ title, company, location, description, applyLink, matchScore }] }
 */
async function suggestJobsController(req, res) {
    try {
        const { selfDescription } = req.body

        if (!selfDescription || selfDescription.trim().length < 20) {
            return res.status(400).json({
                message: 'Please provide a detailed self description (at least 20 characters)'
            })
        }

        const result = await suggestJobs(selfDescription)

        res.status(200).json({
            message: 'Job suggestions generated successfully',
            data: result
        })
    } catch (error) {
        console.error('[Jobs Controller] Error:', error.message)
        res.status(500).json({
            message: 'Failed to suggest jobs',
            error: error.message
        })
    }
}

module.exports = { suggestJobsController }
