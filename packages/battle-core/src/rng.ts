// Deterministic RNG wrapper
import seedrandom from "seedrandom";

export class RNG {
  private rng: seedrandom.PRNG;
  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }
  next() {
    return this.rng.quick();
  }
  int(n: number) {
    return Math.floor(this.next() * n);
  }
  chance(p: number) {
    return this.next() < p;
  }
  pick<T>(arr: T[]): T {
    return arr[this.int(arr.length)];
  }
}
