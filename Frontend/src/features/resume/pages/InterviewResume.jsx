import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ChevronLeft, 
    Download, 
    Sparkles, 
    FileText, 
    Layout, 
    Loader2,
    Briefcase,
    User,
    Phone,
    Mail,
    MapPin,
    Link2
} from 'lucide-react'
import '../styles/interview.scss'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const InterviewResume = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [jobDescription, setJobDescription] = useState(location.state?.jobDescription || localStorage.getItem('lastJobDescription') || '')
    const [selfDescription, setSelfDescription] = useState(location.state?.selfDescription || localStorage.getItem('lastSelfDescription') || '')
    
    // Personal info fields
    const [fullName, setFullName] = useState(localStorage.getItem('resume_fullName') || '')
    const [phone, setPhoneNum] = useState(localStorage.getItem('resume_phone') || '')
    const [email, setEmail] = useState(localStorage.getItem('resume_email') || '')
    const [linkedin, setLinkedin] = useState(localStorage.getItem('resume_linkedin') || '')
    const [github, setGithub] = useState(localStorage.getItem('resume_github') || '')
    const [city, setCity] = useState(localStorage.getItem('resume_city') || '')

    const [resumeHtml, setResumeHtml] = useState(null)
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState(null)

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('lastJobDescription', jobDescription)
        localStorage.setItem('lastSelfDescription', selfDescription)
        localStorage.setItem('resume_fullName', fullName)
        localStorage.setItem('resume_phone', phone)
        localStorage.setItem('resume_email', email)
        localStorage.setItem('resume_linkedin', linkedin)
        localStorage.setItem('resume_github', github)
        localStorage.setItem('resume_city', city)
    }, [jobDescription, selfDescription, fullName, phone, email, linkedin, github, city])

    const getPersonalInfo = () => ({
        fullName: fullName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        linkedin: linkedin || undefined,
        github: github || undefined,
        location: city || undefined
    })

    const generateResumePreview = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`${API_URL}/api/interview/generate-resume-html`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    jobDescription, 
                    selfDescription,
                    personalInfo: getPersonalInfo()
                })
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.message || 'Failed to generate preview')
            setResumeHtml(result.data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        setDownloading(true)
        setError(null)
        try {
            const response = await fetch(`${API_URL}/api/interview/generate-ats-resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    jobDescription, 
                    selfDescription,
                    personalInfo: getPersonalInfo()
                })
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Download failed');
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Resume_${fullName?.replace(/\s+/g, '_') || 'ATS'}_${new Date().getTime()}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            setError(`Failed to download PDF: ${err.message}`)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <main className='resume-builder focus-mode'>
            <div className='mesh-bg'></div>

            <header className='builder-nav'>
                <div className='nav-left'>
                    <Link to="/interview-prep" className='back-link'>
                        <ChevronLeft size={18} />
                        <span>Exit Builder</span>
                    </Link>
                </div>
                
                <div className='builder-status'>
                    <div className='status-pill'>
                        <Sparkles size={14} className='icon-pink' />
                        <span>AI Optimization Active</span>
                    </div>
                </div>

                <div className='nav-right'>
                    <button 
                        className='button primary-button glow' 
                        onClick={handleDownload}
                        disabled={loading || downloading || !resumeHtml}
                    >
                        {downloading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <Loader2 size={18} />
                            </motion.div>
                        ) : (
                            <Download size={18} />
                        )}
                        <span>{downloading ? 'Exporting...' : 'Download ATS PDF'}</span>
                    </button>
                </div>
            </header>

            <div className='workspace-v4'>
                <div className='editor-panel'>
                    <div className='panel-header'>
                        <motion.div 
                            className='badge-v4'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            AI Configuration
                        </motion.div>
                        <h2 className='panel-title'>Tailor Your Resume</h2>
                        <p className='panel-subtitle'>Fill in your details and hit synthesize to generate a tailored resume.</p>
                    </div>

                    <div className='input-stack'>
                        {/* Personal Info Section */}
                        <div className='personal-info-section'>
                            <label className='section-label-v4'>
                                <User size={16} /> Personal Details
                            </label>
                            <div className='info-grid'>
                                <div className='info-field full-width'>
                                    <div className='field-icon'><User size={14} /></div>
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)} 
                                    />
                                </div>
                                <div className='info-field'>
                                    <div className='field-icon'><Phone size={14} /></div>
                                    <input 
                                        type="tel" 
                                        placeholder="+91-XXXXXXXXXX" 
                                        value={phone} 
                                        onChange={(e) => setPhoneNum(e.target.value)} 
                                    />
                                </div>
                                <div className='info-field'>
                                    <div className='field-icon'><Mail size={14} /></div>
                                    <input 
                                        type="email" 
                                        placeholder="your.email@example.com" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </div>
                                <div className='info-field'>
                                    <div className='field-icon'><Link2 size={14} /></div>
                                    <input 
                                        type="url" 
                                        placeholder="LinkedIn URL" 
                                        value={linkedin} 
                                        onChange={(e) => setLinkedin(e.target.value)} 
                                    />
                                </div>
                                <div className='info-field'>
                                    <div className='field-icon'><Link2 size={14} /></div>
                                    <input 
                                        type="url" 
                                        placeholder="GitHub URL" 
                                        value={github} 
                                        onChange={(e) => setGithub(e.target.value)} 
                                    />
                                </div>
                                <div className='info-field full-width'>
                                    <div className='field-icon'><MapPin size={14} /></div>
                                    <input 
                                        type="text" 
                                        placeholder="City, Country" 
                                        value={city} 
                                        onChange={(e) => setCity(e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='input-group'>
                            <label><Briefcase size={16} /> Job Context</label>
                            <textarea 
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job requirements here..."
                                className='v4-textarea'
                            />
                        </div>

                        <div className='input-group'>
                            <label><FileText size={16} /> Your Profile</label>
                            <textarea 
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                placeholder="Highlight your key achievements, skills, experience, projects..."
                                className='v4-textarea'
                            />
                        </div>

                        {error && (
                            <div className='error-inline'>
                                <span>{error}</span>
                            </div>
                        )}

                        <button 
                            className='button primary-button synthesize-btn'
                            onClick={generateResumePreview}
                            disabled={loading || !jobDescription || !selfDescription || !fullName}
                        >
                            {loading ? (
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles size={20} />
                                </motion.div>
                            ) : <Sparkles size={20} />}
                            <span>{resumeHtml ? "Regenerate Preview" : "Synthesize Resume"}</span>
                        </button>
                    </div>
                </div>

                <div className='preview-canvas'>
                    <AnimatePresence mode='wait'>
                        {loading && !resumeHtml ? (
                            <motion.div 
                                key="loading"
                                className='canvas-loading'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className='loader-content'>
                                    <motion.div 
                                        className='loader-visual-v4'
                                        animate={{ scale: [1, 1.1, 1], rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    >
                                        <Sparkles size={48} className='icon-orange' />
                                    </motion.div>
                                    <h3>Synthesizing Excellence</h3>
                                    <p>Aligning your profile with the job requirements...</p>
                                </div>
                            </motion.div>
                        ) : resumeHtml ? (
                            <motion.div 
                                key="preview"
                                className='resume-preview-v4'
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className='preview-status-bar'>
                                    <span className='dot-orange'></span>
                                    AI-Optimized Preview
                                </div>
                                <div className='resume-scroll-container'>
                                    <div 
                                        className='resume-html-content-v4'
                                        dangerouslySetInnerHTML={{ __html: resumeHtml }}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="empty"
                                className='empty-canvas'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Layout size={64} className='icon-orange opacity-20' />
                                <h3>Ready to Build</h3>
                                <p>Fill in your personal details, job context, and profile to generate a tailored resume.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    )
}

export default InterviewResume