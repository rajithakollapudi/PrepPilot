import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Sparkles, 
    Zap, 
    Target, 
    ChevronRight,
    LogOut,
    ArrowUpRight,
    Layout,
    Briefcase,
    TrendingUp,
    Brain,
    FileText,
    BarChart3,
    Users,
    Shield,
    Cpu
} from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import '../style/landing.scss'

const TypingText = ({ texts, speed = 80, pause = 2000 }) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [displayText, setDisplayText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const currentFullText = texts[currentTextIndex]
        const isFinishedTyping = !isDeleting && displayText.length === currentFullText.length
        
        const timeoutDuration = isFinishedTyping ? pause : (isDeleting ? speed / 2 : speed)

        const timer = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentFullText.length) {
                    setDisplayText(currentFullText.slice(0, displayText.length + 1))
                } else {
                    setIsDeleting(true)
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(currentFullText.slice(0, displayText.length - 1))
                } else {
                    setIsDeleting(false)
                    setCurrentTextIndex((prev) => (prev + 1) % texts.length)
                }
            }
        }, timeoutDuration)

        return () => clearTimeout(timer)
    }, [displayText, isDeleting, currentTextIndex, texts, speed, pause])

    return (
        <span className='typing-text'>
            {displayText}
            <span className='cursor-blink'>|</span>
        </span>
    )
}

const CountUp = ({ target, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const increment = target / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 16)
        return () => clearInterval(timer)
    }, [target, duration])

    return <span>{count}{suffix}</span>
}

const typingPhrases = [
    'Ace your next interview',
    'Build ATS-perfect resumes',
    'Discover dream job matches',
    'Close every skill gap'
]

