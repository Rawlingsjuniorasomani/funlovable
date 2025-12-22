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
    "Computer": Monitor, 
    "Music": Music,
    "Palette": Palette,
    "Dna": Dna,
    "Ruler": Ruler,
    "Map": Map,
    "Languages": Languages,
    "FileText": FileText,
    "Video": Video,
    "Layers": Layers,
    
};

export const IconRenderer = ({ iconName, className }: { iconName: string; className?: string }) => {
    const IconComponent = iconMap[iconName];

    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    
    
    return <span className={className}>{iconName}</span>;
};
