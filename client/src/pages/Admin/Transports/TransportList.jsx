import { useState, useEffect } from 'react';
import Pagination from '../../../components/Pagination';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

const CardBgSvg = () => (
  <svg width="74" height="78" viewBox="0 0 74 78" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-4 bottom-0 opacity-100 text-slate-200 w-24 h-24">
    <g>
      <path d="M12.5819 0.196815C11.006 0.57048 9.38137 1.88643 8.71527 3.31609C8.42284 3.96594 8.40659 4.64828 8.40659 21.4956V39.0091H4.5075H0.608398V46.8073V54.6055H37H73.3915V46.8073V39.0091H69.4924H65.5934L65.5609 21.7393L65.5121 4.48582L64.976 3.39732C64.3424 2.11387 63.4813 1.30156 62.0354 0.60297L60.9632 0.0993385L37.0812 0.0668449C23.5643 0.0668449 12.9393 0.115585 12.5819 0.196815ZM18.463 3.2836C18.0406 5.11943 16.546 6.90651 14.6127 7.88129C13.6054 8.38492 11.8345 8.93729 11.2172 8.95354C10.9248 8.95354 10.941 5.50933 11.2334 4.68078C11.8021 3.10489 12.9555 2.68249 16.7897 2.63375L18.6092 2.6175L18.463 3.2836ZM52.8238 3.91721C52.9863 4.68078 53.4087 5.83426 53.8473 6.71156C55.3257 9.66837 58.3963 12.0566 61.5968 12.7714L62.8315 13.0476V32.4456V51.8436H58.2013C55.6507 51.8436 53.5711 51.8111 53.5711 51.7786C53.5711 51.7461 53.9123 51.2263 54.3185 50.6089C55.9106 48.2207 57.0803 45.3614 57.5515 42.6157C57.8764 40.8124 57.8601 37.1733 57.5515 35.3374C57.0641 32.6243 55.8943 29.7325 54.2535 27.2306C53.295 25.7684 50.2569 22.7303 48.7298 21.7393C45.0581 19.3024 41.4352 18.2139 37 18.2139C32.5972 18.2139 28.9418 19.3024 25.2215 21.7556C23.7593 22.7141 20.705 25.7684 19.7302 27.2468C18.1056 29.7325 16.9359 32.6081 16.4485 35.3374C16.1398 37.1733 16.1236 40.8124 16.4485 42.632C16.9196 45.3289 18.1056 48.2694 19.6815 50.6089C20.0876 51.2263 20.4288 51.7461 20.4288 51.7786C20.4288 51.8111 18.3168 51.8436 15.7174 51.8436H11.006V31.7957V11.7479L11.9483 11.6342C12.4519 11.5692 13.4267 11.3417 14.0928 11.1305C17.7969 9.94456 20.4126 7.24768 21.1761 3.78724L21.4361 2.6175H36.9837H52.5476L52.8238 3.91721ZM60.7195 3.05615C61.5968 3.44606 62.4253 4.33961 62.669 5.16816C62.7828 5.52558 62.8315 6.71156 62.799 8.01126L62.7503 10.237L61.5643 9.83083C58.4288 8.77483 56.2518 6.35414 55.4557 3.03991L55.342 2.56877L57.6652 2.65C59.5173 2.71498 60.1346 2.79622 60.7195 3.05615ZM38.9495 21.0407C39.6156 21.0895 40.8503 21.3169 41.6951 21.5444C47.82 23.2015 52.7588 28.1403 54.4809 34.3302C55.082 36.5072 55.212 40.2113 54.7409 42.4208C54.0748 45.5726 52.7588 48.3019 50.7443 50.7064L49.7858 51.8436H37H24.2142L23.2881 50.7389C21.4686 48.6106 20.2339 46.1899 19.4215 43.2818C19.1129 42.1933 19.0641 41.576 19.0641 39.0091C19.0479 36.2147 19.0804 35.8898 19.4865 34.4114C21.2574 28.0916 26.1637 23.1852 32.4023 21.5281C33.8807 21.122 36.3989 20.8133 37.3249 20.9108C37.5523 20.9433 38.2834 20.992 38.9495 21.0407ZM8.40659 46.8073V52.0061H5.88843H3.37026V46.8073V41.6085H5.88843H8.40659V46.8073ZM70.6297 46.8073V52.0061H68.1115H65.5934V46.8073V41.6085H68.1115H70.6297V46.8073Z" fill="#e2e8f0" />
      <path d="M29.608 32.153C28.4545 32.5429 27.3822 33.209 26.7811 33.8914C26.1638 34.6062 25.3352 36.1983 25.1727 37.0269L25.0428 37.628L23.7756 37.7092C22.3459 37.8067 22.0535 38.0179 22.0535 39.0089C22.0535 39.9999 22.3459 40.2112 23.7756 40.3086L25.0428 40.3899L25.1727 40.991C25.3677 41.982 26.245 43.5254 27.0248 44.3215C27.431 44.7114 28.2433 45.28 28.8444 45.5562C29.7704 45.9948 30.1603 46.076 31.5088 46.1248C32.646 46.1735 33.2796 46.1248 33.832 45.9461C35.3916 45.4099 36.5776 44.0128 37.5199 41.6083L38.0398 40.3086H42.0688C44.7495 40.3086 46.0979 40.3574 46.0979 40.4711C46.0979 40.5686 45.9517 40.926 45.773 41.2672C45.1719 42.4694 43.8884 43.2167 41.9876 43.4766C41.549 43.5416 41.0616 43.7203 40.8829 43.899C40.4442 44.3377 40.4605 45.3937 40.9153 45.8486C41.224 46.1573 41.4027 46.1898 42.605 46.1248C45.1069 45.9948 47.3651 44.5327 48.3886 42.3719C48.6486 41.8195 48.8598 41.2347 48.8598 41.0884C48.8598 40.4061 49.0222 40.3086 50.1757 40.3086C51.5404 40.3086 51.9465 40.0162 51.9465 39.0089C51.9465 38.0017 51.5404 37.7092 50.1757 37.7092C49.0222 37.7092 48.8598 37.6118 48.8598 36.9294C48.8598 36.3608 47.8687 34.6062 47.1539 33.8914C46.7153 33.4365 45.9029 32.9003 45.1556 32.5429C44.0834 32.023 43.7259 31.9418 42.4425 31.8931C41.6464 31.8606 40.6717 31.9093 40.298 32.0068C38.7871 32.413 37.3899 34.0213 36.4801 36.3608L35.9765 37.7092H31.9312C29.2506 37.7092 27.9021 37.6605 27.9021 37.5468C27.9021 37.1244 28.6007 36.0684 29.2018 35.5485C29.8679 34.9799 30.5827 34.7199 32.0124 34.5412C33.0197 34.4112 33.4258 34.0051 33.4258 33.1603C33.4258 32.1368 33.0359 31.8606 31.6063 31.8606C30.9077 31.8768 30.0791 31.9906 29.608 32.153ZM44.0834 35.0773C44.8632 35.4672 45.8542 36.5557 46.0167 37.1731C46.0654 37.4006 46.0817 37.6118 46.0492 37.6442C46.0167 37.693 44.4083 37.693 42.4587 37.6767L38.9496 37.628L39.4044 36.6532C39.6644 36.1171 40.1518 35.4348 40.4929 35.1261C41.0941 34.59 41.1428 34.59 42.2638 34.6549C42.9949 34.7037 43.661 34.8661 44.0834 35.0773ZM34.888 40.7148C34.5306 41.6571 34.0594 42.4044 33.5071 42.8755C33.0034 43.3304 32.8085 43.3954 31.9799 43.3954C30.8752 43.3954 30.1441 43.1842 29.3968 42.6318C28.8281 42.2094 28.1621 41.2834 27.9833 40.666L27.8859 40.3086H31.46H35.0505L34.888 40.7148Z" fill="#e2e8f0" />
      <path d="M29.543 57.6272C29.2181 58.0334 29.2018 58.2608 29.2018 61.5263V65.003H26.9436C24.6854 65.003 24.6691 65.003 24.3442 65.4254C23.5481 66.4327 23.5156 66.3677 29.5592 72.4275C35.0342 77.9025 35.1317 78 35.7816 78C36.4152 78 36.5289 77.9025 42.0039 72.4275C47.2352 67.1963 47.5601 66.8388 47.5601 66.2865C47.5601 65.8966 47.4464 65.6041 47.1864 65.3604C46.829 65.0355 46.6503 65.003 44.587 65.003H42.3613V61.4613C42.3613 57.9684 42.3613 57.9034 41.9876 57.5622C41.614 57.2048 41.549 57.2048 35.7491 57.2048H29.8679L29.543 57.6272ZM39.5994 63.2809C39.5994 66.5464 39.6157 66.7738 39.9406 67.18C40.2493 67.5699 40.363 67.6024 41.5977 67.6024H42.9299L39.3557 71.1766L35.7816 74.7508L32.2399 71.2253L28.7144 67.6836L29.9654 67.6349C30.9889 67.6024 31.2976 67.5212 31.59 67.245C31.9637 66.9038 31.9637 66.8226 31.9637 63.3459V59.8042H35.7816H39.5994V63.2809Z" fill="#e2e8f0" />
    </g>
  </svg>
);

