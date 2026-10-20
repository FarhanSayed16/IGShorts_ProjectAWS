import { Injectable } from '@nestjs/common';
import { DATA_SOURCES } from '@igshorts/shared';
import { IngestionAdapter } from './adapter.interface.js';
import { EditorialAdapter } from './editorial.adapter.js';
import { MetaGraphAdapter } from './meta-graph.adapter.js';
import { VendorAdapter } from './vendor.adapter.js';

@Injectable()
export class AdapterRegistry {
  private readonly adapters = new Map<string, IngestionAdapter>();

  constructor(meta: MetaGraphAdapter, vendor: VendorAdapter, editorial: EditorialAdapter) {
    this.adapters.set(DATA_SOURCES.META_GRAPH, meta);
    this.adapters.set(DATA_SOURCES.VENDOR, vendor);
    this.adapters.set(DATA_SOURCES.EDITORIAL, editorial);
  }

  get(code: string): IngestionAdapter | undefined {
    return this.adapters.get(code);
  }

  /** Seed provider is a no-op (returns undefined). Live providers map to adapters. */
  forProvider(provider: string): IngestionAdapter | undefined {
    if (provider === 'meta') return this.get(DATA_SOURCES.META_GRAPH);
    if (provider === 'vendor') return this.get(DATA_SOURCES.VENDOR);
    return undefined;
  }

  list(): string[] {
    return [...this.adapters.keys()];
  }
}
