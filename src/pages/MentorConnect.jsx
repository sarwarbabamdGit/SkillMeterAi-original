import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookingModal from '../components/dashboard/BookingModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Video, Mic, MessageSquare, Star, Clock, Calendar, CheckCircle2, Play, Pause, RefreshCw, Smartphone, Linkedin, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useInterviewWebSocket } from '../hooks/useInterviewWebSocket';

// --- MOCK DATA ---
const MENTORS = [
    {
        id: 1,
        name: 'Sarah Chen',
        role: 'Senior System Architect',
        company: 'Google',
        image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah',
        skills: ['System Design', 'Scalability', 'Cloud Architecture'],
        rating: 4.9,
        reviews: 120,
        price: '₹10/min',
        availability: 'Mon, Wed, Fri',
        color: 'bg-[#ff6b6b]', // Red-ish
        linkedin: 'https://linkedin.com/in/sarahchen',
    },
    {
        id: 2,
        name: 'David Miller',
        role: 'Staff Engineer',
        company: 'Netflix',
        image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=David',
        skills: ['React', 'Performance', 'Node.js'],
        rating: 4.8,
        reviews: 85,
        price: '₹8/min',
        availability: 'Tue, Thu',
        color: 'bg-[#4ecdc4]', // Teal
        linkedin: 'https://linkedin.com/in/davidmiller',
    },
    {
        id: 3,
        name: 'Emily Zhang',
        role: 'AI Researcher',
        company: 'OpenAI',
        image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Emily',
        skills: ['Machine Learning', 'Python', 'LLMs'],
        rating: 5.0,
        reviews: 200,
        price: '₹12/min',
        availability: 'Weekends',
        color: 'bg-[#ffe66d]', // Yellow
        linkedin: 'https://linkedin.com/in/emilyzhang',
    },
    {
        id: 4,
        name: 'Michael Scott',
        role: 'Product Manager',
        company: 'Microsoft',
        image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Michael',
        skills: ['Product Strategy', 'Interview Prep', 'Leadership'],
        rating: 4.7,
        reviews: 45,
        price: '₹5/min',
        availability: 'Flexible',
        color: 'bg-[#ff9f1c]', // Orange
        linkedin: 'https://linkedin.com/in/michaelscott',
    },
    {
        id: 5,
        name: 'Jessica Pearson',
        role: 'Legal Tech Lead',
        company: 'Pearson Specter',
        image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jessica',
        skills: ['Compliance', 'Data Privacy', 'Security'],
        rating: 4.9,
        reviews: 110,
        price: '₹15/min',
        availability: 'Mon-Fri',
        color: 'bg-[#ff006e]', // Pink
        linkedin: 'https://linkedin.com/in/jessicapearson',
    },
    {
        id: 6,
        name: 'Gilfoyle',
        role: 'DevOps Engineer',
        company: 'Pied Piper',
        image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Gilfoyle',
        skills: ['Kubernetes', 'Security', 'Server Config'],
        rating: 5.0,
        reviews: 666,
        price: '₹20/min',
        availability: 'Never',
        color: 'bg-[#8338ec]', // Purple
        linkedin: 'https://linkedin.com/in/gilfoyle',
    }
];

const TRENDING_ARTICLES = [
    { title: "AI Takes Over Coding?", date: "Oct 12", tag: "Tech" },
    { title: "Why React is Dying (Again)", date: "Oct 10", tag: "Opinion" },
    { title: "Brutalism is Back, Baby!", date: "Oct 08", tag: "Design" },
    { title: "Rust vs Go: The Final War", date: "Oct 05", tag: "Dev" },
];

const INTERVIEW_TOPICS = [
    { title: "Frontend (React)", count: "25 Qs", color: "bg-blue-100" },
    { title: "Backend (Node)", count: "30 Qs", color: "bg-green-100" },
    { title: "System Design", count: "15 Qs", color: "bg-purple-100" },
    { title: "Behavioral", count: "20 Qs", color: "bg-orange-100" },
    { title: "DSA & Algos", count: "40 Qs", color: "bg-red-100" },
];



import api from '../api/api';

// ... (imports remain)

