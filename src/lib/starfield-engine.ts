interface Particle {
  x: number;          // Base X position (0-1 normalized)
  y: number;          // Base Y position (0-1 normalized)
  z: number;          // Depth (0=near, 1=far) for parallax
  size: number;       // Radius in pixels
  color: string;      // HSL color string
  baseOpacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

class StarfieldEngine {
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.initParticles();
  }

  private initParticles(): void {
    // Desktop: 600 particles, Mobile: 200 particles
    const count = window.innerWidth > 768 ? 600 : 200;

    for (let i = 0; i < count; i++) {
      // 40% in Milky Way band (y: 35-65%), 60% scattered
      const inBand = Math.random() < 0.4;
      const y = inBand
        ? 0.35 + Math.random() * 0.3
        : Math.random();

      const z = Math.random(); // Depth layer

      // Layer-based sizing
      let size, opacity;
      if (z < 0.3) {        // Near layer (20%)
        size = 2.5 + Math.random() * 1.5;
        opacity = 0.8 + Math.random() * 0.2;
      } else if (z < 0.7) { // Mid layer (50%)
        size = 1.5 + Math.random() * 1;
        opacity = 0.5 + Math.random() * 0.3;
      } else {              // Far layer (30%)
        size = 0.8 + Math.random() * 0.7;
        opacity = 0.2 + Math.random() * 0.3;
      }

      // Color distribution
      let color;
      const rand = Math.random();
      if (rand < 0.6) color = 'hsl(40, 60%, 65%)';      // Gold 60%
      else if (rand < 0.85) color = 'hsl(220, 80%, 85%)'; // Blue 25%
      else color = 'hsl(0, 0%, 100%)';                    // White 15%

      this.particles.push({
        x: Math.random(),
        y,
        z,
        size,
        color,
        baseOpacity: opacity,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.5 + Math.random() * 1.5
      });
    }
  }

  private render(time: number): void {
    const ctx = this.canvas.getContext('2d')!;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse interpolation (inspired by Opale UI)
    const LERP_FACTOR = 0.08;
    this.mouseX += (this.targetMouseX - this.mouseX) * LERP_FACTOR;
    this.mouseY += (this.targetMouseY - this.mouseY) * LERP_FACTOR;

    // Parallax strength
    const PARALLAX_STRENGTH = window.innerWidth > 768 ? 60 : 0; // Disable on mobile

    // Render particles
    this.particles.forEach(p => {
      // Calculate parallax offset
      const offsetX = this.mouseX * p.z * PARALLAX_STRENGTH;
      const offsetY = this.mouseY * p.z * PARALLAX_STRENGTH;

      const x = p.x * width + offsetX;
      const y = p.y * height + offsetY;

      // Twinkle animation
      const twinkleFactor = Math.sin(time * 0.001 * p.twinkleSpeed + p.twinklePhase);
      const opacity = p.baseOpacity * (0.7 + twinkleFactor * 0.3);

      // Draw particle
      ctx.fillStyle = p.color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    this.animationId = requestAnimationFrame((t) => this.render(t));
  }

  public start(): void {
    this.animationId = requestAnimationFrame((t) => this.render(t));
  }

  public stop(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  public updateMouse(clientX: number, clientY: number): void {
    // Normalize to -1 to 1
    this.targetMouseX = (clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = (clientY / window.innerHeight) * 2 - 1;
  }

  public resize(): void {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
    const ctx = this.canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
  }
}

export default StarfieldEngine;
