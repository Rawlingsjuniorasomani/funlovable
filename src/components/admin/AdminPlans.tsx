import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, X, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { plansAPI } from "@/config/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Plan {
    id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
    recommended: boolean;
    description: string;
}

export function AdminPlans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [newFeature, setNewFeature] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await plansAPI.getAll();
            setPlans(data);
        } catch (error) {
            console.error("Failed to load plans:", error);
            toast.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!editingPlan) return;

        try {
            const updated = await plansAPI.update(editingPlan.id, editingPlan);
            setPlans(plans.map(p => p.id === updated.id ? updated : p));
            setEditingPlan(null);
            setIsDialogOpen(false);
            toast.success("Plan updated successfully");
        } catch (error) {
            console.error("Failed to update plan:", error);
            toast.error("Failed to update plan");
        }
    };

    const addFeature = () => {
        if (!newFeature || !editingPlan) return;
        setEditingPlan({
            ...editingPlan,
            features: [...(editingPlan.features || []), newFeature]
        });
        setNewFeature("");
    };

    const removeFeature = (index: number) => {
        if (!editingPlan) return;
        const newFeatures = [...editingPlan.features];
        newFeatures.splice(index, 1);
        setEditingPlan({ ...editingPlan, features: newFeatures });
    };

    const handleEditClick = (plan: Plan) => {
        setEditingPlan(plan);
        setIsDialogOpen(true);
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading plans...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold">Subscription Plans</h2>
                    <p className="text-muted-foreground">Manage pricing and features for all subscription tiers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className="relative group">
                        {plan.recommended && (
                            <div className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground text-xs font-bold rounded-bl-lg rounded-tr-lg">
                                Recommended
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                {plan.name}
                            </CardTitle>
                            <CardDescription className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-foreground">GH₵{plan.price.toLocaleString()}</span>
                                <span>/{plan.duration.toLowerCase()}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {plan.description && (
                                    <p className="text-sm text-muted-foreground italic mb-4">{plan.description}</p>
                                )}

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Features:</h4>
                                    <ul className="space-y-1">
                                        {plan.features?.map((feature, idx) => (
                                            <li key={idx} className="text-sm flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => handleEditClick(plan)} variant="outline" className="w-full">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Plan
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit {editingPlan?.name}</DialogTitle>
                        <DialogDescription>Update pricing, description, and features.</DialogDescription>
                    </DialogHeader>

                    {editingPlan && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Plan Name</label>
                                <Input
                                    value={editingPlan.name}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price (GH₵)</label>
                                    <Input
                                        type="number"
                                        value={editingPlan.price}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Duration</label>
                                    <Input
                                        value={editingPlan.duration}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={editingPlan.description || ""}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                    placeholder="Marketing text for this plan..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Features</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newFeature}
                                        onChange={(e) => setNewFeature(e.target.value)}
                                        placeholder="Add a new feature..."
                                        onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                                    />
                                    <Button onClick={addFeature} size="icon" type="button">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2 mt-2">
                                    {editingPlan.features?.map((feature, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded-md text-sm">
                                            <span>{feature}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFeature(idx)}
                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="recommended"
                                    checked={editingPlan.recommended}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, recommended: e.target.checked })}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="recommended" className="text-sm font-medium">Mark as Recommended Plan</label>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdatePlan}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
