import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/config/api";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await apiRequest("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify(values),
            });
            const res = await response.json();

            setSubmitted(true);
            toast({
                title: "Code Sent",
                description: res.devCode ? `Dev Mode: Your code is ${res.devCode}` : "Check your email for the reset code."
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to send reset code",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                            <CardDescription>
                                Enter your email address and we'll send you a code to reset your password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!submitted ? (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="name@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                            Send Reset Code
                                        </Button>
                                    </form>
                                </Form>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                                        Code sent! Check your email.
                                    </div>
                                    <Button asChild className="w-full" variant="secondary">
                                        <Link to={`/reset-password?email=${encodeURIComponent(form.getValues().email)}`}>
                                            Enter Code to Reset
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="link" className="w-full">
                                <Link to="/login" className="flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <div className="hidden lg:block bg-muted relative">
                <div className="absolute inset-0 bg-primary/10" />
            </div>
        </div>
    );
}
