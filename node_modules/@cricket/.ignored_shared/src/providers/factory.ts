import type { CricketProvider } from './types.js';
import { MockProvider } from './mock/mock-provider.js';
import { CricketDataOrgProvider } from './cricketdata/cricketdata-provider.js';
import { RoanuzCricketProvider, SportradarCricketProvider } from './stubs/roanuz-sportradar-stub.js';

export function getProvider(providerName?: string): CricketProvider {
  const selected = (providerName || process.env.CRICKET_PROVIDER || 'mock').toLowerCase();

  switch (selected) {
    case 'mock':
      return new MockProvider();
    case 'cricketdata':
    case 'cricapi':
      return new CricketDataOrgProvider();
    case 'roanuz':
      return new RoanuzCricketProvider();
    case 'sportradar':
      return new SportradarCricketProvider();
    default:
      console.warn(`[ProviderFactory] Unknown provider '${selected}'. Falling back to MockProvider.`);
      return new MockProvider();
  }
}
