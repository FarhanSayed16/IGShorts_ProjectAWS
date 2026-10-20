import { ALGORITHM_VERSIONS } from '@igshorts/shared';

/** Weighted scoring engine — named stub only. v1 ranks by followers_v1. */
export class ScoringV2Engine {
  readonly version = ALGORITHM_VERSIONS.SCORING_V2;

  compute(): never {
    throw new Error('scoring_v2 is not enabled in v1');
  }
}
