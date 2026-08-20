import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Eye, Search, TrendingUp, Users, UserCheck, CreditCard, DollarSign } from 'lucide-react';
const CardBgSvg = () => (
  <svg width="74" height="78" viewBox="0 0 74 78" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-4 bottom-0 opacity-100 text-slate-200 w-24 h-24">
    <g>
      <path d="M12.5819 0.196815C11.006 0.57048 9.38137 1.88643 8.71527 3.31609C8.42284 3.96594 8.40659 4.64828 8.40659 21.4956V39.0091H4.5075H0.608398V46.8073V54.6055H37H73.3915V46.8073V39.0091H69.4924H65.5934L65.5609 21.7393L65.5121 4.48582L64.976 3.39732C64.3424 2.11387 63.4813 1.30156 62.0354 0.60297L60.9632 0.0993385L37.0812 0.0668449C23.5643 0.0668449 12.9393 0.115585 12.5819 0.196815ZM18.463 3.2836C18.0406 5.11943 16.546 6.90651 14.6127 7.88129C13.6054 8.38492 11.8345 8.93729 11.2172 8.95354C10.9248 8.95354 10.941 5.50933 11.2334 4.68078C11.8021 3.10489 12.9555 2.68249 16.7897 2.63375L18.6092 2.6175L18.463 3.2836ZM52.8238 3.91721C52.9863 4.68078 53.4087 5.83426 53.8473 6.71156C55.3257 9.66837 58.3963 12.0566 61.5968 12.7714L62.8315 13.0476V32.4456V51.8436H58.2013C55.6507 51.8436 53.5711 51.8111 53.5711 51.7786C53.5711 51.7461 53.9123 51.2263 54.3185 50.6089C55.9106 48.2207 57.0803 45.3614 57.5515 42.6157C57.8764 40.8124 57.8601 37.1733 57.5515 35.3374C57.0641 32.6243 55.8943 29.7325 54.2535 27.2306C53.295 25.7684 50.2569 22.7303 48.7298 21.7393C45.0581 19.3024 41.4352 18.2139 37 18.2139C32.5972 18.2139 28.9418 19.3024 25.2215 21.7556C23.7593 22.7141 20.705 25.7684 19.7302 27.2468C18.1056 29.7325 16.9359 32.6081 16.4485 35.3374C16.1398 37.1733 16.1236 40.8124 16.4485 42.632C16.9196 45.3289 18.1056 48.2694 19.6815 50.6089C20.0876 51.2263 20.4288 51.7461 20.4288 51.7786C20.4288 51.8111 18.3168 51.8436 15.7174 51.8436H11.006V31.7957V11.7479L11.9483 11.6342C12.4519 11.5692 13.4267 11.3417 14.0928 11.1305C17.7969 9.94456 20.4126 7.24768 21.1761 3.78724L21.4361 2.6175H36.9837H52.5476L52.8238 3.91721ZM60.7195 3.05615C61.5968 3.44606 62.4253 4.33961 62.669 5.16816C62.7828 5.52558 62.8315 6.71156 62.799 8.01126L62.7503 10.237L61.5643 9.83083C58.4288 8.77483 56.2518 6.35414 55.4557 3.03991L55.342 2.56877L57.6652 2.65C59.5173 2.71498 60.1346 2.79622 60.7195 3.05615ZM38.9495 21.0407C39.6156 21.0895 40.8503 21.3169 41.6951 21.5444C47.82 23.2015 52.7588 28.1403 54.4809 34.3302C55.082 36.5072 55.212 40.2113 54.7409 42.4208C54.0748 45.5726 52.7588 48.3019 50.7443 50.7064L49.7858 51.8436H37H24.2142L23.2881 50.7389C21.4686 48.6106 20.2339 46.1899 19.4215 43.2818C19.1129 42.1933 19.0641 41.576 19.0641 39.0091C19.0479 36.2147 19.0804 35.8898 19.4865 34.4114C21.2574 28.0916 26.1637 23.1852 32.4023 21.5281C33.8807 21.122 36.3989 20.8133 37.3249 20.9108C37.5523 20.9433 38.2834 20.992 38.9495 21.0407ZM8.40659 46.8073V52.0061H5.88843H3.37026V46.8073V41.6085H5.88843H8.40659V46.8073ZM70.6297 46.8073V52.0061H68.1115H65.5934V46.8073V41.6085H68.1115H70.6297V46.8073Z" fill="#e2e8f0" />
      <path d="M29.608 32.153C28.4545 32.5429 27.3822 33.209 26.7811 33.8914C26.1638 34.6062 25.3352 36.1983 25.1727 37.0269L25.0428 37.628L23.7756 37.7092C22.3459 37.8067 22.0535 38.0179 22.0535 39.0089C22.0535 39.9999 22.3459 40.2112 23.7756 40.3086L25.0428 40.3899L25.1727 40.991C25.3677 41.982 26.245 43.5254 27.0248 44.3215C27.431 44.7114 28.2433 45.28 28.8444 45.5562C29.7704 45.9948 30.1603 46.076 31.5088 46.1248C32.646 46.1735 33.2796 46.1248 33.832 45.9461C35.3916 45.4099 36.5776 44.0128 37.5199 41.6083L38.0398 40.3086H42.0688C44.7495 40.3086 46.0979 40.3574 46.0979 40.4711C46.0979 40.5686 45.9517 40.926 45.773 41.2672C45.1719 42.4694 43.8884 43.2167 41.9876 43.4766C41.549 43.5416 41.0616 43.7203 40.8829 43.899C40.4442 44.3377 40.4605 45.3937 40.9153 45.8486C41.224 46.1573 41.4027 46.1898 42.605 46.1248C45.1069 45.9948 47.3651 44.5327 48.3886 42.3719C48.6486 41.8195 48.8598 41.2347 48.8598 41.0884C48.8598 40.4061 49.0222 40.3086 50.1757 40.3086C51.5404 40.3086 51.9465 40.0162 51.9465 39.0089C51.9465 38.0017 51.5404 37.7092 50.1757 37.7092C49.0222 37.7092 48.8598 37.6118 48.8598 36.9294C48.8598 36.3608 47.8687 34.6062 47.1539 33.8914C46.7153 33.4365 45.9029 32.9003 45.1556 32.5429C44.0834 32.023 43.7259 31.9418 42.4425 31.8931C41.6464 31.8606 40.6717 31.9093 40.298 32.0068C38.7871 32.413 37.3899 34.0213 36.4801 36.3608L35.9765 37.7092H31.9312C29.2506 37.7092 27.9021 37.6605 27.9021 37.5468C27.9021 37.1244 28.6007 36.0684 29.2018 35.5485C29.8679 34.9799 30.5827 34.7199 32.0124 34.5412C33.0197 34.4112 33.4258 34.0051 33.4258 33.1603C33.4258 32.1368 33.0359 31.8606 31.6063 31.8606C30.9077 31.8768 30.0791 31.9906 29.608 32.153ZM44.0834 35.0773C44.8632 35.4672 45.8542 36.5557 46.0167 37.1731C46.0654 37.4006 46.0817 37.6118 46.0492 37.6442C46.0167 37.693 44.4083 37.693 42.4587 37.6767L38.9496 37.628L39.4044 36.6532C39.6644 36.1171 40.1518 35.4348 40.4929 35.1261C41.0941 34.59 41.1428 34.59 42.2638 34.6549C42.9949 34.7037 43.661 34.8661 44.0834 35.0773ZM34.888 40.7148C34.5306 41.6571 34.0594 42.4044 33.5071 42.8755C33.0034 43.3304 32.8085 43.3954 31.9799 43.3954C30.8752 43.3954 30.1441 43.1842 29.3968 42.6318C28.8281 42.2094 28.1621 41.2834 27.9833 40.666L27.8859 40.3086H31.46H35.0505L34.888 40.7148Z" fill="#e2e8f0" />
      <path d="M29.543 57.6272C29.2181 58.0334 29.2018 58.2608 29.2018 61.5263V65.003H26.9436C24.6854 65.003 24.6691 65.003 24.3442 65.4254C23.5481 66.4327 23.5156 66.3677 29.5592 72.4275C35.0342 77.9025 35.1317 78 35.7816 78C36.4152 78 36.5289 77.9025 42.0039 72.4275C47.2352 67.1963 47.5601 66.8388 47.5601 66.2865C47.5601 65.8966 47.4464 65.6041 47.1864 65.3604C46.829 65.0355 46.6503 65.003 44.587 65.003H42.3613V61.4613C42.3613 57.9684 42.3613 57.9034 41.9876 57.5622C41.614 57.2048 41.549 57.2048 35.7491 57.2048H29.8679L29.543 57.6272ZM39.5994 63.2809C39.5994 66.5464 39.6157 66.7738 39.9406 67.18C40.2493 67.5699 40.363 67.6024 41.5977 67.6024H42.9299L39.3557 71.1766L35.7816 74.7508L32.2399 71.2253L28.7144 67.6836L29.9654 67.6349C30.9889 67.6024 31.2976 67.5212 31.59 67.245C31.9637 66.9038 31.9637 66.8226 31.9637 63.3459V59.8042H35.7816H39.5994V63.2809Z" fill="#e2e8f0" />
    </g>
  </svg>
);

