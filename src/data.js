export const STORAGE_KEY = 'morrow-workspace-v1';

export const PEOPLE = {
  alex: { name: 'Alex', image: './images/avatar-alex.jpg' },
  maya: { name: 'Maya', image: './images/avatar-maya.jpg' },
  noah: { name: 'Noah', image: './images/avatar-noah.jpg' },
};

export const CATEGORIES = ['Work', 'Study', 'Personal', 'Admin'];
export const MODULES = [
  ['priorities', 'Top priorities'],
  ['projects', 'Project folders'],
  ['schedule', 'Today’s schedule'],
  ['team', 'Team space'],
  ['receipt', 'The stamp log'],
  ['reminders', 'Reminders'],
];

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key, days) {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function weekFor(key) {
  const date = dateFromKey(key);
  const distanceFromMonday = (date.getDay() + 6) % 7;
  const monday = addDays(key, -distanceFromMonday);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function prettyDate(key, options = { weekday: 'long', month: 'long', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en', options).format(dateFromKey(key));
}

export function prettyTime(value) {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Partition overlapping events into columns so none are hidden on the day timeline.
export function layoutDayEvents(events) {
  const minutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const ordered = [...events].sort((a, b) => minutes(a.start) - minutes(b.start) || minutes(a.end) - minutes(b.end));
  const result = [];
  let group = [];
  let groupEnd = -1;
  function flush() {
    const laneEnds = [];
    const placed = group.map((event) => {
      const start = minutes(event.start);
      let column = laneEnds.findIndex((end) => end <= start);
      if (column === -1) column = laneEnds.length;
      laneEnds[column] = minutes(event.end);
      return { ...event, column };
    });
    result.push(...placed.map((event) => ({ ...event, columns: laneEnds.length })));
    group = [];
  }
  for (const event of ordered) {
    if (group.length && minutes(event.start) >= groupEnd) flush();
    group.push(event);
    groupEnd = Math.max(group.length === 1 ? -1 : groupEnd, minutes(event.end));
  }
  if (group.length) flush();
  return result;
}

export function createInitialWorkspace(now = new Date()) {
  const today = dateKey(now);
  return {
    tasks: [
      { id: 't1', text: 'Finish the brand moodboard', category: 'Work', done: true },
      { id: 't2', text: 'Review chapter 04 notes', category: 'Study', done: true },
      { id: 't3', text: 'Send the project proposal', category: 'Work', done: false },
      { id: 't4', text: 'Plan next week’s priorities', category: 'Personal', done: false },
    ],
    projects: [
      { id: 'p1', title: 'Brand studio', category: 'Work', accent: 'peach', images: ['studio', 'notes', 'campus'], members: ['alex', 'maya', 'noah'] },
      { id: 'p2', title: 'Study corner', category: 'Study', accent: 'blue', images: ['campus', 'notes', 'studio'], members: ['alex', 'maya'] },
      { id: 'p3', title: 'Life, lately', category: 'Personal', accent: 'yellow', images: ['notes', 'studio', 'campus'], members: ['alex', 'noah'] },
    ],
    notes: [
      { id: 'n1', title: 'Brand moodboard ideas', body: 'A little collection of ideas for the new visual direction.\n\nKeep it warm, optimistic, and a little unexpected. Think tactile paper, bright color, and a human touch.', projectId: 'p1', updatedAt: now.toISOString() },
      { id: 'n2', title: 'Project kickoff notes', body: 'The goal: make something simple feel special.\n\n• Define the visual direction\n• Gather references\n• Share the first draft with the team', projectId: 'p1', updatedAt: now.toISOString() },
      { id: 'n3', title: 'Chapter 04: the big ideas', body: 'Things to come back to before the next study session.\n\n1. Review the key concepts\n2. Make a few flashcards\n3. Ask questions and connect the dots', projectId: 'p2', updatedAt: now.toISOString() },
      { id: 'n4', title: 'A little life list', body: 'Make time for the things that make the week feel good.\n\nA long walk, a good coffee, and a little less screen time.', projectId: 'p3', updatedAt: now.toISOString() },
    ],
    events: [
      { id: 'e1', title: 'Creative check-in', date: today, start: '09:00', end: '10:00', category: 'Work' },
      { id: 'e2', title: 'Deep work session', date: today, start: '11:30', end: '12:30', category: 'Study' },
      { id: 'e3', title: 'Project review', date: today, start: '14:00', end: '15:00', category: 'Personal' },
      { id: 'e4', title: 'Make time to brainstorm', date: addDays(today, 1), start: '10:00', end: '11:00', category: 'Work' },
    ],
    reminders: [
      { id: 'r1', title: 'Take a little break', date: today, time: '15:30' },
    ],
    messages: [
      { id: 'm1', author: 'maya', text: 'Just added the new ideas to our folder ✨', time: '9:12 AM' },
      { id: 'm2', author: 'noah', text: 'Love where this is going!', time: '9:14 AM' },
    ],
    stamped: false,
    modules: Object.fromEntries(MODULES.map(([key]) => [key, true])),
  };
}

export function loadWorkspace() {
  const initial = createInitialWorkspace();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return initial;
    return {
      ...initial,
      ...saved,
      modules: { ...initial.modules, ...(saved.modules || {}) },
      tasks: Array.isArray(saved.tasks) ? saved.tasks : initial.tasks,
      projects: Array.isArray(saved.projects) ? saved.projects : initial.projects,
      notes: Array.isArray(saved.notes) ? saved.notes : initial.notes,
      events: Array.isArray(saved.events) ? saved.events : initial.events,
      reminders: Array.isArray(saved.reminders) ? saved.reminders : initial.reminders,
      messages: Array.isArray(saved.messages) ? saved.messages : initial.messages,
    };
  } catch {
    return initial;
  }
}
