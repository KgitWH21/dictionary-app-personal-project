import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] =useState('')
    const [submitting, setSubmitting] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        const user = await login(username, password)
        setSubmitting(false)
        if (user) navigate('/home')
    }
    
    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
                <label htmlFor="password">Password</label>
                <input 
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Log in'}
                </button>
            </form>
            <p>
                No account? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}

export default LoginPage