const Landing = () => {
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
        }
    }

    const floatVariants = {
        animate: {
            y: [0, -15, 0],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
    }

    return (
        <main className='landing-v3'>
            <div className='mesh-bg-v3'></div>

            {/* Floating particles */}
            <div className='particles'>
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className='particle'
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.sin(i) * 50, 0],
                            opacity: [0.2, 0.6, 0.2]
                        }}
                        transition={{
                            duration: 6 + i * 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.8
                        }}
                        style={{
                            left: `${15 + i * 14}%`,
                            top: `${30 + (i % 3) * 20}%`
                        }}
                    />
                ))}
            </div>
            
            <div className='landing-wrapper'>
                {/* Navbar */}
                <motion.nav 
                    className='landing-nav'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className='nav-brand'>
                        <Cpu size={22} className='brand-icon' />
                        <span className='brand-name'>Prep<span className='brand-u'>Pilot</span></span>
                    </div>
                    <div className='nav-actions'>
                        {user ? (
                            <>
                                <button 
                                    className='button primary-button nav-btn'
                                    onClick={() => navigate('/interview-prep')}
                                >
                                    Dashboard <ChevronRight size={16} />
                                </button>
                                <button 
                                    className='button ghost-btn logout-btn'
                                    onClick={async () => {
                                        await handleLogout()
                                        navigate('/')
                                    }}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    className='button ghost-btn'
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </button>
                                <button 
                                    className='button primary-button nav-btn'
                                    onClick={() => navigate('/register')}
                                >
                                    Get Started <ArrowUpRight size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </motion.nav>

                {/* Hero */}
                <motion.section 
                    className='hero-centered'
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    <motion.div className='pre-title' variants={itemVariants}>
                        <Sparkles size={16} />
                        <span>Powered by GenAI</span>
                    </motion.div>

                    <motion.h1 className='hero-title-v3' variants={itemVariants}>
                        The <span className='hero-u'>U</span>ltimate way to <br />
                        <span className='highlight-orange'>Master your Career</span>
                    </motion.h1>

                    <motion.div className='hero-typing-wrap' variants={itemVariants}>
                        <TypingText texts={typingPhrases} speed={70} pause={1800} />
                    </motion.div>

                    <motion.p className='hero-subtitle-v3' variants={itemVariants}>
                        PrepPilot is your AI-powered career copilot. Get instant interview analysis,
                        ATS-perfect resumes, skill gap detection, and curated job matches — 
                        everything you need to land your dream role, in one place.
                    </motion.p>

                    <motion.div className='cta-group-v3' variants={itemVariants}>
                        {user ? (
                            <button 
                                className='button primary-button large'
                                onClick={() => navigate('/interview-prep')}
                            >
                                <span>Go to Dashboard</span>
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <>
                                <button 
                                    className='button primary-button large'
                                    onClick={() => navigate('/register')}
                                >
                                    <span>Start for Free</span>
                                    <ChevronRight size={20} />
                                </button>
                                <button 
                                    className='button secondary-button-v3 large'
                                    onClick={() => navigate('/login')}
                                >
                                    <span>Sign In</span>
                                    <ArrowUpRight size={20} />
                                </button>
                            </>
                        )}
                    </motion.div>

                    {/* Stats bar */}
                    <motion.div className='stats-bar' variants={itemVariants}>
                        <div className='stat-item'>
                            <span className='stat-value'><CountUp target={10} suffix='K+' /></span>
                            <span className='stat-label'>Reports Generated</span>
                        </div>
                        <div className='stat-divider' />
                        <div className='stat-item'>
                            <span className='stat-value'><CountUp target={95} suffix='%' /></span>
                            <span className='stat-label'>ATS Pass Rate</span>
                        </div>
                        <div className='stat-divider' />
                        <div className='stat-item'>
                            <span className='stat-value'><CountUp target={50} suffix='+' /></span>
                            <span className='stat-label'>Skills Analyzed</span>
                        </div>
                    </motion.div>

                    {/* Preview window */}
                    <motion.div 
                        className='hero-preview-v3' 
                        variants={itemVariants}
                    >
                        <motion.div 
                            className='preview-canvas-v3'
                            animate="animate"
                            variants={floatVariants}
                        >
                            <div className='preview-nav'>
                                <div className='dots'><span></span><span></span><span></span></div>
                                <div className='url-bar'>https://preppilot.app/</div>
                            </div>
                            <div className='preview-content'>
                                <div className='skeleton-line'></div>
                                <div className='skeleton-line short'></div>
                                <div className='skeleton-grid'>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.section>

                {/* How It Works */}
                <section className='how-it-works'>
                    <motion.div 
                        className='section-header'
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>How Prep<span className='brand-u'>Pilot</span> Works</h2>
                        <p>Three simple steps to career acceleration</p>
                    </motion.div>
                    <div className='steps-grid'>
                        {[
                            { num: '01', title: 'Describe Yourself', desc: 'Paste a job description and tell us about your skills, experience, and career goals.', icon: <FileText /> },
                            { num: '02', title: 'AI Analysis', desc: 'Our Gemini-powered engine generates a full interview report, skill gap analysis, and tailored questions.', icon: <Brain /> },
                            { num: '03', title: 'Get Results', desc: 'Download PDF reports, build ATS resumes, and discover matched job opportunities — all instantly.', icon: <BarChart3 /> }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                className='step-card'
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.2 }}
                            >
                                <div className='step-num'>{step.num}</div>
                                <div className='step-icon'>{step.icon}</div>
                                <h4>{step.title}</h4>
                                <p>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Features / Benefits */}
                <section className='benefits-v3'>
                    <motion.div 
                        className='section-header'
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>Built for Modern Job Seekers</h2>
                        <p>Every tool you need, intelligently integrated</p>
                    </motion.div>
                    <div className='benefits-grid-v3'>
                        {[
                            { 
                                icon: <Zap />, 
                                title: 'Instant Analysis', 
                                desc: 'Get a full breakdown of your interview performance in seconds.' 
                            },
                            { 
                                icon: <Target />, 
                                title: 'Tailored Strategy', 
                                desc: 'Every response is custom-built for the specific role and company you target.' 
                            },
                            { 
                                icon: <Briefcase />, 
                                title: 'Job Matching', 
                                desc: 'Discover hidden opportunities that perfectly align with your AI-generated profile.' 
                            },
                            { 
                                icon: <Layout />, 
                                title: 'ATS Perfection', 
                                desc: 'Resumes that pass every automated check and catch every human eye.' 
                            },
                            { 
                                icon: <TrendingUp />, 
                                title: 'Skill Gap Radar', 
                                desc: "Identify precisely what you're missing and how to close the gap." 
                            },
                            { 
                                icon: <Shield />, 
                                title: 'PDF Reports', 
                                desc: 'Download comprehensive, beautifully formatted interview reports as PDF.' 
                            }
                        ].map((b, i) => (
                            <motion.div
                                key={i}
                                className='benefit-card-v3'
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                            >
                                <div className='benefit-icon-v3'>{b.icon}</div>
                                <h4>{b.title}</h4>
                                <p>{b.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* About the project */}
                <section className='about-project'>
                    <motion.div
                        className='about-content'
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className='about-badge'>
                            <Cpu size={14} />
                            <span>About PrepPilot</span>
                        </div>
                        <h2>AI-First Career Intelligence</h2>
                        <p>
                            PrepPilot leverages Google's Gemini AI to provide deep, contextual interview preparation
                            tailored to your unique skills and target roles. Built with a modern MERN stack and 
                            Redis-powered caching, the platform delivers lightning-fast analysis, real-time job 
                            matching via Apify, and ATS-optimized resume generation — all through a sleek, 
                            responsive interface designed for the next generation of job seekers.
                        </p>
                        <div className='tech-pills'>
                            {['React', 'Node.js', 'MongoDB', 'Redis', 'Gemini AI', 'Apify', 'Puppeteer', 'SCSS'].map((tech, i) => (
                                <motion.span 
                                    key={i} 
                                    className='tech-pill'
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    {tech}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Footer */}
                <footer className='landing-footer'>
                    <div className='footer-brand'>
                        <Cpu size={18} className='brand-icon' />
                        <span>Prep<span className='brand-u'>Pilot</span></span>
                    </div>
                    <p className='footer-credit'>Made by <span className='credit-name'>Ankur Bag</span></p>
                    <p className='footer-copy'>© {new Date().getFullYear()} PrepPilot. All rights reserved.</p>
                </footer>
            </div>
        </main>
    )
}

export default Landing
