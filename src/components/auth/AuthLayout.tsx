import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
    children: ReactNode;
    image?: string;
    title?: string;
    subtitle?: string;
}

export function AuthLayout({ children, image, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Image */}
            <div className="hidden lg:flex w-1/2 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80'})` }}>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
                        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
