export type TimeInterval = {
  start_time: string;
  end_time: string;
};

export type AvailabilityDay = {
  day:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  intervals: TimeInterval[];
};
