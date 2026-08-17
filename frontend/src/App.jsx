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
        <div>
            <header>
                <Link to={user ? '/home' : '/'}>
                  Hayden's Dictionary App
                </Link>

                {user && (
                    <nav>
                        <span>{user.username}</span>
                        <button
                          onClick={handleLogout}
                          >
                          Log out
                        </button>
                    </nav>
                )}
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )


}

export default App
