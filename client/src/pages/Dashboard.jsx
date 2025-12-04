import { useEffect, useState } from "react";
import API from "../services/api";
import { useTrips } from "../context/TripContext";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Plus, 
  LogOut, 
  Search, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Clock, 
  TrendingUp,
  Bell
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { trips, setTrips } = useTrips();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // New State for Recent Activities (Mocked for now, connect to DB later)
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, text: "Alice added 'Dinner' expense", time: new Date() },
    { id: 2, text: "Trip to Paris created", time: new Date(Date.now() - 86400000) },
  ]);

  const [stats, setStats] = useState({
    totalTrips: 0,
    upcoming: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    API.get("/trips").then((res) => {
      setTrips(res.data.trips);

      const total = res.data.trips.length;
      const upcoming = res.data.trips.filter(
        (t) => t.startDate && new Date(t.startDate) > new Date()
      ).length;

      // Fetch expenses (Keep existing logic, but handle gracefully)
      Promise.all(
        res.data.trips.map((t) =>
          API.get(`/expenses/${t._id}`).then(
            (res) => res.data.expenses.reduce((sum, e) => sum + e.amount, 0),
            () => 0
          )
        )
      ).then((expenseTotals) => {
        const sum = expenseTotals.reduce((a, b) => a + b, 0);
        setStats({
          totalTrips: total,
          upcoming,
          totalExpenses: sum,
        });
        setLoading(false);
      });
    });
  }, [setTrips]);

  const filteredTrips = trips.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to determine trip status
  const getTripStatus = (date) => {
    if (!date) return { label: "Planning", color: "bg-gray-100 text-gray-600" };
    const tripDate = new Date(date);
    const now = new Date();
    if (tripDate < now) return { label: "Completed", color: "bg-green-100 text-green-700" };
    return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 fixed h-full z-10">
        <div>
          <div className="p-6 flex items-center gap-3 justify-center lg:justify-start">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <h1 className="text-xl font-bold hidden lg:block tracking-tight">WanderLedger</h1>
          </div>

          <nav className="mt-6 px-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-medium">
              <LayoutDashboard size={20} />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
            <Link to="/trip/create" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Plus size={20} />
              <span className="hidden lg:block">New Trip</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.[0] || "U"}
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 justify-center lg:justify-start px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm font-medium">
            <LogOut size={18} />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 ml-20 lg:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
            <p className="text-slate-500">Welcome back! Here's what's happening.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search trips..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link to="/trip/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-200 transition">
              <Plus size={18} />
              <span className="hidden md:inline">Create Trip</span>
            </Link>
          </div>
        </header>

        {/* ---------------- STATS GRID ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            icon={<MapPin className="text-purple-600" />} 
            title="Total Trips" 
            value={stats.totalTrips} 
            color="bg-purple-100"
          />
          <StatCard 
            icon={<Calendar className="text-blue-600" />} 
            title="Upcoming" 
            value={stats.upcoming} 
            color="bg-blue-100"
          />
          <StatCard 
            icon={<CreditCard className="text-emerald-600" />} 
            title="Total Spent" 
            value={`₹${stats.totalExpenses.toLocaleString()}`} 
            color="bg-emerald-100"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* ---------------- TRIP LIST (Left 2/3) ---------------- */}
          <div className="xl:col-span-2">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-slate-400" /> Your Trips
            </h3>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>)}
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <MapPin className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500">No trips found. Start your adventure!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrips.map((t) => {
                  const status = getTripStatus(t.startDate);
                  return (
                    <div key={t._id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${status.color.replace('text', 'bg').replace('100', '500')} text-white`}>
                          {t.title.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition">{t.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm line-clamp-1">{t.description || "No description provided."}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                             <span className="flex items-center gap-1"><Calendar size={12}/> {t.startDate ? new Date(t.startDate).toLocaleDateString() : "TBD"}</span>
                             <span>•</span>
                             <span>{t.members?.length} Members</span>
                          </div>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/trip/${t._id}`} 
                        className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition text-sm"
                      >
                        Manage
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ---------------- ACTIVITY FEED (Right 1/3) ---------------- */}
          <div className="hidden xl:block">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Bell size={18} className="text-blue-500" /> Recent Activity
              </h3>
              
              <div className="space-y-6">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex gap-3 relative">
                    <div className="w-2 bg-slate-200 absolute left-3.5 top-6 bottom-[-24px] rounded-full"></div>
                    <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 z-10">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 leading-tight">{act.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDistanceToNow(act.time, { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
                
                {/* Fallback empty state for feed */}
                {recentActivities.length === 0 && (
                   <p className="text-sm text-slate-400 italic">No recent updates.</p>
                )}
              </div>
              
              <button className="w-full mt-6 text-sm text-blue-600 font-medium hover:underline">
                View All Notifications
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
      </div>
    </div>
  );
}