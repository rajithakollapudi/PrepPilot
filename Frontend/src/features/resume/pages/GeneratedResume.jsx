import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import '../styles/resume.scss'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const GeneratedResume = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('resume')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [interviewData, setInterviewData] = useState(null)

    useEffect(() => {
        const generateReport = async () => {
            try {
                setLoading(true)
                const { jobDescription, selfDescription, resumeData } = location.state || {}

                if (!jobDescription || !selfDescription) {
                    throw new Error('Missing job description or interview responses')
                }

                // Call backend to generate interview report
                const formData = new FormData()
                formData.append('jobDescription', jobDescription)
                formData.append('selfDescription', selfDescription)

                // If resume file exists from earlier step, append it
                if (resumeData instanceof File) {
                    formData.append('resume', resumeData)
                }

                const response = await fetch(`${API_URL}/api/interview`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                })

                if (!response.ok) {
                    throw new Error('Failed to generate interview report')
                }

                const result = await response.json()
                setInterviewData(result.interviewReport)
            } catch (err) {
                console.error('Error generating report:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        generateReport()
    }, [location.state])

    // Fallback data structure
    const resumeData = interviewData?.resumeData || {
        name: 'Generated Resume',
        email: 'user@example.com',
        phone: 'N/A',
        summary: interviewData?.summary || 'Resume generated from interview responses',
        experience: interviewData?.experience || [],
        skills: interviewData?.skills || [],
        education: interviewData?.education || []
    }

    const behavioralAnalysis = interviewData?.behavioralAnalysis || [
        { skill: 'Communication', score: 0, feedback: 'Loading...' },
        { skill: 'Problem Solving', score: 0, feedback: 'Loading...' },
        { skill: 'Team Collaboration', score: 0, feedback: 'Loading...' },
        { skill: 'Leadership', score: 0, feedback: 'Loading...' }
    ]

    const technicalAnalysis = interviewData?.technicalAnalysis || [
        { skill: 'Core Competencies', score: 0, feedback: 'Loading...' },
        { skill: 'Advanced Concepts', score: 0, feedback: 'Loading...' },
        { skill: 'Practical Application', score: 0, feedback: 'Loading...' },
        { skill: 'Code Quality', score: 0, feedback: 'Loading...' }
    ]

    const handleDownload = (format) => {
        alert(`Downloading resume as ${format}`)
    }

    if (loading) {
        return (
            <main className='generated-resume'>
                <div className='resume-container'>
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#a3a3a3' }}>
                        <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Generating Your Resume...</h2>
                        <p>Our AI is analyzing your interview responses and creating your professional resume.</p>
                    </div>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className='generated-resume'>
                <div className='resume-container'>
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#ff6b00' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Error Generating Resume</h2>
                        <p>{error}</p>
                        <button className='button primary-button' onClick={() => navigate('/resume')} style={{ marginTop: '1rem' }}>
                            Try Again
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className='generated-resume'>
            <div className='resume-container'>
                <div className='resume-tabs'>
                    <button
                        className={`tab-button ${activeTab === 'resume' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resume')}
                    >
                        📄 Generated Resume
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'behavioral' ? 'active' : ''}`}
                        onClick={() => setActiveTab('behavioral')}
                    >
                        🎯 Behavioral Analysis
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'technical' ? 'active' : ''}`}
                        onClick={() => setActiveTab('technical')}
                    >
                        ⚙️ Technical Analysis
                    </button>
                </div>

                {activeTab === 'resume' && (
                    <div className='resume-content'>
                        <div className='resume-header'>
                            <h1>{resumeData.name}</h1>
                            <div className='contact-info'>
                                <a href={`mailto:${resumeData.email}`}>{resumeData.email}</a>
                                <span>{resumeData.phone}</span>
                            </div>
                        </div>

                        <div className='resume-section'>
                            <h2>Professional Summary</h2>
                            <p>{resumeData.summary}</p>
                        </div>

                        <div className='resume-section'>
                            <h2>Experience</h2>
                            {resumeData.experience.map((exp, idx) => (
                                <div key={idx} className='experience-item'>
                                    <div className='exp-header'>
                                        <h3>{exp.title}</h3>
                                        <span className='duration'>{exp.duration}</span>
                                    </div>
                                    <p className='company'>{exp.company}</p>
                                    <ul>
                                        {exp.points.map((point, pidx) => (
                                            <li key={pidx}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className='resume-section two-col'>
                            <div>
                                <h2>Skills</h2>
                                <div className='skills-list'>
                                    {resumeData.skills.map((skill, idx) => (
                                        <span key={idx} className='skill-badge'>{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h2>Education</h2>
                                {resumeData.education.map((edu, idx) => (
                                    <div key={idx} className='education-item'>
                                        <h3>{edu.degree}</h3>
                                        <p>{edu.school}</p>
                                        <p className='year'>{edu.year}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='download-section'>
                            <button className='button primary-button' onClick={() => handleDownload('PDF')}>
                                📥 Download as PDF
                            </button>
                            <button className='button secondary-button' onClick={() => handleDownload('DOCX')}>
                                📥 Download as DOCX
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'behavioral' && (
                    <div className='analysis-content'>
                        <h2>Behavioral & Soft Skills Analysis</h2>
                        <p className='analysis-description'>
                            Separate evaluation of your communication, teamwork, leadership, and interpersonal skills based on your interview responses.
                        </p>
                        <div className='analysis-grid'>
                            {behavioralAnalysis.map((item, idx) => (
                                <div key={idx} className='analysis-card'>
                                    <div className='card-header'>
                                        <h3>{item.skill}</h3>
                                        <div className='score-badge'>{item.score}%</div>
                                    </div>
                                    <div className='score-bar'>
                                        <div className='score-fill' style={{ width: `${item.score}%` }}></div>
                                    </div>
                                    <p className='feedback'>{item.feedback}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'technical' && (
                    <div className='analysis-content'>
                        <h2>Technical Skills Analysis</h2>
                        <p className='analysis-description'>
                            Comprehensive evaluation of your technical knowledge, problem-solving approach, and code quality based on your responses.
                        </p>
                        <div className='analysis-grid'>
                            {technicalAnalysis.map((item, idx) => (
                                <div key={idx} className='analysis-card'>
                                    <div className='card-header'>
                                        <h3>{item.skill}</h3>
                                        <div className='score-badge'>{item.score}%</div>
                                    </div>
                                    <div className='score-bar'>
                                        <div className='score-fill' style={{ width: `${item.score}%` }}></div>
                                    </div>
                                    <p className='feedback'>{item.feedback}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className='action-footer'>
                    <button className='button secondary-button' onClick={() => navigate('/resume')}>
                        ← Start New Interview
                    </button>
                    <button className='button primary-button' onClick={() => navigate('/')}>
                        Home
                    </button>
                </div>
            </div>
        </main>
    )
}

export default GeneratedResume