import type { AvailabilityDay, TimeInterval } from '@/types/type';

export function isAvailable(
  day: string,
  availabilityDays: AvailabilityDay[],
  eventTime?: TimeInterval
): boolean {
  const dayAvailability = availabilityDays.find(
    (availability) => availability.day === day
  );

  if (!dayAvailability) {
    return false;
  }

  if (!eventTime || dayAvailability.intervals.length === 0) {
    return true;
  }

  return dayAvailability.intervals.some(
    (interval: { start_time: string; end_time: string }) => {
      const startAvail = convertTimeToMinutes(interval.start_time);
      const endAvail = convertTimeToMinutes(interval.end_time);
      const startEvent = convertTimeToMinutes(eventTime.start_time);
      const endEvent = convertTimeToMinutes(eventTime.end_time);

      return startEvent >= startAvail && endEvent <= endAvail;
    }
  );
}

function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
