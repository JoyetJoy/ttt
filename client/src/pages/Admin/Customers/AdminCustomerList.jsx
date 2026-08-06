import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCustomerList() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter(c =>
    (c.fname && c.fname.toLowerCase().includes(search.toLowerCase())) ||
    (c.lname && c.lname.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  ) : [];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Manage Customers</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-slate-600 uppercase tracking-wider text-center">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-800">
                      {customer.fname || ''} {customer.lname || ''}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {customer.phone || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 1 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {customer.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 text-center">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <Search className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-[15px] font-medium">No customers found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
