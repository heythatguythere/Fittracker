import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { LayoutDashboard, Dumbbell, Scale, Utensils, Users, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Measurements', href: '/measurements', icon: Scale },
    { name: 'Diet', href: '/diet', icon: Utensils },
    { name: 'Friends', href: '/friends', icon: Users },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200`}>
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
                <div className="p-6 text-2xl font-bold text-blue-600 dark:text-blue-400">FitTracker</div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                     <button onClick={toggleTheme} className="w-full flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        {isDarkMode ? <Sun className="h-5 w-5 mr-3" /> : <Moon className="h-5 w-5 mr-3" />}
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 mt-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50">
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}