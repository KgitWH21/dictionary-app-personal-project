import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RegisterPage = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()
    
    //reads the latest state to update the form
    const handleChange = (event) => {
        const { name, value } = event.target 
        setForm((prev) => ({...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        const user = await register(form)
        setSubmitting(false)
        if (user) navigate('/home')
    }
    
    // used four form fields 
    return (
        <div className="mx-auto max-w-sm p-6">
            <h1 className="mb-4 text-2xl font-bold">Register</h1>

            <form onSubmit={handleSubmit} className="rounded border border-slate-300 bg-white p-4">
                <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
                <input
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    data-cy="register-username"
                />

                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    data-cy="register-email"
                />

                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    data-cy="register-password"
                />

                <label htmlFor="password_confirm" className="block text-sm font-medium mb-1">Confirm password</label>
                <input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    value={form.password_confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    data-cy="register-password-confirm"
                />

                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  data-cy="register-submit"
                  >
                    {submitting ? 'Creating account…' : 'Register'}
                </button>
            </form>
            <p>
                Already have an account? <Link to="/">Log in</Link>
            </p>
        </div>
    )
}

export default RegisterPage