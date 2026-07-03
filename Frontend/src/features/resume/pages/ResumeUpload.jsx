import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import '../styles/resume.scss'

const ResumeUpload = () => {
    const navigate = useNavigate()
    const [resume, setResume] = useState(null)
    const [resumeName, setResumeName] = useState('No file selected')

    const handleResumeSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setResume(file)
            setResumeName(file.name)
        }
    }

    const handleStartInterview = () => {
        if (resume) {
            navigate('/interview-resume', { state: { resumeData: resume } })
        }
    }

    return (
        <main className='resume-upload'>
            <div className='upload-container'>
                <div className='upload-header'>
                    <h1>AI Resume Generation</h1>
                    <p>Upload your resume to get started with our AI-powered interview and enhancement system</p>
                </div>

                <div className='upload-section'>
                    <div className='upload-box'>
                        <svg className='upload-icon' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
                        </svg>
                        <h3>Upload Your Resume</h3>
                        <p>Drag and drop or click to select PDF</p>
                        <input
                            type='file'
                            accept='.pdf'
                            onChange={handleResumeSelect}
                            id='resume-input'
                            hidden
                        />
                        <label htmlFor='resume-input' className='upload-label'>
                            Choose File
                        </label>
                    </div>

                    {resume && (
                        <div className='file-preview'>
                            <div className='file-info'>
                                <svg fill='currentColor' viewBox='0 0 20 20'>
                                    <path fillRule='evenodd' d='M8 16.5a1 1 0 01-1-1V9.707l-1.146 1.147a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L9 9.707V15.5a1 1 0 01-1 1z' clipRule='evenodd' />
                                </svg>
                                <div>
                                    <p className='file-name'>{resumeName}</p>
                                    <p className='file-size'>{(resume.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button className='button secondary-button' onClick={() => { setResume(null); setResumeName('No file selected') }}>
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                <div className='features-grid'>
                    <div className='feature-card'>
                        <div className='feature-icon'>✨</div>
                        <h4>Automatic Resume Generation</h4>
                        <p>Get a professionally formatted resume based on your interview performance</p>
                    </div>
                    <div className='feature-card'>
                        <div className='feature-icon'>📊</div>
                        <h4>Behavioral & Technical Analysis</h4>
                        <p>Separate evaluation of your technical skills and soft skills</p>
                    </div>
                    <div className='feature-card'>
                        <div className='feature-icon'>⚡</div>
                        <h4>Real-Time Feedback</h4>
                        <p>Get instant suggestions during the interview to improve on the go</p>
                    </div>
                    <div className='feature-card'>
                        <div className='feature-icon'>📥</div>
                        <h4>Export & Download</h4>
                        <p>Download your interview report and generated resume in PDF/DOCX format</p>
                    </div>
                </div>

                <button
                    className='button primary-button large'
                    onClick={handleStartInterview}
                    disabled={!resume}
                >
                    Start Interview & Generate Resume
                </button>
            </div>
        </main>
    )
}

export default ResumeUpload