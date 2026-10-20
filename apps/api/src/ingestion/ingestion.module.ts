import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module.js';
import { AdapterRegistry } from './adapters/adapter.registry.js';
import { EditorialAdapter } from './adapters/editorial.adapter.js';
import { ManualSeedAdapter } from './adapters/manual-seed.adapter.js';
import { MetaGraphAdapter } from './adapters/meta-graph.adapter.js';
import { VendorAdapter } from './adapters/vendor.adapter.js';
import { IngestionService } from './ingestion.service.js';
import { WikipediaEnrichmentService } from './wikipedia.enrichment.js';

@Module({
  imports: [MetricsModule],
  providers: [
    IngestionService,
    ManualSeedAdapter,
    MetaGraphAdapter,
    VendorAdapter,
    EditorialAdapter,
    AdapterRegistry,
    WikipediaEnrichmentService,
  ],
  exports: [
    IngestionService,
    ManualSeedAdapter,
    MetaGraphAdapter,
    AdapterRegistry,
    WikipediaEnrichmentService,
  ],
})
export class IngestionModule {}
