import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { newsletterService } from '@/services/firestore/newsletters';
import { Mail, Loader2 } from 'lucide-react';

interface NewsletterSubscribeProps {
    variant?: 'default' | 'inline' | 'footer';
}

const NewsletterSubscribe = ({ variant = 'default' }: NewsletterSubscribeProps) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            await newsletterService.subscribe(email);
            toast.success('Successfully subscribed! You\'ll receive notifications about new properties.');
            setEmail('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'inline') {
        return (
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="flex-1"
                />
                <Button
                    type="submit"
                    disabled={loading}
                    className="gradient-gold text-secondary font-semibold"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Subscribe'
                    )}
                </Button>
            </form>
        );
    }

    if (variant === 'footer') {
        return (
            <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Newsletter
                </h4>
                <p className="text-sm text-muted-foreground">
                    Subscribe to get notified about new properties
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                        className="gradient-gold text-secondary font-semibold whitespace-nowrap"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Subscribe'
                        )}
                    </Button>
                </form>
            </div>
        );
    }

    // Default variant - standalone card
    return (
        <div className="bg-card rounded-lg p-6 shadow-card border border-border">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-xl">Stay Updated</h3>
                    <p className="text-sm text-muted-foreground">Get notified about new properties</p>
                </div>
            </div>
            <form onSubmit={handleSubscribe} className="space-y-3">
                <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-gold text-secondary font-semibold"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Subscribing...
                        </>
                    ) : (
                        'Subscribe to Newsletter'
                    )}
                </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3 text-center">
                We'll only send you updates about new properties. No spam!
            </p>
        </div>
    );
};

export default NewsletterSubscribe;
