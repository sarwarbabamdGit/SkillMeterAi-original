import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import {
    Calendar as CalendarIcon,
    CreditCard,
    Users,
    Clock,
    Video,
    CheckCircle2,
    AlertCircle,
    Copy,
    Settings,
    Star,
    Search
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/api';

export default function MentorDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    // Real Stats State (replaces hardcoded stats)
    const [stats, setStats] = useState([
        { label: 'Total Earnings', value: '₹0', change: '+0%', icon: CreditCard, color: 'bg-yellow-300' },
        { label: 'Total Sessions', value: '0', change: '+0', icon: Video, color: 'bg-[#4ecdc4]' },
        { label: 'Avg Rating', value: '0.0', change: '0.0', icon: Star, color: 'bg-[#ff9f1c]' },
        { label: 'Profile Views', value: '0', change: '+0', icon: Users, color: 'bg-green-300' },
    ]);

    // Real Sessions State
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Real Availability State
    const [availability, setAvailability] = useState({
        'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [], 'Sat': [], 'Sun': []
    });

    // Real Payments State
    const [payments, setPayments] = useState({
        withdrawableBalance: 0,
        pendingBalance: 0,
        transactions: []
    });

    // Fetch Stats from Backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/mentor/stats/');
                setStats([
                    { label: 'Total Earnings', value: `₹${res.data.totalEarnings.toLocaleString()}`, change: res.data.earningsChange, icon: CreditCard, color: 'bg-yellow-300' },
                    { label: 'Total Sessions', value: `${res.data.totalSessions}`, change: res.data.sessionsChange, icon: Video, color: 'bg-[#4ecdc4]' },
                    { label: 'Avg Rating', value: `${res.data.avgRating}`, change: '0.0', icon: Star, color: 'bg-[#ff9f1c]' },
                    { label: 'Profile Views', value: `${res.data.profileViews.toLocaleString()}`, change: '+0', icon: Users, color: 'bg-green-300' },
                ]);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };
        fetchStats();
    }, []);

    // Fetch Sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await api.get('/bookings/mentor-sessions/');
                const mapped = res.data.map(b => ({
                    id: b.id,
                    student: b.learnerName || "Unknown Student",
                    topic: b.topic,
                    time: new Date(b.created_at).toLocaleString(),
                    status: b.status.toLowerCase(),
                    amount: `₹${b.amountPaid}`
                }));
                setSessions(mapped);
            } catch (err) {
                console.error("Failed to fetch sessions", err);
                toast.error("Could not load sessions.");
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'sessions' || activeTab === 'overview') {
            fetchSessions();
        }
    }, [activeTab]);

    // Fetch Availability
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await api.get('/mentor/availability/');
                if (res.data && typeof res.data === 'object') {
                    setAvailability(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch availability", err);
            }
        };

        if (activeTab === 'schedule') {
            fetchAvailability();
        }
    }, [activeTab]);

    // Fetch Payments
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await api.get('/mentor/payments/');
                setPayments(res.data);
            } catch (err) {
                console.error("Failed to fetch payments", err);
            }
        };

        if (activeTab === 'payments') {
            fetchPayments();
        }
    }, [activeTab]);

    const handleAcceptSession = async (sessionId) => {
        try {
            await api.post(`/bookings/${sessionId}/status/`, { action: 'accept' });

            // Optimistic Update
            setSessions(prev => prev.map(session =>
                session.id === sessionId ? { ...session, status: 'confirmed' } : session
            ));
            toast.success("Session accepted! Added to your schedule.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to accept session.");
        }
    };

    const handleDeclineSession = async (sessionId) => {
        try {
            await api.post(`/bookings/${sessionId}/status/`, { action: 'decline' });

            setSessions(prev => prev.map(session =>
                session.id === sessionId ? { ...session, status: 'cancelled' } : session
            ));
            toast.success("Session request declined.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to decline session.");
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText("https://meet.google.com/abc-defg-hij");
        toast.success("Meeting link copied!");
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto px-4 lg:px-8 pb-12 font-sans">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif' }}>
                            Mentor Studio
                        </h1>
                        <p className="text-lg font-bold text-gray-600 bg-yellow-300 inline-block px-2 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                            Manage your availability, sessions, and earnings
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-none border-2 border-black font-bold hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_#000]">
                            <Settings className="mr-2 h-4 w-4" /> Settings
                        </Button>
                        <Button className="rounded-none border-2 border-black bg-[#adfa1d] hover:bg-[#8ce000] text-black font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all">
                            Go Online
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <Card key={i} className={`rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000] ${stat.color} hover:-translate-y-1 transition-transform`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-2 border-black/10">
                                <CardTitle className="text-sm font-black uppercase tracking-wider text-black">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className="h-5 w-5 text-black" />
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-3xl font-black text-black">{stat.value}</div>
                                <p className="text-xs font-bold text-black/60 mt-1">
                                    {stat.change} from last month
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Area */}
                <Tabs defaultValue="overview" className="w-full space-y-6" onValueChange={setActiveTab}>
                    <TabsList className="bg-transparent p-0 gap-2 flex-wrap h-auto">
                        {['Overview', 'Schedule', 'Sessions', 'Payments'].map(tab => (
                            <TabsTrigger
                                key={tab}
                                value={tab.toLowerCase()}
                                className="rounded-none border-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-[4px_4px_0px_0px_#888] font-bold uppercase tracking-wider px-6 py-2 transition-all hover:bg-gray-100"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Next Session Card */}
                            <Card className="md:col-span-2 rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#ff00ff]">
                                <CardHeader className="border-b-2 border-black bg-white">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="font-black uppercase tracking-wider flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-[#ff00ff]" /> Up Next
                                        </CardTitle>
                                        {sessions.filter(s => s.status === 'confirmed').length > 0 && (
                                            <Badge className="rounded-none bg-[#ff00ff] text-white border-2 border-black">Next Session</Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 bg-white flex flex-col md:flex-row gap-6 items-center">
                                    {sessions.filter(s => s.status === 'confirmed').length > 0 ? (
                                        <>
                                            <div className="h-24 w-24 rounded-none border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                                                <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${sessions.filter(s => s.status === 'confirmed')[0].student}`} alt="Student" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 text-center md:text-left space-y-2">
                                                <h3 className="text-2xl font-black">{sessions.filter(s => s.status === 'confirmed')[0].student}</h3>
                                                <p className="font-bold text-gray-500">{sessions.filter(s => s.status === 'confirmed')[0].topic}</p>
                                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                                    <Badge variant="outline" className="rounded-none border-black">{sessions.filter(s => s.status === 'confirmed')[0].time}</Badge>
                                                    <Badge variant="outline" className="rounded-none border-black">{sessions.filter(s => s.status === 'confirmed')[0].amount}</Badge>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                                <Link to={`/room/${sessions.filter(s => s.status === 'confirmed')[0].id}`}>
                                                    <Button className="w-full rounded-none border-2 border-black bg-[#ff00ff] text-white hover:bg-[#d900d9] font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000]">
                                                        <Video className="mr-2 h-4 w-4" /> Join Now
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" onClick={copyLink} className="w-full rounded-none border-2 border-black font-bold hover:bg-gray-100">
                                                    <Copy className="mr-2 h-4 w-4" /> Copy Link
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full text-center py-8 text-gray-500">
                                            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="font-bold text-lg">No upcoming sessions</p>
                                            <p className="text-sm">Accept a pending request to see it here</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000] bg-gray-50">
                                <CardHeader className="border-b-2 border-black">
                                    <CardTitle className="font-black uppercase tracking-wider">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <Button className="w-full justify-start rounded-none border-2 border-black bg-white hover:bg-gray-100 text-black font-bold shadow-[2px_2px_0px_0px_#000]">
                                        <Clock className="mr-2 h-4 w-4" /> Update Availability
                                    </Button>
                                    <Button className="w-full justify-start rounded-none border-2 border-black bg-white hover:bg-gray-100 text-black font-bold shadow-[2px_2px_0px_0px_#000]">
                                        <CreditCard className="mr-2 h-4 w-4" /> Withdraw Earnings
                                    </Button>
                                    <Button className="w-full justify-start rounded-none border-2 border-black bg-white hover:bg-gray-100 text-black font-bold shadow-[2px_2px_0px_0px_#000]">
                                        <Copy className="mr-2 h-4 w-4" /> Share Profile Link
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* SCHEDULE TAB */}
                    <TabsContent value="schedule" className="space-y-6">
                        <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000]">
                            <CardHeader className="border-b-2 border-black bg-yellow-300">
                                <CardTitle className="font-black uppercase tracking-wider flex justify-between items-center">
                                    <span>Weekly Availability</span>
                                    <Button size="sm" className="rounded-none border-2 border-black bg-black text-white hover:bg-gray-800">
                                        Save Changes
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <div key={day} className="border-2 border-black p-4 bg-gray-50 flex flex-col gap-2 shadow-[2px_2px_0px_0px_#000]">
                                            <div className="font-black text-center text-lg border-b-2 border-black pb-2 mb-2">{day}</div>
                                            {availability[day] ? (
                                                availability[day].map(time => (
                                                    <div key={time} className="bg-white border-2 border-black p-2 text-center font-bold text-sm shadow-[2px_2px_0px_0px_#ccc] cursor-pointer hover:bg-red-100 group relative">
                                                        {time} - {parseInt(time) + 1}:00
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-400 font-bold text-sm py-4">Box Office Closed</div>
                                            )}
                                            <Button variant="ghost" size="sm" className="mt-2 w-full border-2 border-dashed border-gray-400 text-gray-400 hover:border-black hover:text-black">
                                                + Add Slot
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent >

                    {/* SESSIONS TAB */}
                    < TabsContent value="sessions" className="space-y-6" >
                        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Sessions Management</h2>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="rounded-none border-2 border-black bg-white text-black font-bold">Export CSV</Button>
                                <Button size="sm" className="rounded-none border-2 border-black bg-black text-white hover:bg-gray-800 font-bold">Sync Calendar</Button>
                            </div>
                        </div>

                        {/* New Requests Section */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase border-b-4 border-black inline-block pb-1">
                                    New Requests
                                    {sessions.filter(s => s.status === 'pending').length > 0 && (
                                        <Badge className="ml-2 bg-red-500 text-white border-2 border-black rounded-full">
                                            {sessions.filter(s => s.status === 'pending').length}
                                        </Badge>
                                    )}
                                </h3>
                            </div>
                            {sessions.filter(s => s.status === 'pending').length === 0 ? (
                                <div className="text-gray-500 italic p-4 border-2 border-dashed border-gray-300">No new requests pending.</div>
                            ) : (
                                <div className="grid gap-4">
                                    {sessions.filter(s => s.status === 'pending').map((request) => (
                                        <Card key={request.id} className="rounded-none border-2 border-black bg-yellow-50 shadow-[4px_4px_0px_0px_#000]">
                                            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                                                <div className="h-12 w-12 rounded-full border-2 border-black overflow-hidden bg-white">
                                                    <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${request.student}`} alt="" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <h4 className="font-black text-lg">{request.student}</h4>
                                                        <span className="font-bold text-green-600">{request.amount}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-600">{request.topic} • {request.time}</p>
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                    <Button onClick={() => handleAcceptSession(request.id)} className="flex-1 md:flex-none rounded-none bg-black text-white hover:bg-green-500 border-2 border-black font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#ccc]">
                                                        Accept
                                                    </Button>
                                                    <Button onClick={() => handleDeclineSession(request.id)} variant="outline" className="flex-1 md:flex-none rounded-none border-2 border-black hover:bg-red-500 hover:text-white font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#ccc]">
                                                        Decline
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Existing Filter & Search */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-dashed border-gray-300">
                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                                <Button size="sm" variant="outline" className="rounded-none border-2 border-black bg-black text-white hover:bg-gray-800">All</Button>
                                <Button size="sm" variant="outline" className="rounded-none border-2 border-black hover:bg-gray-100">Upcoming</Button>
                                <Button size="sm" variant="outline" className="rounded-none border-2 border-black hover:bg-gray-100">Completed</Button>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input placeholder="Search students..." className="pl-8 rounded-none border-2 border-black w-full" />
                            </div>
                        </div>

                        <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000]">
                            <CardHeader className="border-b-2 border-black bg-white">
                                <CardTitle className="font-black uppercase tracking-wider text-black">Session History & Upcoming</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-black text-white font-black">
                                            <tr>
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4">Topic</th>
                                                <th className="px-6 py-4">Date & Time</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sessions.filter(s => s.status !== 'pending').map((session, i) => (
                                                <tr key={session.id || i} className="border-b-2 border-black hover:bg-gray-50 font-bold group">
                                                    <td className="px-6 py-4 flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full border border-black overflow-hidden bg-white shadow-[2px_2px_0px_0px_#ccc]">
                                                            <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${session.student}`} alt="" />
                                                        </div>
                                                        <div>
                                                            <div className="text-base">{session.student}</div>
                                                            <div className="text-xs text-gray-500 font-normal uppercase">ID: STD-{1000 + i}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="rounded-none border-black bg-white">{session.topic}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4">{session.time}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={`rounded-none border-black uppercase text-[10px] px-2 py-1 ${['confirmed', 'upcoming'].includes(session.status?.toLowerCase()) ? 'bg-[#adfa1d] text-black' :
                                                            session.status?.toLowerCase() === 'completed' ? 'bg-gray-200 text-gray-600' :
                                                                session.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {session.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {['confirmed', 'upcoming'].includes(session.status?.toLowerCase()) ? (
                                                            <Link to={`/room/${session.id}`}>
                                                                <Button size="sm" className="rounded-none bg-black text-white hover:bg-[#adfa1d] hover:text-black border border-black font-black uppercase tracking-wider">Join</Button>
                                                            </Link>
                                                        ) : (
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-none border border-black hover:bg-black hover:text-white">...</Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent >

                    {/* PAYMENTS TAB */}
                    < TabsContent value="payments" className="space-y-6" >
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Wallet Card */}
                            <Card className="md:col-span-1 rounded-none border-2 border-black bg-black text-white shadow-[6px_6px_0px_0px_#4ecdc4]">
                                <CardHeader>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <Button className="flex-1 md:flex-none rounded-none bg-black text-white hover:bg-[#adfa1d] hover:text-black font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#4ecdc4]">
                                            <Link to="/room/test-session-1">Join Now</Link>
                                        </Button>
                                    </div>
                                    <CardTitle className="uppercase tracking-wider text-gray-400 text-sm">Total Withdrawable</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black mb-4">₹{payments.withdrawableBalance.toLocaleString()}</div>
                                    <Button className="w-full rounded-none bg-[#4ecdc4] text-black hover:bg-[#20b2aa] font-black border-2 border-white uppercase">
                                        Request Payout
                                    </Button>
                                    <p className="text-xs text-center mt-3 text-gray-500">Payouts processed every Friday</p>
                                </CardContent>
                            </Card>

                            {/* Payment Methods */}
                            <Card className="md:col-span-2 rounded-none border-2 border-black bg-white shadow-[6px_6px_0px_0px_#000]">
                                <CardHeader className="border-b-2 border-black">
                                    <CardTitle className="font-black uppercase tracking-wider text-black">Payout Methods</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between border-2 border-black p-4 bg-gray-50 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white border-2 border-black flex items-center justify-center">
                                                <CreditCard className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="font-black">HDFC Bank **** 1234</div>
                                                <div className="text-xs text-gray-500 font-bold uppercase">Primary</div>
                                            </div>
                                        </div>
                                        <Badge className="rounded-none bg-[#adfa1d] text-black border-black">Verified</Badge>
                                    </div>
                                    <Button variant="outline" className="w-full border-2 border-dashed border-gray-300 text-gray-400 hover:border-black hover:text-black rounded-none">
                                        + Add New Bank Account
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Transaction History */}
                        <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000]">
                            <CardHeader className="border-b-2 border-black bg-gray-100">
                                <CardTitle className="font-black uppercase tracking-wider text-black">Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white border-b-2 border-black">
                                            <tr>
                                                <th className="px-6 py-3 font-black uppercase">Transaction ID</th>
                                                <th className="px-6 py-3 font-black uppercase">Date</th>
                                                <th className="px-6 py-3 font-black uppercase">Type</th>
                                                <th className="px-6 py-3 font-black uppercase">Amount</th>
                                                <th className="px-6 py-3 font-black uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.transactions.length > 0 ? payments.transactions.map((txn, i) => (
                                                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-mono font-bold text-xs">{txn.id}</td>
                                                    <td className="px-6 py-4">{txn.date}</td>
                                                    <td className="px-6 py-4">{txn.type}</td>
                                                    <td className={`px-6 py-4 font-black ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-black'}`}>{txn.amount}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={`rounded-none border-black uppercase text-[10px] ${txn.status === 'cleared' ? 'bg-[#adfa1d] text-black' : 'bg-black text-white'}`}>
                                                            {txn.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No transactions yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent >
                </Tabs >
            </div >
        </DashboardLayout >
    );
}
