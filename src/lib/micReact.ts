/**
 * Optional microphone energy reader for beat-ish reactivity.
 * Real getUserMedia + AnalyserNode only — no mock audio.
 */

export class MicReactor {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private data: Uint8Array | null = null;
  private stream: MediaStream | null = null;
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  async start(): Promise<{ ok: boolean; error?: string }> {
    if (this.active) return { ok: true };
    if (!navigator.mediaDevices?.getUserMedia) {
      return { ok: false, error: 'Microphone API not available' };
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.ctx = new AudioContext();
      const source = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.75;
      source.connect(this.analyser);
      this.data = new Uint8Array(this.analyser.frequencyBinCount);
      this.active = true;
      return { ok: true };
    } catch (err) {
      this.stop();
      return { ok: false, error: String(err) };
    }
  }

  stop(): void {
    this.active = false;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.analyser = null;
    this.data = null;
  }

  /**
   * Returns energy in 0..1 (RMS of frequency bins, normalized roughly).
   */
  energy(): number {
    if (!this.active || !this.analyser || !this.data) return 0;
    // TypeScript lib vs DOM ArrayBuffer generics — cast for getByteFrequencyData
    this.analyser.getByteFrequencyData(this.data as Uint8Array<ArrayBuffer>);
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) {
      const v = this.data[i]! / 255;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.data.length);
    // Soft knee so quiet rooms still move a little when speaking
    return Math.min(1, rms * 2.2);
  }
}

export const micReactor = new MicReactor();
