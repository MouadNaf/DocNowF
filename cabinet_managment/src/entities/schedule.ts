export interface Schedule {
  id: string;
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  slotDuration: number; // in minutes
  bufferTime: number; // in minutes
}
