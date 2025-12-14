import {
    BookOpen, Calculator, Beaker, Globe, Monitor, Music, Palette,
    Dna, Ruler, Map, Languages, FileText, Video, Layers
} from "lucide-react";

export const iconMap: Record<string, any> = {
    "BookOpen": BookOpen,
    "Calculator": Calculator,
    "Beaker": Beaker,
    "Globe": Globe,
    "Monitor": Monitor,
    "Computer": Monitor, // Alias
    "Music": Music,
    "Palette": Palette,
    "Dna": Dna,
    "Ruler": Ruler,
    "Map": Map,
    "Languages": Languages,
    "FileText": FileText,
    "Video": Video,
    "Layers": Layers,
    // Add more as needed based on seed data
};

export const IconRenderer = ({ iconName, className }: { iconName: string; className?: string }) => {
    const IconComponent = iconMap[iconName];

    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    // If map fails, try to see if it's an emoji (simple length check or regex, usually length 1-2)
    // Or just render text if it's not a known icon
    return <span className={className}>{iconName}</span>;
};
