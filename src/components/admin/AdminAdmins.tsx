import { useState, useEffect } from "react";
import { Plus, Shield, ShieldAlert, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { usersAPI } from "@/config/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    is_super_admin: boolean;
    created_at: string;
}

export function AdminAdmins() {
    const { user } = useAuthContext();
    const { toast } = useToast();
    const [admins, setAdmins] = useState<AdminUser[]>([]);

    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [pendingAction, setPendingAction] = useState<{ id: string; type: 'promote' } | null>(null);
    const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

    const hasSuperAdmin = admins.some(a => a.is_super_admin);
    // Allow promotion for everyone (as requested: Admin should create super admin)
    const canPromote = true;
    // Any admin can create other admins
    const canCreate = true;

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const data = await usersAPI.getAdmins();
            if (Array.isArray(data)) {
                setAdmins(data);
            }
        } catch (error) {
            console.error('Failed to load admins:', error);
            toast({ title: "Error", description: "Failed to load admins", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.email || !formData.password) return;

        try {
            await usersAPI.inviteAdmin(formData);
            toast({ title: "Success", description: "Admin created successfully" });
            setFormData({ name: "", email: "", password: "", phone: "" });
            setIsCreateOpen(false);
            loadAdmins();
        } catch (error) {
            console.error('Failed to create admin:', error);
            toast({ title: "Error", description: "Failed to create admin", variant: "destructive" });
        }
    };

    const toggleSuperAdmin = async (admin: AdminUser) => {
        if (admin.is_super_admin) {
            try {
                await usersAPI.demoteAdmin(admin.id);
                toast({ title: "Updated", description: "Removed Super Admin privileges" });
                loadAdmins();
            } catch (error) {
                console.error('Failed to demote:', error);
                toast({ title: "Error", description: "Failed to demote", variant: "destructive" });
            }
            return;
        }

        try {
            await usersAPI.promoteAdmin(admin.id);
            toast({ title: "Updated", description: "Granted Super Admin privileges" });
            loadAdmins();
            // If we promoted ourselves (bootstrap check), force reload
            if (admin.id === user?.id) {
                window.location.reload();
            }
        } catch (error: any) {
            if (error.response?.status === 400 && error.response?.data?.requires_otp) {
                setPendingAction({ id: admin.id, type: 'promote' });
                setOtpOpen(true);
                setGeneratedOtp(null);
            } else {
                console.error('Failed to update role:', error);
                toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
            }
        }
    };

    const handleSendOtp = async () => {
        try {
            const res = await usersAPI.generateOTP('sensitive_action');
            setGeneratedOtp(res.code);
            toast({ title: "OTP Sent", description: "A verification code has been generated." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to generate OTP", variant: "destructive" });
        }
    };

    const handleConfirmOtp = async () => {
        if (!pendingAction || !otpCode) return;

        try {
            if (pendingAction.type === 'promote') {
                await usersAPI.promoteAdmin(pendingAction.id);
                toast({ title: "Updated", description: "Granted Super Admin privileges" });
            }
            setOtpOpen(false);
            setOtpCode("");
            setPendingAction(null);
            setGeneratedOtp(null);
            loadAdmins();
        } catch (error) {
            toast({ title: "Error", description: "Invalid OTP", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Admin Management</h1>
                    <p className="text-muted-foreground">Manage administrators and assign super admin privileges</p>
                </div>
                {canCreate && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> Create Admin</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create New Administrator</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1" /></div>
                                <div><Label>Email</Label><Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1" /></div>
                                <div><Label>Phone (Optional)</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1" /></div>
                                <div><Label>Password</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-1" /></div>
                                <Button onClick={handleCreate} className="w-full">Create Admin</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12">Loading admins...</div>
            ) : (
                <div className="grid gap-4">
                    {admins.map((admin) => (
                        <div key={admin.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={admin.avatar} />
                                    <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        {admin.name}
                                        {admin.is_super_admin && (
                                            <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/20">
                                                <ShieldAlert className="w-3 h-3" /> Super Admin
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {admin.email}</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant={admin.is_super_admin ? "outline" : "default"}
                                size="sm"
                                onClick={() => toggleSuperAdmin(admin)}
                                disabled={!canPromote}
                                className={admin.is_super_admin ? "text-destructive hover:bg-destructive/10 border-destructive/20" : ""}
                            >
                                {admin.is_super_admin ? "Revoke Super Admin" : "Make Super Admin"}
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Security Verification Required</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            This action requires Super Admin authentication. Please generate an OTP and enter it below.
                        </p>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleSendOtp} className="w-full">
                                Send OTP Code
                            </Button>
                        </div>

                        {generatedOtp && (
                            <div className="p-3 bg-muted rounded-md text-center">
                                <p className="text-xs text-muted-foreground mb-1">Verification code:</p>
                                <p className="text-xl font-mono font-bold tracking-widest">{generatedOtp}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Enter Verification Code</Label>
                            <Input
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                            />
                        </div>

                        <Button onClick={handleConfirmOtp} className="w-full" disabled={otpCode.length !== 6}>
                            Verify & Proceed
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