const dummyChartData = [
  { name: '10 May', sales: 400, prev: 240 },
  { name: '12 May', sales: 300, prev: 139 },
  { name: '14 May', sales: 550, prev: 980 },
  { name: '16 May', sales: 450, prev: 390 },
  { name: '18 May', sales: 700, prev: 480 },
  { name: '20 May', sales: 650, prev: 380 },
  { name: '22 May', sales: 900, prev: 430 },
];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-red-500">Error loading data</div>;

  const { stats, recentOrders } = data;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#F4F6F9] min-h-full font-['Inter',sans-serif]">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Booking (Amount) */}
        <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium text-slate-500 tracking-wide">Total Booking</h5>
            <h2 className="text-[32px] font-bold mt-3 text-slate-800">₹{Number(stats?.total_amount || 0).toLocaleString()}</h2>
          </div>
          <CardBgSvg />
        </div>

        {/* Total Customers */}
        <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium text-slate-500 tracking-wide">Total Customers</h5>
            <h2 className="text-[32px] font-bold mt-3 text-slate-800">{stats?.total_customers || 0}</h2>
          </div>
          <CardBgSvg />
        </div>

        {/* Total Deposit */}
        <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium text-slate-500 tracking-wide">Total Deposit</h5>
            <h2 className="text-[32px] font-bold mt-3 text-slate-800">₹{Number(stats?.total_deposit || 0).toLocaleString()}</h2>
          </div>
          <CardBgSvg />
        </div>

        {/* Total Withdraw */}
        <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium text-slate-500 tracking-wide">Total Withdraw</h5>
            <h2 className="text-[32px] font-bold mt-3 text-slate-800">₹{Number(stats?.total_withdraw || 0).toLocaleString()}</h2>
          </div>
          <CardBgSvg />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Summary */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 p-6">
          <div className="mb-6 flex justify-between items-center">
            <h5 className="text-[17px] font-semibold text-slate-800">Booking Summary of Daily</h5>
            <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}
                  cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* All Product Summary */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 p-6">
          <div className="mb-6 flex justify-between items-center">
            <h5 className="text-[17px] font-semibold text-slate-800">Booking Summary of All Product</h5>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dummyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="sales" name="Tours" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="prev" name="Hotels" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Latest Bookings Table */}
      <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h5 className="text-[17px] font-semibold text-slate-800">Latest Booking</h5>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="py-4 px-6 font-semibold text-[13px] text-slate-600 uppercase tracking-wider whitespace-nowrap">Booking Number</th>
                <th className="py-4 px-6 font-semibold text-[13px] text-slate-600 uppercase tracking-wider">Product</th>
                <th className="py-4 px-6 font-semibold text-[13px] text-slate-600 uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 font-semibold text-[13px] text-slate-600 uppercase tracking-wider">Customer Name</th>
                <th className="py-4 px-6 font-semibold text-[13px] text-slate-600 uppercase tracking-wider">Email / Phone</th>
                <th className="py-4 px-6 font-semibold text-[13px] text-slate-600 uppercase tracking-wider">Quantity</th>
                <th className="py-4 px-6 font-semibold text-[13px] text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 font-semibold text-[13px] text-slate-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order, i) => (
                  <tr key={order.id} className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'}`}>
                    <td className="py-4 px-6 font-medium text-indigo-600">{order.order_number}</td>
                    <td className="py-4 px-6 text-slate-800 font-medium">Product Name</td>
                    <td className="py-4 px-6 text-slate-500 capitalize">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {order.product_type}
                      </span>
                      {order.transport_type && <span className="block mt-1 text-[11px]">{order.transport_type}</span>}
                    </td>
                    <td className="py-4 px-6 text-slate-800">{order.first_name} {order.last_name}</td>
                    <td className="py-4 px-6">
                      <div className="text-slate-800">{order.email}</div>
                      <div className="text-slate-500 text-[13px] mt-0.5">{order.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-medium">{order.qty}</td>
                    <td className="py-4 px-6 text-slate-800 font-semibold">₹{Number(order.total_with_tax).toFixed(2)}</td>
                    <td className="py-4 px-6 text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <Search className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-[15px] font-medium">No Data Found</p>
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
