import { TimetableSlot } from '../types';

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

/**
 * Gets current Day of the week in school context (Monday - Friday).
 * If weekend (Saturday/Sunday), defaults to Monday for interactive testing.
 */
export function getCurrentSchoolDay(): DayOfWeek {
  const dayIndex = new Date().getDay();
  switch (dayIndex) {
    case 1: return 'Monday';
    case 2: return 'Tuesday';
    case 3: return 'Wednesday';
    case 4: return 'Thursday';
    case 5: return 'Friday';
    default: return 'Monday'; // Weekend default for demo/testing
  }
}

/**
 * Converts time string like "08:00 AM", "01:15 PM" to minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3] ? match[3].toUpperCase() : null;

  if (meridian === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridian === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Gets current minutes from midnight based on system clock
 */
export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Checks if a slot is currently active based on day and current time
 */
export function isSlotActiveNow(slot: TimetableSlot, currentDay?: DayOfWeek, currentMinutes?: number): boolean {
  const day = currentDay || getCurrentSchoolDay();
  const mins = currentMinutes !== undefined ? currentMinutes : getCurrentTimeInMinutes();

  if (slot.day !== day) return false;

  const startMins = parseTimeToMinutes(slot.startTime);
  const endMins = parseTimeToMinutes(slot.endTime);

  return mins >= startMins && mins <= endMins;
}

/**
 * Returns all timetable slots assigned to a specific teacher
 */
export function getTeacherTimetable(
  timetable: TimetableSlot[],
  teacherId?: string,
  teacherName?: string
): TimetableSlot[] {
  if (!timetable || timetable.length === 0) return [];
  return timetable.filter((slot) => {
    // 1. Direct ID match
    if (teacherId && slot.teacherId && slot.teacherId === teacherId) return true;

    // 2. Direct exact name match (case-insensitive)
    if (teacherName && slot.teacherName && slot.teacherName.trim().toLowerCase() === teacherName.trim().toLowerCase()) {
      return true;
    }

    // 3. Normalized name comparison (stripping Mr., Mrs., Ms., Dr., Madam)
    if (teacherName && slot.teacherName) {
      const cleanA = teacherName.replace(/^(mr|mrs|ms|dr|madam|prof)\.?\s+/i, '').trim().toLowerCase();
      const cleanB = slot.teacherName.replace(/^(mr|mrs|ms|dr|madam|prof)\.?\s+/i, '').trim().toLowerCase();
      if (cleanA && cleanB && (cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA))) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Returns today's timetable slots for a teacher
 */
export function getTeacherTodaySlots(
  timetable: TimetableSlot[],
  teacherId?: string,
  teacherName?: string,
  day?: DayOfWeek
): TimetableSlot[] {
  const currentDay = day || getCurrentSchoolDay();
  const teacherSlots = getTeacherTimetable(timetable, teacherId, teacherName);
  return teacherSlots.filter((slot) => slot.day === currentDay).sort((a, b) => a.periodNumber - b.periodNumber);
}

/**
 * Returns all timetable slots for a specific class (e.g. 'B7', 'B4')
 */
export function getClassTimetable(
  timetable: TimetableSlot[],
  classLevel: string,
  day?: DayOfWeek
): TimetableSlot[] {
  if (!timetable || timetable.length === 0) return [];
  const filtered = timetable.filter((slot) => slot.classLevel === classLevel || slot.classLevel === 'All Classes');
  if (day) {
    return filtered.filter((slot) => slot.day === day).sort((a, b) => a.periodNumber - b.periodNumber);
  }
  return filtered;
}

/**
 * Finds if there is an active timetable slot for a teacher right now
 */
export function getTeacherActiveSlotNow(
  timetable: TimetableSlot[],
  teacherId?: string,
  teacherName?: string,
  day?: DayOfWeek,
  minutes?: number
): TimetableSlot | null {
  const todaySlots = getTeacherTodaySlots(timetable, teacherId, teacherName, day);
  for (const slot of todaySlots) {
    if (isSlotActiveNow(slot, day, minutes)) {
      return slot;
    }
  }
  return null;
}

/**
 * Verifies if a teacher can go live for a given subject and class level.
 * Checks against the timetable.
 */
export function verifyTeacherCanGoLive(
  timetable: TimetableSlot[],
  teacherId: string | undefined,
  teacherName: string | undefined,
  subject: string,
  classLevel: string,
  day?: DayOfWeek,
  minutes?: number
): {
  allowed: boolean;
  activeSlot: TimetableSlot | null;
  scheduledSlotToday: TimetableSlot | null;
  reason: string;
} {
  const today = day || getCurrentSchoolDay();
  const todaySlots = getTeacherTodaySlots(timetable, teacherId, teacherName, today);

  // Check if there is an active slot for this teacher matching subject & class right now
  const activeSlot = todaySlots.find(
    (s) =>
      isSlotActiveNow(s, today, minutes) &&
      s.subject.toLowerCase() === subject.toLowerCase() &&
      s.classLevel.toLowerCase() === classLevel.toLowerCase()
  ) || null;

  if (activeSlot) {
    return {
      allowed: true,
      activeSlot,
      scheduledSlotToday: activeSlot,
      reason: `Authorized: Period ${activeSlot.periodNumber} (${activeSlot.startTime} - ${activeSlot.endTime}) for ${activeSlot.subject} (${activeSlot.classLevel}) is currently active.`,
    };
  }

  // Check if there is any scheduled slot for this subject & class today
  const scheduledSlotToday = todaySlots.find(
    (s) =>
      s.subject.toLowerCase() === subject.toLowerCase() &&
      s.classLevel.toLowerCase() === classLevel.toLowerCase()
  ) || null;

  if (scheduledSlotToday) {
    return {
      allowed: false,
      activeSlot: null,
      scheduledSlotToday,
      reason: `Timetable Notice: Period ${scheduledSlotToday.periodNumber} for ${scheduledSlotToday.subject} (${scheduledSlotToday.classLevel}) is scheduled for ${scheduledSlotToday.startTime} - ${scheduledSlotToday.endTime} today on ${today}.`,
    };
  }

  // Check if teacher has this slot on another day
  const allTeacherSlots = getTeacherTimetable(timetable, teacherId, teacherName);
  const otherDaySlot = allTeacherSlots.find(
    (s) =>
      s.subject.toLowerCase() === subject.toLowerCase() &&
      s.classLevel.toLowerCase() === classLevel.toLowerCase()
  );

  if (otherDaySlot) {
    return {
      allowed: false,
      activeSlot: null,
      scheduledSlotToday: null,
      reason: `Timetable Notice: ${otherDaySlot.subject} (${otherDaySlot.classLevel}) is scheduled on ${otherDaySlot.day} Period ${otherDaySlot.periodNumber} (${otherDaySlot.startTime} - ${otherDaySlot.endTime}).`,
    };
  }

  return {
    allowed: false,
    activeSlot: null,
    scheduledSlotToday: null,
    reason: `Subject/Class not found in teacher's assigned timetable.`,
  };
}
