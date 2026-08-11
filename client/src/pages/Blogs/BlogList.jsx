import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy categories based on screenshot
  const categories = [
    { name: 'Travel Spots', count: 4 },
    { name: 'New Places', count: 0 },
    { name: 'Visa Processing', count: 2 },
    { name: 'Tour Managing', count: 4 },
    { name: 'Travel Booking', count: 2 },
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
        const fetchedBlogs = (response.data.blogs || response.data).map(blog => ({
          id: blog.id,
          title: blog.title,
          author: blog.users ? `${blog.users.fname || ''} ${blog.users.lname || ''}`.trim() : "Admin",
          category: blog.blog_categories?.name || "Travel",
          date: new Date(blog.created_at || Date.now()).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
          fullDate: new Date(blog.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          comments: 0,
          views: Math.floor(Math.random() * 500) + 500, // Dummy views
          read_time: "2 Min Read",
          img: blog.image,
          slug: blog.slug,
          excerpt: blog.content ? blog.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : 'Exploring the World: A Journey Through Travel and Adventure Traveling is more than just visiting new places; it’s about immersing yourself in different cultures, experiencing diverse cuisines, and creating...',
        }));

        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-[400px] flex flex-col items-center justify-center ">
        <img src="/frontend/img/innerpage/banner.png" alt="Blogs Banner" className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-[56px] font-extrabold text-white mb-4 tracking-tight">Blogs</h1>
          <div className="flex items-center justify-center gap-2 text-white text-base font-semibold">
            <Link to="/" className="text-[#0081C9] hover:text-[#0081C9] transition-colors">Home</Link>
            <span className="text-gray-300">➔</span>
            <span>Blogs</span>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="bg-[#fcfcfc] py-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1320px]">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Left Column: Blog Feed */}
            <div className="w-full lg:w-8/12">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0081C9]"></div>
                </div>
              ) : filteredBlogs.length > 0 ? (
                <div className="space-y-16">
                  {filteredBlogs.map((blog, index) => (
                    <article key={blog.id} className="group">
                      <div className="overflow-hidden mb-6">
                        <Link to={`/blog/${blog.slug}`}>
                          <img
                            src={blog.img || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&h=600&fit=crop"}
                            alt={blog.title}
                            className="w-full h-[350px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>
                      </div>

                      <div>
                        {/* Date Block */}
                        <div className="mb-4 flex flex-col">
                          <div className="text-gray-900 font-extrabold text-2xl leading-none">{blog.date.split(' ')[1]}</div>
                          <div className="text-gray-900 font-bold text-lg">{blog.date.split(' ')[0]}</div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 font-medium flex-wrap">
                          <span className="flex items-center gap-1">
                            <i className="bi bi-eye"></i> {blog.views} Views
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1">
                            <i className="bi bi-clock"></i> {blog.read_time}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="flex items-center gap-1">
                            <i className="bi bi-chat-dots"></i> ({blog.comments}) Comments
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 hover:text-[#0081C9] transition-colors">
                          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                        </h2>

                        {/* Excerpt */}
                        <p className="text-gray-500 leading-relaxed mb-6">
                          {blog.excerpt}
                        </p>

                        {/* View Post Link */}
                        <Link to={`/blog/${blog.slug}`} className="inline-flex items-center gap-2 font-bold text-[#0081C9] hover:text-green-700 transition-colors">
                          View Post <i className="bi bi-arrow-right"></i>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  No blogs found matching "{searchQuery}"
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-full lg:w-4/12 space-y-10">

              {/* Search Widget */}
              <div className="bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100">
                <h4 className="text-xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Search From Blog</h4>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search Here"
                    className="w-full border border-gray-200 border-r-0 px-4 py-3 focus:outline-none focus:border-[#0081C9] transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="bg-[#0081C9] text-white px-6 py-3 hover:bg-[#006096] transition-colors">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>

              {/* Categories Widget */}
              <div className="bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100">
                <h4 className="text-xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Post Categories</h4>
                <ul className="space-y-4">
                  {categories.map((cat, idx) => (
                    <li key={idx}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="radio" name="blog_category" className="peer appearance-none w-4 h-4 rounded-full border border-gray-300 checked:border-[#0081C9] cursor-pointer" />
                          <div className="absolute w-2 h-2 rounded-full bg-[#0081C9] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-gray-600 font-medium group-hover:text-[#0081C9] transition-colors">
                          {cat.name} ({cat.count})
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent Posts Widget */}
              <div className="bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100">
                <h4 className="text-xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Recent Post</h4>

                <div className="space-y-6">
                  {blogs.slice(0, 5).map(blog => (
                    <div key={blog.id} className="flex gap-4 group">
                      <div className="flex-shrink-0">
                        <Link to={`/blog/${blog.slug}`}>
                          <img
                            src={blog.img || "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=100&h=100&fit=crop"}
                            alt={blog.title}
                            className="w-20 h-20 object-cover rounded shadow-sm group-hover:opacity-80 transition-opacity"
                          />
                        </Link>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 font-medium mb-1">{blog.fullDate}</div>
                        <h6 className="font-bold text-gray-900 leading-tight group-hover:text-[#0081C9] transition-colors">
                          <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                        </h6>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