export default function AdminTransportList() {
  const { token } = useAuth();
  const [stats, setStats] = useState({});
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = () => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/transports`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data.stats || {});
        setTransports(Array.isArray(data.transports) ? data.transports : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transport?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/transports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTransports(transports.filter(t => t.id !== id));
      } else {
        alert('Failed to delete transport');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F4F6F9]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading Transports...</p>
        </div>
      </div>
    );
  }

  const filteredTransports = transports.filter(t =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredTransports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-[#F4F6F9] min-h-full font-['Inter',sans-serif] ">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium text-slate-500 tracking-wide">Total Transports</h5>
            <h2 className="text-[32px] font-bold mt-3 text-slate-800">{stats.total_transports || 0}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium text-slate-500 tracking-wide">Total Active</h5>
            <h2 className="text-[32px] font-bold mt-3 text-slate-800">{stats.total_active_transports || 0}</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium text-slate-500 tracking-wide">Total Views</h5>
            <h2 className="text-[32px] font-bold mt-3 text-slate-800">0</h2>
          </div>
          <CardBgSvg />
        </div>

        <div className="relative overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 hover:translate-y-[-4px] transition-transform duration-300">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h5 className="text-[15px] font-medium text-slate-500 tracking-wide">Total Bookings</h5>
            <h2 className="text-[32px] font-bold mt-3 text-slate-800">{stats.total_booking || 0}</h2>
          </div>
          <CardBgSvg />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h3 className="text-xl font-bold text-slate-800">Transport List</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0081C9] w-full sm:w-64 text-sm"
            />
            <div className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-[#0081C9] text-white rounded-r-lg cursor-pointer hover:bg-[#0069a6] transition">
              <Search size={16} />
            </div>
          </div>
          <Link
            to="/admin/transports/create"
            className="flex items-center gap-2 bg-[#FBB03B] hover:bg-[#e0992a] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm whitespace-nowrap"
          >
            <Plus size={16} /> Add New
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0081C9] text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">S.N</th>
                <th className="px-6 py-3 font-semibold">Title</th>
                <th className="px-6 py-3 font-semibold">Price</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredTransports.length > 0 ? (
                paginatedData.map((t, index) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-3">{index + 1}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{t.title || t.name}</td>
                    <td className="px-6 py-3 text-gray-500">₹{t.sale_price > 0 ? t.sale_price : (t.price || t.car_price || 0)}</td>
                    <td className="px-6 py-3">
                      {t.status === 1 ? (
                        <span className="text-emerald-600 bg-emerald-50 rounded px-2 py-1 text-xs font-semibold">Publish</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 rounded px-2 py-1 text-xs font-semibold">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/transports/view/${t.id}`}
                          className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition shadow-sm"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/transports/edit/${t.id}`}
                          className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100 transition shadow-sm"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No transports found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        <div className="p-4 border-t border-gray-100 bg-white"><Pagination align="right" currentPage={currentPage} totalPages={Math.ceil(filteredTransports.length / ITEMS_PER_PAGE)} onPageChange={setCurrentPage} /></div>
        </div>
      </div>
    </div>
  );
}
