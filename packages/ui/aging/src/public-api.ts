/*
 * Public API Surface de @caribeng/ui/aging
 */
export { CbAging } from './lib/aging.component';
export {
  ageDocuments,
  agingTotals,
  bucketOf,
  cbDefaultBuckets,
  daysOverdue,
  type CbAgingBucket,
  type CbAgingDocument,
  type CbAgingRow,
} from './lib/aging-model';
