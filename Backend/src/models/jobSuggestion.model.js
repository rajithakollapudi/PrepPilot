const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    description: String,
    applyLink: String,
    matchScore: { type: Number, default: 0 }
})

const jobSuggestionSchema = new mongoose.Schema({
    searchQuery: { type: String, required: true, index: true },
    location: { type: String, default: 'India' },
    jobs: [jobSchema],
    createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL: 24 hours
})

module.exports = mongoose.model('JobSuggestion', jobSuggestionSchema)
