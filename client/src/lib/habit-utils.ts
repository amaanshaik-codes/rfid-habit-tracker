export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  
  return `${hour12}:${minutes} ${ampm}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export function calculateStreakFromEntries(entries: Array<{ date: string; habitName: string }>): number {
  if (entries.length === 0) return 0;
  
  const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  
  let streak = 0;
  const currentDate = new Date();
  
  for (let i = 0; i < 365; i++) { // Check up to a year
    const checkDate = new Date(currentDate);
    checkDate.setDate(currentDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (sortedDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) { // Don't break on today if no entries yet
      break;
    }
  }
  
  return streak;
}

export function getIntensityLevel(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

export function parseDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTimeString(): string {
  return new Date().toTimeString().split(' ')[0];
}
