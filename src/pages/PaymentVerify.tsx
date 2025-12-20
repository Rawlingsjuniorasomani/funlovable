import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { paymentsAPI } from "@/config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function PaymentVerify() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [redirectTo, setRedirectTo] = useState<string>("/parent/dashboard");
    const [errorDetails, setErrorDetails] = useState<string | null>(null);

    const reference = searchParams.get("reference"); // Paystack returns reference in query param

    useEffect(() => {
        if (reference) {
            verifyPayment(reference);
        } else {
            setStatus("failed");
        }
    }, [reference]);

    const verifyPayment = async (ref: string) => {
        // Assume Paystack returned user to this page after successful payment
        setErrorDetails(null);
        setStatus("loading");
        const roleParam = searchParams.get('role');
        const role = (roleParam || 'parent').toLowerCase();
        let target = '/parent/dashboard';
        if (role === 'student') target = '/student/dashboard';
        else if (role === 'teacher') target = '/teacher/dashboard';
        else if (role === 'parent' || role === 'guardian') target = '/parent/dashboard';
        setRedirectTo(target);

        // Call server verify so backend can finalize registration and set HTTP-only session cookie.
        try {
            console.log('Calling server verify endpoint for reference:', ref);
            const verifyResult = await paymentsAPI.verify(ref).catch((err: any) => {
                console.warn('Background payment verify failed:', err);
                return null;
            });

            // If server returned a user object, prefer its role for routing
            if (verifyResult) {
                const serverRole = verifyResult.user && verifyResult.user.role ? String(verifyResult.user.role).toLowerCase() : null;
                const token = verifyResult.token;

                console.log(`[PaymentVerify] Verify result user role: ${serverRole}, hasToken: ${!!token}`);

                // Token storage removed per user request (relying on server-side cookies)


                if (serverRole === 'student') target = '/student/dashboard';
                else if (serverRole === 'teacher') target = '/teacher/dashboard';
                else target = '/parent/dashboard';

                setRedirectTo(target);
            }
            setStatus("success");
        } catch (error) {
            console.error("Verification error:", error);
            const maybeDetails = (error as any)?.message || String(error);
            setErrorDetails(maybeDetails);
            setStatus("failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardContent className="pt-6 pb-8 space-y-6">
                    {status === "loading" && (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
                            <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
                                <p className="text-muted-foreground mt-2">Your subscription is now active.</p>
                                <Button onClick={() => {
                                    window.location.href = redirectTo;
                                }} className="w-full mt-4">
                                    Continue to Dashboard
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === "failed" && (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-red-700">Payment Failed</h2>
                                <p className="text-muted-foreground mt-2">We couldn't verify your transaction.</p>
                                {errorDetails && <p className="text-sm text-muted-foreground mt-2 break-words">{errorDetails}</p>}
                                <Button onClick={() => window.location.href = "/parent/dashboard"} variant="outline" className="w-full mt-4">
                                    Back to Dashboard
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
