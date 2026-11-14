import { Injectable } from '@nestjs/common';
import { DiscoveryAdapter } from './discovery-adapter.interface.js';

/** Built-in editorial source — rows already live in Postgres via seed-discovery. */
@Injectable()
export class EditorialDiscoveryAdapter implements DiscoveryAdapter {
  readonly code = 'editorial';
  readonly enabled = true;
}
