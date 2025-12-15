import { Award, Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BADGES, getCurrentStudentStats, CERTIFICATES } from "@/data/gamificationData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function StudentAchievements() {
  const stats = getCurrentStudentStats();
  const unlockedCount = BADGES.filter(b => b.unlocked).length;

  const handleDownloadCertificate = (certName: string) => {
    toast.success(`Downloading ${certName} Certificate...`);
    // Simulate download delay
    setTimeout(() => {
      toast.success("Download Complete!");
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Achievements</h1>
        <p className="text-muted-foreground">Earn badges and rewards for your accomplishments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-3xl">🏆</p>
          <p className="text-2xl font-bold text-foreground">{unlockedCount} / {BADGES.length}</p>
          <p className="text-sm text-muted-foreground">Badges Earned</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-3xl">⭐</p>
          <p className="text-2xl font-bold text-star">{stats?.xp || 0}</p>
          <p className="text-sm text-muted-foreground">Total XP</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-3xl">📜</p>
          <p className="text-2xl font-bold text-primary">{CERTIFICATES.length}</p>
          <p className="text-sm text-muted-foreground">Certificates</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border text-center">
          <p className="text-3xl">🔥</p>
          <p className="text-2xl font-bold text-tertiary">{stats?.streak || 0}</p>
          <p className="text-sm text-muted-foreground">Day Streak</p>
        </div>
      </div>

      {/* Badges Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.id} className={cn(
                "relative p-6 rounded-xl border flex flex-col items-center text-center transition-all",
                badge.unlocked
                  ? "bg-card border-primary/20 hover:border-primary hover:shadow-md"
                  : "bg-muted/50 border-border opacity-70 grayscale"
              )}>
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-3",
                  badge.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>

                {!badge.unlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                {badge.unlocked && badge.dateEarned && (
                  <div className="mt-2 text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full">
                    Earned: {badge.dateEarned}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Certificates Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Certificates
        </h2>

        {CERTIFICATES.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            No certificates earned yet. Complete all modules in a subject to earn one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CERTIFICATES.map((cert) => (
              <div key={cert.id} className="bg-card rounded-xl border border-border p-0 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
                {/* Certificate preview box */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-yellow-200">
                  <div className="border-4 border-double border-yellow-600 p-4 w-full h-full min-h-[120px] flex items-center justify-center text-center">
                    <div className="space-y-1">
                      <Award className="w-8 h-8 text-yellow-600 mx-auto" />
                      <p className="font-serif font-bold text-yellow-800 text-xs uppercase">Certificate of Completion</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{cert.subject}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{cert.level}</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Signed by:</strong> {cert.teacher}</p>
                      <p><strong>Issued on:</strong> {cert.dateEarned}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(cert.subject)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
