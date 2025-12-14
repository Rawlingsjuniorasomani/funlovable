import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { paymentsAPI } from "@/config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function PaymentVerify() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "dailed">("loading");

    const reference = searchParams.get("reference"); // Paystack returns reference in query param

    useEffect(() => {
        if (reference) {
            verifyPayment(reference);
        } else {
            setStatus("dailed");
        }
    }, [reference]);

    const verifyPayment = async (ref: string) => {
        try {
            const response = await paymentsAPI.verify(ref);
            if (response.status === 'success') {
                setStatus("success");
            } else {
                setStatus("dailed");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setStatus("dailed");
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
                                <p className="text-sm text-muted-foreground mt-1">Please log in again to refresh your dashboard access.</p>
                            </div>
                            <Button onClick={() => {
                                // Clear any potential stale auth state if needed, though strictly we just redirect
                                navigate("/login");
                            }} className="w-full mt-4">
                                Continue to Login
                            </Button>
                        </div>
                    )}

                    {status === "dailed" && (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-red-700">Payment Failed</h2>
                                <p className="text-muted-foreground mt-2">We couldn't verify your transaction. Please contact support.</p>
                            </div>
                            <Button onClick={() => navigate("/parent/subscription")} variant="outline" className="w-full mt-4">
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
