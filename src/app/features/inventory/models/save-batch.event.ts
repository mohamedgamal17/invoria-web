import type { Batch, BatchFormSavePayload } from './batch.entity';

/** Save event: `batch === null` means create; otherwise update that batch. */
export interface SaveBatchEvent {
  batch: Batch | null;
  payload: BatchFormSavePayload;
}
