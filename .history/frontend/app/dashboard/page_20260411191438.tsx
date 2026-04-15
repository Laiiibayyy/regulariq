'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { businessAPI, complianceAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface DashboardData {
  business: any;
  complianceScore: number;
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
  items: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await businessAPI.dashboard();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (itemId: string) => {
    try {
      await complianceAPI.markComplete(itemId);
      toast.success('Requirement marked as complete!');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">RegularIQ</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {data?.business?.businessName}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Compliance Score</h2>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-blue-600">
              {Math.round(data?.complianceScore || 0)}%
            </div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${data?.complianceScore || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">{data?.stats.total}</div>
            <div className="text-gray-600">Total Requirements</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {data?.stats.completed}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {data?.stats.pending}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
        </div>

        {/* Requirements List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium">All Requirements</h2>
          </div>
          <div className="divide-y">
            {data?.items?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No requirements found. Complete onboarding to see your requirements.
              </div>
            ) : (
              data?.items?.map((item: any) => (
                <div key={item._id} className="p-6 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.regulationId?.title || 'Requirement'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.regulationId?.plainEnglish || 'No description available'}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          item.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                  {item.status !== 'verified' && (
                    <button
                      onClick={() => handleMarkComplete(item._id)}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}