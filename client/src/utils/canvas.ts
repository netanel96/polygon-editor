export function setupHiDPICanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ) {
    const dpr = window.devicePixelRatio || 1;
  
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  
    const ctx = canvas.getContext('2d');
  
    if (!ctx) {
      throw new Error('2D context not available');
    }
  
    ctx.scale(dpr, dpr);
  
    return ctx;
  }