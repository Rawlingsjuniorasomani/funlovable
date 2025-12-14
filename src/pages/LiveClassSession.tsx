import { useParams, useNavigate } from "react-router-dom";
import { VideoConference } from "@/components/video/VideoConference";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LiveClassSession() {
    const { classId } = useParams<{ classId: string }>();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const handleLeave = () => {
        // Navigate back based on role
        if (user?.role === 'teacher') {
            navigate('/teacher/live-classes');
        } else if (user?.role === 'student') {
            navigate('/student/live-classes');
        } else {
            navigate('/');
        }
    };

    if (!classId) {
        return <div>Invalid Class ID</div>;
    }

    return (
        <div className="h-screen w-screen bg-background p-4 flex flex-col">
            <div className="mb-4">
                <Button variant="ghost" onClick={handleLeave} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>
            </div>
            <div className="flex-1 overflow-hidden rounded-xl border border-border shadow-2xl">
                <VideoConference
                    classId={classId}
                    className={`Live Session: ${classId}`} // Ideally fetch real class name
                    isHost={user?.role === 'teacher'}
                    userName={user?.name || "Guest"}
                    onLeave={handleLeave}
                />
            </div>
        </div>
    );
}
