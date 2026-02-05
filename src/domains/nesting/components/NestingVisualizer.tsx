/**
 * Visualizador de Nesting com Zoom, Pan e Múltiplas Chapas
 * Suporta visualização de layouts 2D reais com múltiplas chapas
 */

import { useRef, useEffect, useState } from 'react';
import { Maximize2, TrendingUp, Layers, ZoomIn, ZoomOut, Move, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import type { ResultadoNestingChapa } from '../nesting.types';

interface NestingVisualizerProps {
  resultado: ResultadoNestingChapa;
  larguraChapa: number;
  alturaChapa: number;
  nomeChapa: string;
}

export function NestingVisualizer({ 
  resultado, 
  larguraChapa, 
  alturaChapa,
  nomeChapa 
}: NestingVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Novo: controle de múltiplas chapas
  const [chapaAtual, setChapaAtual] = useState(0);
  
  // Determinar se há múltiplas chapas
  const temMultiplasChapas = resultado.chapasLayouts && resultado.chapasLayouts.length > 1;
  const totalChapas = resultado.chapasLayouts?.length || 1;
  
  // Pegar layout da chapa atual - com fallback robusto
  const layoutAtual = resultado.chapasLayouts?.[chapaAtual] || {
    index: 0,
    itensAlocados: resultado.itensAlocados || [],
    aproveitamento: resultado.aproveitamento || 0,
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev / 1.2));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  const handlePrevChapa = () => {
    setChapaAtual((prev) => Math.max(0, prev - 1));
  };
  
  const handleNextChapa = () => {
    setChapaAtual((prev) => Math.min(totalChapas - 1, prev + 1));
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const maxWidth = 800;
    const maxHeight = 600;
    const baseScale = Math.min(
      maxWidth / larguraChapa,
      maxHeight / alturaChapa
    );

    canvas.width = larguraChapa * baseScale;
    canvas.height = alturaChapa * baseScale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Fill sheet background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sheet border
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Define colors for different piece types
    const colors: Record<string, string> = {
      'TAMPO (BLANK)': '#3b82f6',
      'TAMPO COM ESPELHO (BLANK)': '#3b82f6',
      'Tampo': '#3b82f6',
      'REFORÇO FRONTAL': '#f59e0b',
      'REFORÇO CENTRAL INFERIOR': '#10b981',
      'REFORÇO TRASEIRO CENTRAL': '#ef4444',
      'REFORÇO TRASEIRO LATERAL ESQ': '#8b5cf6',
      'REFORÇO TRASEIRO LATERAL DIR': '#ec4899',
      'CASQUILHO': '#6366f1',
      'PRATELEIRA': '#06b6d4',
      'REFORÇO PRATELEIRA': '#14b8a6',
      'Espelho traseiro': '#ef4444',
      'Espelho': '#ef4444',
      'Prateleira': '#06b6d4',
      'Reforço': '#f59e0b',
      'Borda': '#ec4899',
    };

    // Draw placed rectangles (usar layoutAtual em vez de resultado)
    layoutAtual.itensAlocados.forEach((item) => {
      const x = item.posicao.x * baseScale;
      const y = item.posicao.y * baseScale;
      const w = item.posicao.largura * baseScale;
      const h = item.posicao.altura * baseScale;

      // Get color based on description
      const baseColor = Object.keys(colors).find(key => 
        item.descricao.includes(key)
      ) ? colors[Object.keys(colors).find(key => item.descricao.includes(key))!] : '#6b7280';
      
      // Fill rectangle
      ctx.fillStyle = baseColor + '40'; // Add transparency
      ctx.fillRect(x, y, w, h);

      // Draw border
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1.5 / zoom;
      ctx.strokeRect(x, y, w, h);

      // Draw label
      ctx.fillStyle = '#1f2937';
      ctx.font = `${10 / zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const label = `${item.descricao}${item.posicao.rotacionada ? ' (R)' : ''}`;
      const dimensions = `${item.posicao.largura.toFixed(0)}×${item.posicao.altura.toFixed(0)}`;
      
      // Draw label with background
      const labelY = y + h / 2 - 6;
      const dimY = y + h / 2 + 6;
      
      if (w > 60 && h > 30) {
        // White background for text readability
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const textWidth = Math.max(
          ctx.measureText(label).width,
          ctx.measureText(dimensions).width
        );
        ctx.fillRect(
          x + w / 2 - textWidth / 2 - 4,
          y + h / 2 - 14,
          textWidth + 8,
          28
        );

        // Draw text
        ctx.fillStyle = '#1f2937';
        ctx.fillText(label, x + w / 2, labelY);
        ctx.fillStyle = '#6b7280';
        ctx.font = `${9 / zoom}px sans-serif`;
        ctx.fillText(dimensions, x + w / 2, dimY);
      }
    });

    // Draw dimensions
    ctx.fillStyle = '#1f2937';
    ctx.font = `bold ${12 / zoom}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `${larguraChapa} × ${alturaChapa} mm`,
      canvas.width - 10,
      10
    );

    ctx.restore();

  }, [layoutAtual, larguraChapa, alturaChapa, zoom, pan]);

  const wastePercentage = 100 - layoutAtual.aproveitamento;
  const placedCount = layoutAtual.itensAlocados.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Maximize2 className="w-5 h-5 text-purple-600" />
          Resultado do Nesting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">
                Eficiência
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {layoutAtual.aproveitamento.toFixed(1)}%
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-900">
                Peças Alocadas
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {placedCount}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Maximize2 className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-900">
                Desperdício
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {wastePercentage.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Sheet info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Chapa:</span> {nomeChapa}
          </p>
          {temMultiplasChapas && (
            <Badge variant="secondary" className="text-sm">
              Total: {totalChapas} chapa{totalChapas > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Navegação entre chapas (só aparece se houver múltiplas) */}
        {temMultiplasChapas && (
          <div className="flex items-center justify-center gap-3 p-3 bg-muted rounded-lg">
            <Button
              onClick={handlePrevChapa}
              variant="outline"
              size="sm"
              disabled={chapaAtual === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm font-medium min-w-[120px] text-center">
              Chapa {chapaAtual + 1} de {totalChapas}
            </div>
            <Button
              onClick={handleNextChapa}
              variant="outline"
              size="sm"
              disabled={chapaAtual === totalChapas - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Canvas Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            title="Diminuir zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            title="Resetar visualização"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Move className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Arraste para mover | Scroll para zoom
            </span>
          </div>
          <Badge variant="secondary" className="ml-2">
            {(zoom * 100).toFixed(0)}%
          </Badge>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="border rounded-md overflow-hidden bg-white cursor-move"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Legend */}
        <div className="pt-4 border-t space-y-2">
          <h3 className="text-sm font-medium">Legenda:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Tampo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Reforço Inferior</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Reforço Frontal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs text-muted-foreground">Reforço Traseiro</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            (R) indica peça rotacionada 90°
          </p>
        </div>

        {/* Detailed parts list */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">
            Peças Alocadas {temMultiplasChapas ? `(Chapa ${chapaAtual + 1})` : ''}:
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {layoutAtual.itensAlocados.map((item, idx) => (
              <div
                key={idx}
                className="text-xs text-muted-foreground flex justify-between items-center py-1 px-2 hover:bg-accent rounded"
              >
                <span>
                  {idx + 1}. {item.descricao}
                  {item.posicao.rotacionada && ' (rotacionada)'}
                </span>
                <span className="text-muted-foreground">
                  {item.posicao.largura.toFixed(0)} × {item.posicao.altura.toFixed(0)} mm
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}