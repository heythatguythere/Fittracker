import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';
import type { User as UserType } from '../../shared/types';

interface UserData extends UserType {
    workoutCount: number;
    measurementCount: number;
    dietEntryCount: number;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/admin/users', { withCredentials: true });
                setUsers(res.data);
            } catch (err) {
                setError('Failed to fetch user data. You may not have admin privileges.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return <Layout><div className="text-center p-8">Loading...</div></Layout>;
    }

    if (error) {
        return <Layout><div className="text-center p-8 text-red-500">{error}</div></Layout>;
    }

    return (
        <Layout>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-bold leading-6 text-gray-900 flex items-center">
                            <ShieldCheck className="w-8 h-8 mr-2 text-blue-600" />
                            Admin Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all the users in the system including their email, name, and activity counts.
                        </p>
                    </div>
                </div>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                </div>
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joined On</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Workouts</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Measurements</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Diet Entries</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                <div className="flex items-center">
                                                    <div className="h-11 w-11 flex-shrink-0">
                                                        <img className="h-11 w-11 rounded-full" src={user.image || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{user.displayName || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{user.email}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{new Date(user.createdAt || 0).toLocaleDateString()}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 text-center">{user.workoutCount}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 text-center">{user.measurementCount}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 text-center">{user.dietEntryCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}