/**
 * Calculates human-readable duration of stay between check-in and check-out times
 */
export function calculateStayDuration(
  checkInTime?: string,
  checkOutTime?: string,
  expectedDate?: string,
  status?: string
): {
  durationText: string;
  totalMinutes: number;
  isActive: boolean;
} {
  if (!checkInTime) {
    return { durationText: 'Not checked in', totalMinutes: 0, isActive: false };
  }

  // Parse time strings in HH:MM format or ISO string
  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;

    // Check if ISO date string
    if (timeStr.includes('T') || timeStr.includes('-')) {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.getHours() * 60 + d.getMinutes();
      }
    }

    // Standard HH:MM or HH:MM:SS or HH:MM AM/PM
    const match = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridian = match[4]?.toLowerCase();

      if (meridian === 'pm' && hours < 12) hours += 12;
      if (meridian === 'am' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    }

    return null;
  };

  const inMins = parseTimeToMinutes(checkInTime);

  // If visitor is still in society
  if (status === 'in_gate' || !checkOutTime) {
    if (inMins !== null) {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      let elapsedMins = currentMins - inMins;
      if (elapsedMins < 0) elapsedMins += 24 * 60; // Cross midnight
      if (elapsedMins === 0) elapsedMins = 1;

      const hours = Math.floor(elapsedMins / 60);
      const mins = elapsedMins % 60;

      const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;
      return {
        durationText: `${formatted} (Currently on premises)`,
        totalMinutes: elapsedMins,
        isActive: true,
      };
    }
    return { durationText: 'Inside premises', totalMinutes: 0, isActive: true };
  }

  const outMins = parseTimeToMinutes(checkOutTime);

  if (inMins !== null && outMins !== null) {
    let diff = outMins - inMins;
    if (diff < 0) diff += 24 * 60; // Crossed midnight
    if (diff === 0) diff = 1;

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;

    const formatted = hours > 0 ? (mins > 0 ? `${hours}h ${mins}m` : `${hours} hr${hours > 1 ? 's' : ''}`) : `${mins} mins`;
    return {
      durationText: formatted,
      totalMinutes: diff,
      isActive: false,
    };
  }

  return { durationText: 'Completed visit', totalMinutes: 0, isActive: false };
}
