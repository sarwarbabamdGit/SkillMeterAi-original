import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

export function ReviewForm() {
    const [rating, setRating] = useState(5);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Logic to send review to backend would go here
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <Card className="w-full max-w-md mx-auto rounded-none border-2 border-black shadow-[8px_8px_0px_0px_#000]">
            <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
                <CardDescription>Tell us what you think about SkillMeter.</CardDescription>
            </CardHeader>
            <CardContent>
                {submitted ? (
                    <div className="text-center py-8 animate-in fade-in zoom-in">
                        <div className="text-4xl mb-4">🎉</div>
                        <h3 className="font-semibold text-xl mb-2">Thank you!</h3>
                        <p className="text-muted-foreground">Your review has been submitted successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`h-6 w-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Input placeholder="Your Name" required className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_#000] focus-visible:-translate-y-[2px] focus-visible:-translate-x-[2px] transition-all" />
                        </div>

                        <div className="space-y-2">
                            <Input placeholder="@twitter_handle (optional)" className="rounded-none border-2 border-black focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_#000] focus-visible:-translate-y-[2px] focus-visible:-translate-x-[2px] transition-all" />
                        </div>

                        <div className="space-y-2">
                            <Textarea
                                placeholder="What did you like about SkillMeter?"
                                className="min-h-[100px] rounded-none border-2 border-black focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_#000] focus-visible:-translate-y-[2px] focus-visible:-translate-x-[2px] transition-all"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full rounded-none border-2 border-black bg-black text-white hover:bg-black/90 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                            Submit Review
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
