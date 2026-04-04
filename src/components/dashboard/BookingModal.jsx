import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CreditCard, CheckCircle2, Clock, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/api';

export default function BookingModal({ isOpen, onClose, mentor, onBookingComplete }) {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState(new Date());
    const [timeSlot, setTimeSlot] = useState('');
    const [duration, setDuration] = useState(30); // Default 30 mins
    const [topic, setTopic] = useState('mock-interview');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!mentor) return null;

    const timeSlots = ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
    const durations = [15, 30, 45, 60];

    // Parse rate per minute from string like "₹10.00/min" -> 10
    const ratePerMin = parseFloat(mentor.price.match(/[\d.]+/)?.[0]) || 10;
    const sessionCost = Math.round(ratePerMin * duration);
    const platformFee = 50;
    const totalCost = sessionCost + platformFee;



    // ...

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // Construct Booking Request Payload
            const bookingData = {
                mentor: mentor.id,
                // Construct ISO dates for slot
                // Note: In a real app, 'date' + 'timeSlot' logic needs precise parsing. 
                // For now, we'll assume the string format fits or we send a dummy ISO.
                // Let's make a best-effort construction:
                // timeSlot e.g., "10:00 AM"
                // date object

                // TODO: Parse timeSlot "10:00 AM" to hours/mins and set on date
                // For prototype, we'll just send current time + slot info as string if backend allowed, 
                // but backend expects 'slot' ID or we need to CREATE a slot on the fly?
                // Wait, backend Booking model has 'slot' as OneToOne to MentorSlot.
                // If we select a time, does it imply a MentorSlot exists? 

                // CRITICAL BACKEND CHECK: 
                // Booking model: `slot = models.OneToOneField(MentorSlot, ...)`
                // This means we MUST provide a `slot` ID, NOT just a time.
                // BUT current UI selects 'Time', not specific 'Slot ID'.
                // If we don't have slots fetched from backend, we can't book!

                // TEMPORARY FIX:
                // We'll send `topic`, `amountPaid` and let the backend handle slot creation or validation?
                // Actually, the serializer expects 'slot'. 
                // If we look at BookingSerializer: `slot` is in fields.

                // If the user selects a time, we probably need to find the matching MentorSlot ID.
                // Since we haven't fetched slots for the mentor, we can't do this 100% correct yet.
                // WE WILL FAIL HERE if we send just `startTime`.

                // ALTERNATIVE: Make `slot` optional in backend or pass `start_time` and let backend find/create slot.
                // Checking previous `serializers.py`: `slot` is in fields.

                // FOR NOW: We will send the payload. If it fails due to missing slot, we know we need to fetch slots.
                // BUT, to unblock the user, let's assume we might need to modify backend or frontend to fetch slots.

                // Let's assume for this step we just send the payload and if it errors, we handle it.
                // We will add a 'dummy' slot ID or null if allowed? `null=True, blank=True` in Booking model. YES!
                // So we can send `slot: null` and maybe pass `meeting_time` description in topic or separate field?
                // Booking model has `status`, `meeting_link`, `topic`, `amount_paid`. It DOES NOT have `start_time` field directly on Booking, it relies on `slot`.

                // WORKAROUND: We will send `slot: null` for now to test the API connectivity.
                // We will append the time to the `topic` so the mentor sees when it is.

                slot: null,
                topic: `${topic} @ ${date.toDateString()} ${timeSlot}`,
                amountPaid: totalCost
            };

            await api.post('/bookings/request/', bookingData);

            setStep(3); // Success Step
            toast.success(`Booking Request Sent to ${mentor.name}!`);
        } catch (error) {
            console.error(error);
            toast.error("Booking Failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setStep(1);
        setDate(new Date());
        setTimeSlot('');
        setDuration(30);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={reset}>
            <DialogContent className="sm:max-w-[800px] border-4 border-black p-0 overflow-hidden font-sans rounded-none shadow-[8px_8px_0px_0px_#000]">

                {/* Header */}
                <div className="bg-yellow-300 p-6 border-b-4 border-black">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        {step === 3 ? <CheckCircle2 className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                        {step === 1 && "Start Booking"}
                        {step === 2 && "Confirm & Pay"}
                        {step === 3 && "Booking Success!"}
                    </DialogTitle>
                </div>

                <div className="p-6 bg-white min-h-[300px]">

                    {/* STEP 1: Details & Slot */}
                    {step === 1 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-6 bg-gray-50 p-6 border-2 border-black">
                                <img src={mentor.image} alt={mentor.name} className="w-20 h-20 rounded-full border-2 border-black bg-white" />
                                <div>
                                    <h3 className="font-black text-xl">{mentor.name}</h3>
                                    <p className="font-bold text-gray-500 text-base">{mentor.role}</p>
                                    <p className="text-sm font-bold mt-2 bg-green-200 inline-block px-3 py-1 border border-black">{mentor.price}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label className="font-black uppercase mb-3 block text-base">Select Topic</Label>
                                    <RadioGroup value={topic} onValueChange={setTopic} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className={`border-2 border-black p-4 cursor-pointer hover:bg-gray-100 flex items-center space-x-3 ${topic === 'mock-interview' ? 'bg-black text-white' : ''} transition-colors`}>
                                            <RadioGroupItem value="mock-interview" id="r1" className="border-2 border-current h-5 w-5" />
                                            <Label htmlFor="r1" className="font-bold cursor-pointer uppercase text-sm">Mock Interview</Label>
                                        </div>
                                        <div className={`border-2 border-black p-4 cursor-pointer hover:bg-gray-100 flex items-center space-x-3 ${topic === 'resume-review' ? 'bg-black text-white' : ''} transition-colors`}>
                                            <RadioGroupItem value="resume-review" id="r2" className="border-2 border-current h-5 w-5" />
                                            <Label htmlFor="r2" className="font-bold cursor-pointer uppercase text-sm">Resume Review</Label>
                                        </div>
                                        <div className={`border-2 border-black p-4 cursor-pointer hover:bg-gray-100 flex items-center space-x-3 ${topic === 'career-guidance' ? 'bg-black text-white' : ''} transition-colors`}>
                                            <RadioGroupItem value="career-guidance" id="r3" className="border-2 border-current h-5 w-5" />
                                            <Label htmlFor="r3" className="font-bold cursor-pointer uppercase text-sm">Career Guidance</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                                    <div className="md:col-span-3 space-y-3">
                                        <Label className="font-black uppercase text-base">Select Date</Label>
                                        <div className="border-2 border-black p-4 flex justify-center bg-white">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                disabled={(date) => date < new Date()}
                                                className="rounded-md border shadow p-3 pointer-events-auto"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="space-y-3">
                                            <Label className="font-black uppercase text-base">Available Slots</Label>
                                            <div className="grid grid-cols-1 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                                {timeSlots.map((time) => (
                                                    <Button
                                                        key={time}
                                                        variant="outline"
                                                        onClick={() => setTimeSlot(time)}
                                                        className={`w-full justify-start font-bold border-2 border-black rounded-none h-12 text-base ${timeSlot === time ? 'bg-[#ff00ff] text-white hover:bg-[#d900d9]' : 'hover:bg-gray-100'}`}
                                                    >
                                                        <Clock className="mr-3 h-5 w-5" /> {time}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="font-black uppercase text-base">Duration</Label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {durations.map((d) => (
                                                    <div
                                                        key={d}
                                                        onClick={() => setDuration(d)}
                                                        className={`cursor-pointer border-2 border-black p-2 text-center font-bold text-sm hover:bg-gray-100 ${duration === d ? 'bg-black text-white' : 'bg-white'}`}
                                                    >
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}

                    {/* STEP 2: Checkout */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="border-2 border-black p-6 bg-gray-50 text-center space-y-4">
                                <div className="text-4xl font-black mb-2">₹{totalCost}</div>
                                <div className="space-y-1 text-sm font-bold text-gray-600 border-t-2 border-black pt-4">
                                    <div className="flex justify-between">
                                        <span>Session ({duration} mins @ ₹{ratePerMin}/min)</span>
                                        <span>₹{sessionCost}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Platform Fee</span>
                                        <span>₹{platformFee}</span>
                                    </div>
                                    <div className="flex justify-between text-black text-lg pt-2 border-t-2 border-dashed border-gray-400">
                                        <span>Total</span>
                                        <span>₹{totalCost}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 border-l-4 border-blue-500 font-bold text-sm">
                                <p>📅 {format(date, 'PPP')} at {timeSlot}</p>
                                <p>📌 Topic: {topic.replace('-', ' ').toUpperCase()}</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="font-black uppercase">Payment Method</Label>
                                <div className="border-2 border-black p-4 flex items-center justify-between bg-white cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-[#4ecdc4] p-2 border border-black"><CreditCard className="h-5 w-5" /></div>
                                        <div>
                                            <p className="font-bold">razorpay</p>
                                            <p className="text-xs text-gray-500 font-bold">UPI, Cards, Netbanking</p>
                                        </div>
                                    </div>
                                    <div className="h-4 w-4 rounded-full border-2 border-black bg-black"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Success */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
                            <div className="bg-yellow-300 p-6 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_#000] animate-bounce">
                                <Clock className="h-16 w-16 text-black" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase mb-2">Request Sent!</h3>
                                <p className="font-bold text-gray-600 max-w-xs mx-auto">
                                    Your request has been sent to {mentor.name}. You'll be notified once they accept.
                                </p>
                            </div>
                            <div className="bg-gray-100 p-4 border-2 border-black w-full font-mono text-sm">
                                Request ID: REQ-{Math.floor(Math.random() * 100000)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <DialogFooter className="border-t-4 border-black p-4 bg-gray-100 sm:justify-between">
                    {step < 3 && (
                        <Button variant="outline" onClick={step === 1 ? onClose : () => setStep(1)} className="font-bold border-2 border-black rounded-none hover:bg-white">
                            Cancel
                        </Button>
                    )}

                    {step === 1 && (
                        <Button
                            onClick={() => {
                                if (!timeSlot) return toast.error("Please select a time slot");
                                setStep(2);
                            }}
                            className="font-black uppercase tracking-wider bg-black text-white hover:bg-[#4ecdc4] hover:text-black border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000] ml-auto"
                        >
                            Continue to Pay
                        </Button>
                    )}

                    {step === 2 && (
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="font-black uppercase tracking-wider bg-black text-white hover:bg-[#4ecdc4] hover:text-black border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000] w-full sm:w-auto ml-auto"
                        >
                            {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Pay Securely'}
                        </Button>
                    )}

                    {step === 3 && (
                        <Button onClick={() => { onClose(); onBookingComplete(); }} className="w-full font-black uppercase tracking-wider bg-black text-white hover:bg-[#4ecdc4] hover:text-black border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000]">
                            Go to My Sessions
                        </Button>
                    )}
                </DialogFooter>

            </DialogContent>
        </Dialog >
    );
}
