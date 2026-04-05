import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="py-12 border-t border-border">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img 
                            src="/logo.png" 
                            alt="EduTechFuture" 
                            className="h-8 w-8 object-cover rounded-full border border-border shadow-sm" 
                        />
                        <span className="font-display font-semibold text-lg tracking-tight">
                            EduTechFuture
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="flex items-center gap-8">
                        <a href="#" className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Terms
                        </a>
                        <a href="#" className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors">
                            Contact
                        </a>
                    </div>

                    {/* Copyright */}
                    <p className="font-mono text-sm text-muted-foreground">
                        © 2026 EduTechFuture AI
                    </p>
                </div>
            </div>
        </footer>
    );
}
