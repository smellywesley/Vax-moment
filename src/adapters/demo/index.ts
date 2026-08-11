import { VaxMomentService } from '../../application'
import { DemoAuditSink, DemoBookingAdapter, DemoClassifierAdapter, DemoIdentityAdapter, DeterministicBarrierClassifier, FixedDemoClock, SequentialDemoIds, type BookingMode, type ClassifierMode } from './DemoAdapters'
import { DemoSnapshotRepository, type StorageLike } from './DemoSnapshotRepository'

export interface DemoRuntimeOptions {
  readonly storage?: StorageLike
  readonly classifierMode?: ClassifierMode
  readonly bookingMode?: BookingMode
}

export const createDemoRuntime = (options: DemoRuntimeOptions = {}) => {
  const repository = new DemoSnapshotRepository(options.storage)
  const loaded = repository.load()
  const persistedIds = loaded.ok
    ? [
        ...loaded.value.campaigns.map(({ id }) => id),
        ...loaded.value.employees.flatMap(({ id, bookingId, handoffId }) => [id, bookingId, handoffId]),
        ...loaded.value.bookings.map(({ id }) => id),
        ...loaded.value.handoffs.map(({ id }) => id),
        ...loaded.value.timeline.flatMap(({ id, correlationId }) => [id, correlationId]),
      ]
    : []
  const sequenceStart = persistedIds.reduce((maximum, id) => {
    const suffix = id?.match(/-(\d+)$/)?.[1]
    const numericSuffix = suffix ? Number(suffix) : 0
    return Number.isSafeInteger(numericSuffix)
      ? Math.max(maximum, numericSuffix)
      : maximum
  }, 0)
  const identity = new DemoIdentityAdapter()
  const deterministicClassifier = new DeterministicBarrierClassifier()
  const audit = new DemoAuditSink()
  const service = new VaxMomentService({
    repository,
    identity,
    deterministicClassifier,
    classifier: new DemoClassifierAdapter(deterministicClassifier, options.classifierMode),
    booking: new DemoBookingAdapter(options.bookingMode),
    clock: new FixedDemoClock(),
    ids: new SequentialDemoIds(sequenceStart),
    audit,
  })
  return { service, repository, identity, audit }
}

export * from './DemoAdapters'
export * from './DemoSnapshotRepository'
export * from './seeds'
