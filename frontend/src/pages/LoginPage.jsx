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
        <div className="mx-auto max-w-sm p-6">
            <h1 className="mb-4 text-2xl font-bold">Login</h1>
            <form onSubmit={handleSubmit} className="rounded border border-slate-300 bg-white p-4">
                <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                <input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  data-cy="login-username"
                />
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <input 
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  data-cy="login-password"
                />

                <button type="submit" disabled={submitting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" data-cy="login-submit">
                    {submitting ? 'Logging in...' : 'Log in'}
                </button>
            </form>
            <p>
                No account? <Link 
                                to="/register" 
                                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                            >
                                Register
                            </Link>
            </p>
        </div>
    )
}

export default LoginPage