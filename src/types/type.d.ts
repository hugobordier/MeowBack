export type AvailabilityDay = {
  day:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  intervals: ('Matin' | 'Après-midi' | 'Soir' | 'Nuit')[];
};