export default function MentorConnect() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('find-mentors');
    const [filter, setFilter] = useState('');
    const [selectedTopic, setSelectedTopic] = useState("Behavioral");
    const [experienceLevel, setExperienceLevel] = useState("mid");
    const [simulationDuration, setSimulationDuration] = useState("15");

    // WebSocket Hook for Real-Time Interview
    const {
        isConnected: wsConnected,
        currentQuestion: wsQuestion,
        interviewReport: wsReport,
        isLoading: wsLoading,
        error: wsError,
        connect: wsConnect,
        initSession,
        submitAnswer,
        endSession: wsEndSession,
        reset: wsReset
    } = useInterviewWebSocket();

    // Fallback to local state if WebSocket not connected
    const [localQuestion, setLocalQuestion] = useState("Waiting to start...");
    const [localReport, setLocalReport] = useState(null);

    // Use WebSocket data if connected, otherwise use local fallback
    const activeQuestion = wsConnected ? wsQuestion : localQuestion;
    const interviewReport = wsConnected ? wsReport : localReport;

    // Mentor Data State
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    // My Sessions State
    const [mySessions, setMySessions] = useState([]);

    // Booking Modal State
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState(null);

    // Fetch Mentors from Backend
    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await api.get('/mentors/');
                // Backend returns: 
                // { id, user: {first, last, email}, title, company, hourlyRate, about, skills, image... }
                // Map to UI shape if needed, or use directly.
                // Let's assume backend serializer structure is flat enough or we adapt here.

                const mapped = res.data.map(m => ({
                    id: m.id,
                    name: `${m.firstName} ${m.lastName}`,
                    role: m.title,
                    company: m.company,
                    // Use dicebear if no image provided
                    image: `https://api.dicebear.com/7.x/lorelei/svg?seed=${m.firstName}`,
                    skills: m.skills || [],
                    rating: m.averageRating || 5.0,
                    reviews: 0, // Not yet in backend
                    price: `₹${m.hourlyRate}/min`, // Ensure backend sends per-min or we calc
                    availability: 'Flexible', // Placeholder
                    color: 'bg-[#4ecdc4]', // Cyclic or random colors
                    linkedin: '#'
                }));
                setMentors(mapped);
            } catch (err) {
                console.error("Failed to fetch mentors", err);
                toast.error("Could not load mentors.");
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === 'find-mentors') {
            fetchMentors();
        }
    }, [activeTab]);

    // Fetch My Sessions
    useEffect(() => {
        const fetchMySessions = async () => {
            try {
                const res = await api.get('/bookings/my-sessions/');
                // Map backend data
                const mapped = res.data.map(b => ({
                    id: b.id,
                    mentor_name: b.mentorName || "Unknown Mentor",
                    topic: b.topic,
                    created_at: b.created_at,
                    status: b.status,
                    meeting_link: b.meetingLink
                }));
                setMySessions(mapped);
            } catch (err) {
                console.error("Failed to fetch my sessions", err);
            }
        };

        if (activeTab === 'my-sessions') {
            fetchMySessions();
        }
    }, [activeTab]);

    const handleConnect = (mentor) => {
        setSelectedMentor(mentor);
        setIsBookingOpen(true);
    };

    // Interview Simulator State
    const [isInterviewActive, setIsInterviewActive] = useState(false);
    const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState("");
    const videoRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + " " + finalTranscript);
                }
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Reset state when topic changes
    useEffect(() => {
        setIsInterviewActive(false);
        setLocalQuestion("Waiting to start...");
        setLocalReport(null);
        wsReset();
    }, [selectedTopic, wsReset]);

    // Filter Mentors
    const filteredMentors = mentors.filter(m =>
        m.name.toLowerCase().includes(filter.toLowerCase()) ||
        m.skills.some(s => s.toLowerCase().includes(filter.toLowerCase()))
    );

    // Webcam Handling
    useEffect(() => {
        let stream = null;
        if (isInterviewActive && videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(s => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => toast.error("Camera access denied or missing."));
        }
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [isInterviewActive]);

    // Timer
    useEffect(() => {
        let interval;
        if (isInterviewActive) {
            interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isInterviewActive]);

    const startInterview = async () => {
        setRecordingTime(0);
        setIsInterviewActive(true);
        setLocalReport(null);
        setTranscript("");

        // Try WebSocket first
        if (!wsConnected) {
            wsConnect();
            // Wait a bit for connection
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Get user ID from localStorage if available
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData).id : null;

        if (wsConnected) {
            // Real-time AI Interview via WebSocket
            initSession(selectedTopic, experienceLevel, parseInt(simulationDuration), userId);
            toast.success("Connecting to AI Interviewer...");
        } else {
            // Fallback to local simulation
            setLocalQuestion(`Hello! I see you're interested in ${selectedTopic}. Let's start with a brief introduction.`);
            toast.success("Interview session started. Good luck!");
        }
    };

    const startRecordingAnswer = () => {
        setIsRecordingAnswer(true);
        setTranscript("");
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Speech recognition error:", e);
            }
        }
    };

    const stopRecordingAnswer = () => {
        setIsRecordingAnswer(false);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error("Speech recognition stop error:", e);
            }
        }

        // Send answer to backend
        if (wsConnected) {
            const answerText = transcript.trim() || "(No speech detected)";
            submitAnswer(answerText);
            toast.info("Answer submitted. Processing...");
        } else {
            // Local fallback simulation
            toast.info("Processing answer...");
            setTimeout(() => {
                setLocalQuestion("That's interesting. Can you elaborate on the trade-offs?");
            }, 1000);
        }
    };

    const endInterviewSession = () => {
        setIsInterviewActive(false);
        setIsRecordingAnswer(false);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }

        if (wsConnected) {
            // End WebSocket session - will trigger analysis
            wsEndSession();
            toast.info("AI is analyzing your performance...");
        } else {
            // Local fallback simulation
            toast.info("Analyzing interview performance...");
            setTimeout(() => {
                setLocalReport({
                    score: 82,
                    feedback: "Strong technical understanding but work on conciseness.",
                    strengths: ["React Hooks knowledge", "System Design approach"],
                    weaknesses: ["Explanation of useEffect was vague", "Missed error handling in code"],
                    transcript: "Interviewer: What is a Hook?\nUser: A hook is..."
                });
                toast.success("Performance Report Ready!");
            }, 1500);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <DashboardLayout>
            <div className={activeTab === 'find-mentors' ? "h-[170vh] flex flex-col overflow-hidden font-sans" : "space-y-6 max-w-7xl mx-auto px-4 lg:px-8 pb-12 font-sans"}>
                {/* Header Section */}
                <div className="flex-none flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-4 mb-6">
                    <div style={{ perspective: '1000px' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ rotateX: -90, opacity: 0 }}
                                animate={{ rotateX: 0, opacity: 1 }}
                                exit={{ rotateX: 90, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="origin-top"
                            >
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif' }}>
                                    {activeTab === 'find-mentors' ? 'Mentor Connect' : 'Mock Interview'}
                                </h1>
                                <p className="text-lg font-bold text-gray-600 bg-yellow-300 inline-block px-2 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                                    {activeTab === 'find-mentors'
                                        ? 'Find an expert • Master the interview • Get hired'
                                        : 'Practice real questions • Record yourself • Get feedback'}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="rounded-none border-2 border-black px-3 py-1 font-bold bg-white text-black shadow-[4px_4px_0px_0px_#ff00ff]">
                            {MENTORS.length} Mentors Online
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="find-mentors" className={activeTab === 'find-mentors' ? "flex-1 flex flex-col min-h-0" : "w-full space-y-8"} onValueChange={setActiveTab}>
                    <div className={activeTab === 'find-mentors' ? "flex-1 flex flex-col md:flex-row gap-8 items-start min-h-0" : "flex flex-col md:flex-row gap-8 items-start"}>

                        {/* LEFT COLUMN: Tabs + Trending News - Fixed & Scrollable Sidebar */}
                        <div className={activeTab === 'find-mentors' ? "flex flex-col gap-8 md:w-72 shrink-0 h-full overflow-y-auto no-scrollbar pb-4" : "flex flex-col gap-8 md:w-72 shrink-0"}>
                            {/* Navigation Tabs */}
                            <TabsList className="flex-col h-auto items-stretch bg-transparent space-gap-0 p-0 rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#000] bg-white">
                                <TabsTrigger
                                    value="find-mentors"
                                    className="rounded-none justify-start md:px-6 px-4 py-4 text-base font-bold type-button data-[state=active]:bg-[#ff00ff] data-[state=active]:text-white border-b-2 border-black last:border-0 hover:bg-gray-100 transition-colors"
                                >
                                    <Search className="mr-3 h-5 w-5" /> Find Mentors
                                </TabsTrigger>
                                <TabsTrigger
                                    value="my-sessions"
                                    className="rounded-none justify-start md:px-6 px-4 py-4 text-base font-bold type-button data-[state=active]:bg-[#adfa1d] data-[state=active]:text-black border-b-2 border-black last:border-0 hover:bg-gray-100 transition-colors"
                                >
                                    <Clock className="mr-3 h-5 w-5" /> My Sessions
                                </TabsTrigger>
                                <TabsTrigger
                                    value="simulator"
                                    className="rounded-none justify-start md:px-6 px-4 py-4 text-base font-bold data-[state=active]:bg-[#ff9f1c] data-[state=active]:text-black hover:bg-gray-100 transition-colors"
                                >
                                    <Video className="mr-3 h-5 w-5" /> Simulator
                                </TabsTrigger>
                            </TabsList>

                            {/* New Trending Articles / Topics Component */}
                            <div className="border-2 border-black bg-white shadow-[6px_6px_0px_0px_#ff0000] min-h-[550px] flex flex-col">
                                <div className="bg-black text-white p-3 border-b-2 border-black flex-none">
                                    <h3 className="font-black text-xl uppercase tracking-widest text-center">
                                        {activeTab === 'find-mentors' ? 'Trending' : 'Select Topic'}
                                    </h3>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto">
                                    <ul className="space-y-4">
                                        {activeTab === 'find-mentors' ? (
                                            TRENDING_ARTICLES.map((article, i) => (
                                                <li key={i} className="group cursor-pointer">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <Badge className="rounded-none bg-black text-white hover:bg-black border border-black text-[10px] px-1 py-0 uppercase">
                                                            {article.tag}
                                                        </Badge>
                                                        <span className="text-xs font-bold text-gray-500">{article.date}</span>
                                                    </div>
                                                    <h4 className="font-bold leading-tight group-hover:text-[#ff0000] transition-colors line-clamp-2">
                                                        {article.title}
                                                    </h4>
                                                    <div className="h-0.5 w-full bg-gray-200 mt-3 group-hover:bg-[#ff0000] transition-colors" />
                                                </li>
                                            ))
                                        ) : (
                                            INTERVIEW_TOPICS.map((topic, i) => (
                                                <li key={i} onClick={() => setSelectedTopic(topic.title)} className={`group cursor-pointer p-3 border-2 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] hover:translate-y-[2px] ${selectedTopic === topic.title ? 'bg-black text-white ring-2 ring-offset-2 ring-black' : topic.color}`}>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black uppercase tracking-tight">{topic.title}</span>
                                                        <Badge className={`rounded-none border border-black text-[10px] px-1 py-0 uppercase group-hover:bg-white group-hover:text-black ${selectedTopic === topic.title ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                                            {topic.count}
                                                        </Badge>
                                                    </div>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                                <div className="p-3 border-t-2 border-black bg-gray-50 flex-none text-center">
                                    <a href="#" className="font-bold text-sm uppercase tracking-wider underline hover:text-[#ff0000]">
                                        {activeTab === 'find-mentors' ? 'View All News →' : 'View All Topics →'}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Content Area */}
                        <div className={activeTab === 'find-mentors' ? "flex-1 w-full min-w-0 h-full flex flex-col" : "flex-1 w-full min-w-0"}>
                            <TabsContent value="find-mentors" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=active]:flex">
                                {/* Search Bar - Fixed */}
                                <div className="flex-none flex gap-0 group shadow-[6px_6px_0px_0px_#4ecdc4] mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-3.5 h-6 w-6 text-black" />
                                        <Input
                                            placeholder="Search by name, company, or skill..."
                                            className="pl-12 rounded-none border-2 border-black h-14 text-lg font-bold placeholder:text-gray-400 focus-visible:ring-0 border-r-0 bg-white"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="ghost" className="rounded-none border-2 border-black h-14 px-8 bg-[#adfa1d] text-black hover:bg-[#8ce000] font-black text-lg tracking-tight uppercase">
                                        <Filter className="mr-2 h-5 w-5" /> Filter
                                    </Button>
                                </div>

                                {/* Mentor Grid - Scrollable */}
                                <div className="flex-1 overflow-y-auto pr-4 pb-4">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <AnimatePresence>
                                            {filteredMentors.map((mentor) => (
                                                <motion.div
                                                    key={mentor.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="group"
                                                >
                                                    <Card className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 h-full flex flex-col bg-white overflow-hidden">
                                                        {/* Colorful Header */}
                                                        <div className={`relative h-20 ${mentor.color} border-b-2 border-black flex items-start justify-end p-2`}>
                                                            <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white p-1 border-2 border-black hover:bg-blue-600 hover:text-white transition-colors shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none hover:-translate-y-0.5" title="Connect on LinkedIn">
                                                                <Linkedin className="h-4 w-4" />
                                                            </a>
                                                        </div>

                                                        <div className="px-6 -mt-10 mb-2 relative z-10">
                                                            <img
                                                                src={mentor.image}
                                                                alt={mentor.name}
                                                                className="w-20 h-20 rounded-none border-2 border-black object-cover bg-white shadow-[4px_4px_0px_0px_#000]"
                                                            />
                                                        </div>

                                                        <CardContent className="p-4 pt-2 flex-1 flex flex-col gap-4">
                                                            <div>
                                                                <h3 className="font-heading text-2xl font-black leading-tight mb-1">{mentor.name}</h3>
                                                                <p className="text-sm font-bold text-gray-600 flex items-center gap-1 uppercase tracking-tight">
                                                                    {mentor.role} <span className="text-black mx-1">@</span> {mentor.company}
                                                                </p>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2">
                                                                {mentor.skills.slice(0, 3).map(skill => (
                                                                    <span key={skill} className="px-2 py-1 text-xs uppercase tracking-wider font-bold border-2 border-black bg-white hover:bg-black hover:text-white transition-colors">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>

                                                            <div className="mt-auto pt-4 flex items-center justify-between border-t-2 border-dashed border-gray-300">
                                                                <div className="flex items-center gap-1.5 bg-yellow-300 px-2 py-1 border border-black shadow-[2px_2px_0px_0px_#000]">
                                                                    <Star className="h-4 w-4 fill-black text-black" />
                                                                    <span className="text-sm font-black">{mentor.rating}</span>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="rounded-none border-2 border-black bg-black text-white hover:bg-[#ff00ff] hover:text-white font-bold tracking-wider uppercase shadow-[3px_3px_0px_0px_#888] hover:shadow-[1px_1px_0px_0px_#000] hover:translate-y-[2px] transition-all"
                                                                    onClick={() => handleConnect(mentor)}
                                                                >
                                                                    Connect Now
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="my-sessions" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=active]:flex overflow-y-auto">
                                <div className="max-w-4xl mx-auto w-full space-y-8">
                                    {/* Latest / Pending Request */}
                                    {mySessions.length > 0 && mySessions[0].status.toLowerCase() === 'pending' && (
                                        <Card className="rounded-none border-2 border-black shadow-[8px_8px_0px_0px_#000] bg-yellow-100">
                                            <CardHeader className="border-b-2 border-black">
                                                <CardTitle className="flex justify-between items-center text-black">
                                                    <span className="text-2xl font-black uppercase tracking-tighter">Latest Request</span>
                                                    <Badge className="rounded-none border-2 border-black bg-yellow-300 text-black font-bold uppercase shadow-[2px_2px_0px_0px_#000]">Pending Approval</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-black rounded-full translate-x-1 translate-y-1"></div>
                                                        <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${mySessions[0].mentor_name}`} alt="Mentor" className="relative w-24 h-24 rounded-full border-2 border-black bg-white" />
                                                    </div>
                                                    <div className="flex-1 text-center md:text-left space-y-2">
                                                        <h3 className="text-3xl font-black uppercase text-black">{mySessions[0].topic}</h3>
                                                        <p className="text-lg font-bold text-gray-800">with {mySessions[0].mentor_name}</p>
                                                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-bold mt-2">
                                                            <span className="flex items-center gap-1 bg-white px-2 border border-black"><Calendar className="h-4 w-4" /> {new Date(mySessions[0].created_at).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1 bg-white px-2 border border-black"><Clock className="h-4 w-4" /> {new Date(mySessions[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                    <Button disabled className="rounded-none h-14 px-8 border-2 border-black bg-gray-300 text-gray-500 font-black uppercase tracking-wider text-xl cursor-not-allowed opacity-50">
                                                        Waiting for Accept...
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black uppercase border-b-4 border-black inline-block pb-1">All Activity</h3>
                                        <div className="grid gap-4">
                                            {mySessions.length === 0 ? (
                                                <div className="text-center p-8 border-2 border-dashed border-gray-300 text-gray-500 font-bold">
                                                    No sessions found. Book a mentor to get started!
                                                </div>
                                            ) : (
                                                mySessions.map((session) => (
                                                    <Card key={session.id} className="rounded-none border-2 border-black shadow-[4px_4px_0px_0px_#ccc] hover:shadow-[2px_2px_0px_0px_#000] transition-all bg-white">
                                                        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                                                            <div className="h-12 w-12 bg-gray-100 border-2 border-black rounded-full flex items-center justify-center font-black">
                                                                {session.mentor_name[0]}
                                                            </div>
                                                            <div className="flex-1 text-center md:text-left">
                                                                <h4 className="font-bold text-lg">{session.topic}</h4>
                                                                <p className="text-sm font-medium text-gray-500">with {session.mentor_name} • {new Date(session.created_at).toLocaleString()}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                                                                <Badge variant="outline" className={`rounded-none border-black uppercase ${session.status === 'CONFIRMED' ? 'bg-green-300 text-black' :
                                                                    session.status === 'CANCELLED' ? 'bg-red-200 text-red-700' : 'bg-yellow-200'
                                                                    }`}>
                                                                    {session.status}
                                                                </Badge>

                                                                {session.status === 'CONFIRMED' && session.meeting_link && (
                                                                    <Button
                                                                        onClick={() => navigate(`/room/${session.id}`)}
                                                                        className="rounded-none bg-black text-white hover:bg-[#adfa1d] hover:text-black border-2 border-black font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#888]"
                                                                    >
                                                                        Join Now
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="simulator" className="flex-1 flex flex-col min-h-0 mt-0 overflow-y-auto pr-4 pb-4 border-2 border-transparent data-[state=active]:flex">
                                {/* ... existing simulator code ... */}
                                <div className="grid lg:grid-cols-3 gap-6">
                                    {/* Left: Video & Controls */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card className="rounded-none border-2 border-black shadow-[8px_8px_0px_0px_#adfa1d] overflow-hidden bg-black">
                                            {/* Header with Level Selector */}
                                            <div className="bg-white p-3 border-b-2 border-black flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                                    <span className="font-black text-xs uppercase tracking-wider">Live Simulation</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Duration:</span>
                                                    <Select value={simulationDuration} onValueChange={setSimulationDuration} disabled={isInterviewActive}>
                                                        <SelectTrigger className="h-7 w-[80px] rounded-none border-2 border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-none border-2 border-black font-bold uppercase">
                                                            <SelectItem value="2">2 Min (Quick)</SelectItem>
                                                            <SelectItem value="3">3 Min</SelectItem>
                                                            <SelectItem value="5">5 Min</SelectItem>
                                                            <SelectItem value="10">10 Min</SelectItem>
                                                            <SelectItem value="15">15 Min</SelectItem>
                                                            <SelectItem value="20">20 Min</SelectItem>
                                                            <SelectItem value="30">30 Min</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Level:</span>
                                                    <Select value={experienceLevel} onValueChange={setExperienceLevel} disabled={isInterviewActive}>
                                                        <SelectTrigger className="h-7 w-[100px] rounded-none border-2 border-black text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-none border-2 border-black font-bold uppercase">
                                                            <SelectItem value="junior">Junior</SelectItem>
                                                            <SelectItem value="mid">Mid-Level</SelectItem>
                                                            <SelectItem value="senior">Senior</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Split Screen Video Area */}
                                            <div className="relative aspect-video flex bg-gray-900 border-b-2 border-white">
                                                {/* Left: AI Avatar (Placeholder for now) */}
                                                <div className="w-1/2 border-r-2 border-white relative flex items-center justify-center bg-gray-800">
                                                    <div className="text-center space-y-2 opacity-50">
                                                        <div className="h-16 w-16 mx-auto rounded-full bg-black border-2 border-white flex items-center justify-center">
                                                            <Smartphone className="h-8 w-8 text-white" />
                                                        </div>
                                                        <p className="text-[10px] font-mono text-white uppercase tracking-widest">AI Interviewer</p>
                                                    </div>
                                                    {/* In future, LiveKit VideoTrack goes here */}
                                                </div>

                                                {/* Right: User Webcam */}
                                                <div className="w-1/2 relative overflow-hidden">
                                                    {isInterviewActive ? (
                                                        <>
                                                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                                            <div className="absolute top-2 left-2 bg-[#ff0000] text-white px-2 py-0.5 font-mono text-[10px] font-bold flex items-center gap-1 border border-white shadow-[2px_2px_0px_0px_#000]">
                                                                REC {formatTime(recordingTime)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 space-y-2">
                                                            <Video className="h-8 w-8" />
                                                            <p className="font-mono text-[10px] uppercase tracking-widest">Camera Off</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Controls */}
                                            <div className="p-4 bg-white border-t-2 border-black flex justify-between items-center">
                                                <div className="flex gap-3">
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition-colors ${isInterviewActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Mic className="h-3 w-3" /> {isInterviewActive ? 'Listening' : 'Mic Off'}
                                                    </div>
                                                </div>
                                                {!isInterviewActive ? (
                                                    <Button onClick={startInterview} className="rounded-none border-2 border-black bg-[#adfa1d] hover:bg-[#8ce000] text-black font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all">
                                                        <Play className="mr-2 h-4 w-4" /> Start Interview
                                                    </Button>
                                                ) : (
                                                    <Button onClick={endInterviewSession} className="rounded-none border-2 border-black bg-[#ff0000] text-white hover:bg-[#cc0000] font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all">
                                                        <CheckCircle2 className="mr-2 h-4 w-4" /> End Session
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>

                                        {/* Question Board */}
                                        {/* Question Board (Or Report) */}
                                        {interviewReport ? (
                                            <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#adfa1d] bg-black text-white">
                                                <CardHeader className="border-b-2 border-white bg-black py-4">
                                                    <CardTitle className="flex justify-between items-center text-xl font-black uppercase tracking-wider text-white">
                                                        <span>Performance Report</span>
                                                        <Badge className="bg-[#adfa1d] text-black border-2 border-white text-lg px-3 rounded-none">
                                                            Score: {interviewReport.score}/100
                                                        </Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-8 text-left bg-gray-900 min-h-[300px] space-y-6">
                                                    <div>
                                                        <h3 className="font-black uppercase text-[#adfa1d] mb-2 text-lg">Overall Feedback</h3>
                                                        <p className="font-mono text-sm leading-relaxed text-gray-300 border-l-4 border-[#adfa1d] pl-4">
                                                            "{interviewReport.feedback}"
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-8">
                                                        <div>
                                                            <h4 className="font-bold uppercase text-green-400 mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Strengths</h4>
                                                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 font-mono">
                                                                {interviewReport.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold uppercase text-red-400 mb-2 flex items-center gap-2"><Star className="h-4 w-4" /> Areas to Improve</h4>
                                                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300 font-mono">
                                                                {interviewReport.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-gray-700 flex justify-between items-center">
                                                        <div className="text-xs text-gray-500 font-mono uppercase">Full Transcript Available</div>
                                                        <div className="flex gap-4">
                                                            <Button onClick={startInterview} variant="outline" className="rounded-none border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase transition-all">
                                                                <RefreshCw className="mr-2 h-4 w-4" /> Retry
                                                            </Button>
                                                            <Button onClick={() => toast.success("Transcript Downloaded ( Simulated )")} className="rounded-none bg-[#adfa1d] text-black hover:bg-[#8ce000] border-2 border-white font-black uppercase shadow-[4px_4px_0px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#fff]">
                                                                <Star className="mr-2 h-4 w-4" /> Download PDF
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <Card className="rounded-none border-2 border-black shadow-[6px_6px_0px_0px_#ff9f1c]">
                                                <CardHeader className="border-b-2 border-black bg-yellow-300 py-3">
                                                    <CardTitle className="flex justify-between items-center text-sm font-black uppercase tracking-wider text-black">
                                                        <span>Current Question</span>
                                                        <Badge className="bg-white text-black border-2 border-black text-xs font-bold px-2 rounded-none">
                                                            {selectedTopic}
                                                        </Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-8 text-center bg-white min-h-[300px] flex flex-col justify-center items-center">
                                                    <AnimatePresence mode="wait">
                                                        <motion.div
                                                            key={activeQuestion}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="w-full max-w-3xl"
                                                        >
                                                            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight min-h-[4.5rem] tracking-tight">
                                                                "{activeQuestion}"
                                                            </h2>

                                                            <div className="flex justify-center gap-4">
                                                                {!isInterviewActive ? (
                                                                    <Button size="lg" onClick={startInterview} className="rounded-none bg-black text-white hover:bg-[#4ecdc4] hover:text-black border-2 border-black shadow-[4px_4px_0px_0px_#000] font-bold text-lg px-8 py-6 h-auto uppercase tracking-wide">
                                                                        Start Answer
                                                                    </Button>
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        {!isRecordingAnswer ? (
                                                                            <Button size="lg" onClick={startRecordingAnswer} className="rounded-none bg-[#adfa1d] text-black hover:bg-[#8ce000] border-2 border-black shadow-[4px_4px_0px_0px_#000] font-bold text-lg px-8 py-6 h-auto uppercase tracking-wide">
                                                                                <Mic className="mr-2 h-5 w-5" /> Start Answer
                                                                            </Button>
                                                                        ) : (
                                                                            <Button size="lg" onClick={stopRecordingAnswer} className="rounded-none bg-red-500 text-white hover:bg-red-600 border-2 border-black shadow-[4px_4px_0px_0px_#000] font-bold text-lg px-8 py-6 h-auto uppercase tracking-wide animate-pulse">
                                                                                <div className="w-3 h-3 bg-white rounded-full mr-3"></div>
                                                                                Stop & Submit
                                                                            </Button>
                                                                        )}
                                                                        <p className="text-xs font-mono text-gray-400 mt-2 uppercase">AI is listening automatically</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </AnimatePresence>
                                                </CardContent>
                                            </Card>
                                        )}

                                    </div>

                                    {/* Right: Notes & Tips */}
                                    <div className="space-y-6">
                                        <Card className="rounded-none border-2 border-black h-full flex flex-col shadow-[6px_6px_0px_0px_#00ffff]">
                                            <CardHeader className="bg-[#00ffff] border-b-2 border-black py-4">
                                                <CardTitle className="flex items-center gap-2 text-base font-black uppercase tracking-wider">
                                                    <MessageSquare className="h-5 w-5" /> AI Coach Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 space-y-6 flex-1 flex flex-col bg-white">
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase bg-black text-white inline-block px-1">Focus Areas</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['STAR Method', 'Clarity', 'Tone'].map(tag => (
                                                            <Badge key={tag} className="rounded-none border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors cursor-default text-[10px] px-2 py-0.5 font-bold uppercase shadow-[2px_2px_0px_0px_#ccc]">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-yellow-100 p-4 border-2 border-black text-xs font-bold leading-relaxed shadow-[4px_4px_0px_0px_#000]">
                                                    <strong className="block text-base mb-1 uppercase">🔥 Pro Tip:</strong>
                                                    Don't just answer the question. Tell a story. Use the camera eye-contact to build connection even with AI.
                                                </div>

                                                <div className="flex-1 flex flex-col mt-2">
                                                    <label className="text-xs font-black uppercase mb-2">Scratchpad</label>
                                                    <Input
                                                        placeholder="Quick notes..."
                                                        className="flex-1 rounded-none border-2 border-black align-top p-4 resize-none bg-gray-50 focus:bg-white focus:shadow-[4px_4px_0px_0px_#000] transition-all font-mono text-sm"
                                                        as="textarea"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                mentor={selectedMentor}
                onBookingComplete={() => setActiveTab('my-sessions')}
            />
        </DashboardLayout>
    );
}
