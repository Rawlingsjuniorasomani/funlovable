import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Pencil, Eraser, Square, Circle, Type, Trash2, 
  Download, Palette, Minus, Plus, Undo, Redo 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface DrawAction {
  type: 'path' | 'rectangle' | 'circle' | 'text';
  points?: Point[];
  start?: Point;
  end?: Point;
  text?: string;
  color: string;
  strokeWidth: number;
}

interface WhiteboardProps {
  isHost?: boolean;
  onClose?: () => void;
}

const colors = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'
];

export function Whiteboard({ isHost = true, onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [undoneActions, setUndoneActions] = useState<DrawAction[]>([]);
  const startPointRef = useRef<Point | null>(null);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      } else if (action.type === 'text' && action.start && action.text) {
        ctx.font = `${action.strokeWidth * 5}px sans-serif`;
        ctx.fillText(action.text, action.start.x, action.start.y);
      }
    });
  }, [actions, getContext]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawCanvas();
    }
  }, [redrawCanvas]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isHost) return;
    setIsDrawing(true);
    const point = getCanvasPoint(e);
    startPointRef.current = point;

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentAction({
        type: 'path',
        points: [point],
        color: tool === 'eraser' ? '#ffffff' : color,
        strokeWidth: tool === 'eraser' ? strokeWidth * 3 : strokeWidth
      });
    } else if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newAction: DrawAction = {
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
    if (!isDrawing || !isHost) return;
    const point = getCanvasPoint(e);
    const ctx = getContext();
    if (!ctx) return;

    if ((tool === 'pen' || tool === 'eraser') && currentAction) {
      const newAction = {
        ...currentAction,
        points: [...(currentAction.points || []), point]
      };
      setCurrentAction(newAction);
      
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
    } else if ((tool === 'rectangle' || tool === 'circle') && startPointRef.current) {
      redrawCanvas();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      
      if (tool === 'rectangle') {
        ctx.strokeRect(
          startPointRef.current.x, startPointRef.current.y,
          point.x - startPointRef.current.x, point.y - startPointRef.current.y
        );
      } else {
        const radius = Math.sqrt(
          Math.pow(point.x - startPointRef.current.x, 2) + 
          Math.pow(point.y - startPointRef.current.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPointRef.current.x, startPointRef.current.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isHost) return;
    setIsDrawing(false);

    if ((tool === 'pen' || tool === 'eraser') && currentAction) {
      setActions(prev => [...prev, currentAction]);
      setUndoneActions([]);
    } else if ((tool === 'rectangle' || tool === 'circle') && startPointRef.current) {
      const point = getCanvasPoint(e);
      const newAction: DrawAction = {
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

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    redrawCanvas();
  }, [actions, redrawCanvas]);

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      {isHost && (
        <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/50 flex-wrap">
          <div className="flex items-center gap-1 border-r border-border pr-2">
            <Button
              variant={tool === 'pen' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('pen')}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('eraser')}
            >
              <Eraser className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('rectangle')}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('circle')}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              variant={tool === 'text' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('text')}
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 border-r border-border pr-2">
            {colors.map(c => (
              <button
                key={c}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-primary scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 border-r border-border pr-2 min-w-[120px]">
            <Minus className="w-3 h-3" />
            <Slider
              value={[strokeWidth]}
              onValueChange={([v]) => setStrokeWidth(v)}
              min={1}
              max={20}
              step={1}
              className="w-20"
            />
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
            <Button variant="ghost" size="icon" onClick={downloadCanvas}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative bg-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    </div>
  );
}
