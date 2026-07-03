const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const { suggestJobsController } = require('../controllers/jobs.controller')

const jobsRouter = express.Router()

/**
 * @route POST /api/jobs/suggest
 * @description Suggest relevant jobs based on candidate's self description
 * @access private
 */
jobsRouter.post('/suggest', authMiddleware.authUser, suggestJobsController)

module.exports = jobsRouter
