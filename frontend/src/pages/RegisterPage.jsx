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
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                />

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                />

                <label htmlFor="password_confirm">Confirm password</label>
                <input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    value={form.password_confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                />

                <button type="submit" disabled={submitting}>
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