export interface QuotaGuardOptions {
  providerName: string;
  dailyBudget?: number; // e.g. 100 calls/day for CricAPI free tier
  maxCallsPerMinute?: number; // Rate limit window
}

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export class QuotaGuard {
  private readonly providerName: string;
  private readonly dailyBudget: number;
  private readonly maxCallsPerMinute: number;
  private dailyCalls: number = 0;
  private currentDay: string = '';
  private callTimestamps: number[] = [];

  constructor(options: QuotaGuardOptions) {
    this.providerName = options.providerName;
    this.dailyBudget = options.dailyBudget ?? 100;
    this.maxCallsPerMinute = options.maxCallsPerMinute ?? 30;
    this.currentDay = this.getTodayUtc();
  }

  private getTodayUtc(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private checkDayReset(): void {
    const today = this.getTodayUtc();
    if (this.currentDay !== today) {
      this.currentDay = today;
      this.dailyCalls = 0;
      this.callTimestamps = [];
    }
  }

  public checkQuota(): void {
    this.checkDayReset();

    if (this.dailyCalls >= this.dailyBudget) {
      throw new QuotaExceededError(
        `Daily API quota budget of ${this.dailyBudget} calls exceeded for provider [${this.providerName}]. Calls made today: ${this.dailyCalls}`
      );
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60_000;
    this.callTimestamps = this.callTimestamps.filter((ts) => ts > oneMinuteAgo);

    if (this.callTimestamps.length >= this.maxCallsPerMinute) {
      throw new QuotaExceededError(
        `Rate limit exceeded for provider [${this.providerName}]: max ${this.maxCallsPerMinute} calls per minute.`
      );
    }
  }

  public recordCall(): void {
    this.checkDayReset();
    this.dailyCalls++;
    this.callTimestamps.push(Date.now());
  }

  public getStats(): {
    providerName: string;
    dailyBudget: number;
    callsToday: number;
    remainingCallsToday: number;
    callsLastMinute: number;
    date: string;
  } {
    this.checkDayReset();
    const now = Date.now();
    const oneMinuteAgo = now - 60_000;
    const callsLastMinute = this.callTimestamps.filter((ts) => ts > oneMinuteAgo).length;

    return {
      providerName: this.providerName,
      dailyBudget: this.dailyBudget,
      callsToday: this.dailyCalls,
      remainingCallsToday: Math.max(0, this.dailyBudget - this.dailyCalls),
      callsLastMinute,
      date: this.currentDay,
    };
  }

  public reset(): void {
    this.dailyCalls = 0;
    this.callTimestamps = [];
    this.currentDay = this.getTodayUtc();
  }
}
