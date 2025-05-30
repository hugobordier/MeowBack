export type AvailabilityDay = {
  day?: (
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'
  )[];
  intervals?: ('Matin' | 'Après-midi' | 'Soir' | 'Nuit')[];
};

export type PetSitterReviewResponse = {
  id: string;
  pet_sitter_id: string;
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  user_username: string;
  user_picture: string;
  pet_sitter_rating: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
};
