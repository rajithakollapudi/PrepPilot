import React, { useState } from 'react'
import '../auth.form.scss'
import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/interview-prep')
    }

    // Loading state is handled inside the form for smoother transition

    return (
        <main className='auth-page'>
            <div className='mesh-bg'></div>
            <motion.div 
                className='form-container'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className='auth-header'>
                    <h1 className='home-title'>Welcome <span className='highlight'>Back</span></h1>
                    <p className='home-subtitle'>Continue your journey to career mastery.</p>
                </div>
                <form onSubmit={handleSubmit} className='auth-form'>
                    <div className="input-group">
                        <label htmlFor='email'>Email Address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            name='email'
                            placeholder='name@company.com'
                            value={email}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor='password'>Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name='password'
                            placeholder='••••••••'
                            value={password}
                            required
                        />
                    </div>

                    <button className='button primary-button' type='submit' disabled={loading}>
                       {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <p className='auth-footer'>
                    Don't have an account? <Link to="/register" className='highlight'>Register</Link>
                </p>
            </motion.div>
        </main>
    )
}

export default Login
