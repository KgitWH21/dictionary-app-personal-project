import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

const App = () => {
    const { user, loading, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    if (loading) return <p className="p-8">Loading...</p>

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="flex items-center justify-between border-b bg-white px-6 py-3">
                <Link to={user ? '/home' : '/'} className='font-bold'>
                  Hayden's Dictionary App
                </Link>

                {user && (
                    <nav className="flex items-center gap-3">
                        <span>{user.username}</span>
                        <button
                          onClick={handleLogout}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          Log out
                        </button>
                    </nav>
                )}
            </header>
            <main className="mx-auto max-w-3xl p-6">
                <Outlet />
            </main>
        </div>
    )


}

export default App
