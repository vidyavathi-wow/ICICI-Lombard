/**
 * Ishihara Plate Generator Utility
 * This utility uses HTML5 Canvas to procedurally generate pseudo-isochromatic plates.
 */

export interface PlateConfig {
  plate_id: string;
  number: string;
  type: 'demonstration' | 'diagnostic' | 'transformation' | 'hidden';
  colors: {
    background: string[];
    digit: string[];
  };
  difficulty: number;
}

export const PALETTES = {
  NORMAL: {
    background: ['#738637', '#93A64D', '#B1BF5F', '#C8D96F', '#8C9C42'],
    digit: ['#E67E22', '#D35400', '#E74C3C', '#C0392B', '#E67E22']
  },
  REVERSED: {
    background: ['#E67E22', '#D35400', '#E74C3C', '#C0392B', '#E67E22'],
    digit: ['#738637', '#93A64D', '#B1BF5F', '#C8D96F', '#8C9C42']
  },
  // Protan / Deutan confusion colors (simplistic POC versions)
  CVD_CONFUSION_1: {
    background: ['#A8A878', '#C0C090', '#D8D8A8', '#909060'],
    digit: ['#D8A8A8', '#F0C0C0', '#C09090', '#A87878']
  },
  CVD_CONFUSION_2: {
    background: ['#7BBD7B', '#8CC68C', '#9DCE9D', '#ADE6AD'], // Greens
    digit: ['#A0A0A0', '#B0B0B0', '#C0C0C0', '#D0D0D0'] // Greys (harder for Deutan)
  }
};

export function generatePlate(
  canvas: HTMLCanvasElement, 
  config: PlateConfig, 
  seed: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.45;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Use a pseudo-random generator based on seed if needed
  // For now, simple Math.random will suffice for "non-identical" POC
  
  // 1. Create a mask for the digit
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return;

  maskCtx.fillStyle = 'white';
  // Arial Black provides a thick, solid base that translates well to dot patterns
  maskCtx.font = `900 ${radius * 1.4}px "Arial Black", Gadget, sans-serif`;
  maskCtx.textAlign = 'center';
  maskCtx.textBaseline = 'middle';
  maskCtx.fillText(config.number, centerX, centerY);

  // 2. Generate dots
  const dots: { x: number, y: number, r: number, color: string }[] = [];
  // Higher density (3.5k) is required for sharp shapes at this resolution
  const maxDots = 3500;
  let attempts = 0;
  const maxAttempts = 15000;

  while (dots.length < maxDots && attempts < maxAttempts) {
    attempts++;
    
    // Circular bounds check
    const r = Math.random() * radius;
    const theta = Math.random() * 2 * Math.PI;
    const x = centerX + r * Math.cos(theta);
    const y = centerY + r * Math.sin(theta);
    
    // Balanced dot sizes: 3px to 8px range (less 'sandy', more 'plate-like')
    const dotR = 2.5 + Math.random() * 5.5;

    let collision = false;
    for (const dot of dots) {
      const distSq = (x - dot.x) ** 2 + (y - dot.y) ** 2;
      // Reduced buffer to 0.5px for a more solid, contiguous shape
      const minDist = (dotR + dot.r + 0.5);
      if (distSq < minDist * minDist) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      // Determine color by sampling the center of where the dot will be
      const isInsideDigit = maskCtx.getImageData(x, y, 1, 1).data[3] > 128;
      const palette = isInsideDigit ? config.colors.digit : config.colors.background;
      const baseColor = palette[Math.floor(Math.random() * palette.length)];
      
      dots.push({ x, y, r: dotR, color: baseColor });
    }
  }

  // 3. Draw dots
  dots.forEach(dot => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fillStyle = dot.color;
    ctx.fill();
  });
}
