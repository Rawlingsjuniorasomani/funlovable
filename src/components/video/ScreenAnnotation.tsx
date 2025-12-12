import { useState, useRef, useEffect } from "react";
import { 
  Pencil, Eraser, Square, Circle, Type, Trash2, 
  Download, Minus, Plus, Undo, Redo, MousePointer, Highlighter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface AnnotationAction {
  type: 'path' | 'rectangle' | 'circle' | 'text' | 'highlight' | 'arrow';
  points?: Point[];
  start?: Point;
  end?: Point;
  text?: string;
  color: string;
  strokeWidth: number;
}

interface ScreenAnnotationProps {
  isActive: boolean;
  onClose: () => void;
}

const colors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000', '#ffffff'
];

export function ScreenAnnotation({ isActive, onClose }: ScreenAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'pointer'>('pen');
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [actions, setActions] = useState<AnnotationAction[]>([]);
  const [currentAction, setCurrentAction] = useState<AnnotationAction | null>(null);
  const [undoneActions, setUndoneActions] = useState<AnnotationAction[]>([]);
  const startPointRef = useRef<Point | null>(null);

  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const redrawCanvas = () => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    actions.forEach(action => {
      ctx.strokeStyle = action.color;
      ctx.fillStyle = action.color;
      ctx.lineWidth = action.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.type === 'path' && action.points && action.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        action.points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      } else if (action.type === 'highlight' && action.points && action.points.length > 1) {
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        action.points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (action.type === 'rectangle' && action.start && action.end) {
        ctx.strokeRect(
          action.start.x, action.start.y,
          action.end.x - action.start.x, action.end.y - action.start.y
        );
      } else if (action.type === 'circle' && action.start && action.end) {
        const radius = Math.sqrt(
          Math.pow(action.end.x - action.start.x, 2) + 
          Math.pow(action.end.y - action.start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(action.start.x, action.start.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (action.type === 'arrow' && action.start && action.end) {
        const headLength = 15;
        const dx = action.end.x - action.start.x;
        const dy = action.end.y - action.start.y;
        const angle = Math.atan2(dy, dx);
        
        ctx.beginPath();
        ctx.moveTo(action.start.x, action.start.y);
        ctx.lineTo(action.end.x, action.end.y);
        ctx.lineTo(action.end.x - headLength * Math.cos(angle - Math.PI / 6), action.end.y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(action.end.x, action.end.y);
        ctx.lineTo(action.end.x - headLength * Math.cos(angle + Math.PI / 6), action.end.y - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (action.type === 'text' && action.start && action.text) {
        ctx.font = `${action.strokeWidth * 6}px sans-serif`;
        ctx.fillText(action.text, action.start.x, action.start.y);
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && isActive) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas();
    }
  }, [isActive]);

  useEffect(() => {
    redrawCanvas();
  }, [actions]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'pointer') return;
    
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    startPointRef.current = point;

    if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
      setCurrentAction({
        type: tool === 'highlighter' ? 'highlight' : 'path',
        points: [point],
        color: tool === 'eraser' ? 'rgba(0,0,0,0)' : color,
        strokeWidth: tool === 'highlighter' ? strokeWidth * 4 : (tool === 'eraser' ? strokeWidth * 3 : strokeWidth)
      });
    } else if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newAction: AnnotationAction = {
          type: 'text',
          start: point,
          text,
          color,
          strokeWidth
        };
        setActions(prev => [...prev, newAction]);
        setUndoneActions([]);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'pointer') return;
    const point = getCanvasPoint(e);
    const ctx = getContext();
    if (!ctx) return;

    if ((tool === 'pen' || tool === 'eraser' || tool === 'highlighter') && currentAction) {
      const newAction = {
        ...currentAction,
        points: [...(currentAction.points || []), point]
      };
      setCurrentAction(newAction);
      
      if (tool === 'highlighter') ctx.globalAlpha = 0.3;
      ctx.strokeStyle = currentAction.color;
      ctx.lineWidth = currentAction.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const points = newAction.points!;
      if (points.length >= 2) {
        ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if ((tool === 'rectangle' || tool === 'circle' || tool === 'arrow') && startPointRef.current) {
      redrawCanvas();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      
      if (tool === 'rectangle') {
        ctx.strokeRect(
          startPointRef.current.x, startPointRef.current.y,
          point.x - startPointRef.current.x, point.y - startPointRef.current.y
        );
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(point.x - startPointRef.current.x, 2) + 
          Math.pow(point.y - startPointRef.current.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPointRef.current.x, startPointRef.current.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'arrow') {
        const headLength = 15;
        const dx = point.x - startPointRef.current.x;
        const dy = point.y - startPointRef.current.y;
        const angle = Math.atan2(dy, dx);
        
        ctx.beginPath();
        ctx.moveTo(startPointRef.current.x, startPointRef.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.lineTo(point.x - headLength * Math.cos(angle - Math.PI / 6), point.y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x - headLength * Math.cos(angle + Math.PI / 6), point.y - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'pointer') return;
    setIsDrawing(false);

    if ((tool === 'pen' || tool === 'eraser' || tool === 'highlighter') && currentAction) {
      setActions(prev => [...prev, currentAction]);
      setUndoneActions([]);
    } else if ((tool === 'rectangle' || tool === 'circle' || tool === 'arrow') && startPointRef.current) {
      const point = getCanvasPoint(e);
      const newAction: AnnotationAction = {
        type: tool,
        start: startPointRef.current,
        end: point,
        color,
        strokeWidth
      };
      setActions(prev => [...prev, newAction]);
      setUndoneActions([]);
    }

    setCurrentAction(null);
    startPointRef.current = null;
  };

  const undo = () => {
    if (actions.length === 0) return;
    const lastAction = actions[actions.length - 1];
    setActions(prev => prev.slice(0, -1));
    setUndoneActions(prev => [...prev, lastAction]);
  };

  const redo = () => {
    if (undoneActions.length === 0) return;
    const lastUndone = undoneActions[undoneActions.length - 1];
    setUndoneActions(prev => prev.slice(0, -1));
    setActions(prev => [...prev, lastUndone]);
  };

  const clearCanvas = () => {
    setActions([]);
    setUndoneActions([]);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Toolbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-2 p-2 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-lg">
          <div className="flex items-center gap-1 border-r border-border pr-2">
            <Button variant={tool === 'pointer' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('pointer')}>
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button variant={tool === 'pen' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('pen')}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant={tool === 'highlighter' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('highlighter')}>
              <Highlighter className="w-4 h-4" />
            </Button>
            <Button variant={tool === 'eraser' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('eraser')}>
              <Eraser className="w-4 h-4" />
            </Button>
            <Button variant={tool === 'rectangle' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('rectangle')}>
              <Square className="w-4 h-4" />
            </Button>
            <Button variant={tool === 'circle' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('circle')}>
              <Circle className="w-4 h-4" />
            </Button>
            <Button variant={tool === 'text' ? 'default' : 'ghost'} size="icon" onClick={() => setTool('text')}>
              <Type className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 border-r border-border pr-2">
            {colors.map(c => (
              <button
                key={c}
                className={cn(
                  "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-primary scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 border-r border-border pr-2 min-w-[100px]">
            <Minus className="w-3 h-3" />
            <Slider value={[strokeWidth]} onValueChange={([v]) => setStrokeWidth(v)} min={1} max={15} step={1} className="w-16" />
            <Plus className="w-3 h-3" />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={undo} disabled={actions.length === 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={undoneActions.length === 0}>
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={onClose}>
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 w-full h-full",
          tool === 'pointer' ? "pointer-events-none" : "pointer-events-auto cursor-crosshair"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
