import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bell, BookOpen, CalendarDays, Check,
  CheckSquare, ChevronDown, ChevronLeft, ChevronRight, Clock3, FileText, Folder,
  FolderOpen, LayoutGrid, MessageCircle, MoreHorizontal, Paperclip, PenLine,
  Plus, Search, Send, SlidersHorizontal, Sparkles, StickyNote, Sun, Trash2, X,
} from 'lucide-react';
import {
  addDays, CATEGORIES, createId, createInitialWorkspace, dateFromKey, dateKey,
  layoutDayEvents, loadWorkspace, MODULES, PEOPLE, prettyDate, prettyTime, STORAGE_KEY, weekFor,
} from './data.js';

const NAV_ITEMS = [
  { id: 'home', label: 'Overview', Icon: LayoutGrid },
  { id: 'tasks', label: 'My tasks', Icon: CheckSquare },
  { id: 'projects', label: 'Projects', Icon: Folder },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { id: 'messages', label: 'Messages', Icon: MessageCircle },
  { id: 'notes', label: 'My notes', Icon: StickyNote },
];

const PAGE_TITLES = {
  home: 'Overview', tasks: 'My tasks', projects: 'Projects',
  calendar: 'Calendar', messages: 'Messages', notes: 'My notes',
};

function Mark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <path d="M18.4 1h5.2l-.7 13.1L32 4.7l3.7 3.7-9.4 9.1 13.1-.7V22l-13.1-.7 9.4 9.1-3.7 3.7-9.1-9.4.7 13.1h-5.2l.7-13.1-9.1 9.4-3.7-3.7 9.4-9.1L2.6 22v-5.2l13.1.7-9.4-9.1L10 4.7l9.1 9.4L18.4 1Z" fill="currentColor" />
    </svg>
  );
}

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`}><span className="brand-mark"><Mark /></span><span>morrow<span className="brand-dot">.</span></span></div>;
}

function Avatar({ person = 'alex', size = 'normal', className = '' }) {
  const profile = PEOPLE[person] || PEOPLE.alex;
  return <img className={`avatar avatar-${size} ${className}`} src={profile.image} alt={profile.name} />;
}

function AvatarStack({ people = ['alex', 'maya', 'noah'], size = 'normal' }) {
  return <div className={`avatar-stack avatar-stack-${size}`} aria-label={`${people.map((person) => PEOPLE[person]?.name || 'Alex').join(', ')} sample members`}>
    {people.map((person, index) => <Avatar key={`${person}-${index}`} person={person} size={size} />)}
  </div>;
}

function Tag({ category }) {
  return <span className={`tag tag-${(category || 'Personal').toLowerCase()}`}>{category}</span>;
}

function Sidebar({ page, navigate, openModal, data }) {
  return <aside className="sidebar">
    <div className="sidebar-top"><Brand /></div>
    <button className="workspace-switcher" onClick={() => openModal({ type: 'profile' })}>
      <span className="workspace-symbol"><Mark /></span>
      <span className="workspace-switcher-text"><strong>My workspace</strong><small>PERSONAL SPACE</small></span>
      <ChevronDown size={15} />
    </button>
    <div className="sidebar-label">WORKSPACE <span>✳</span></div>
    <nav className="desktop-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ id, label, Icon }) => <button key={id} className={`side-link ${page === id ? 'active' : ''}`} onClick={() => navigate(id)}>
        <Icon size={19} strokeWidth={1.8} /><span>{label}</span>{id === 'messages' && <span className="side-count">2</span>}
      </button>)}
    </nav>
    <div className="sidebar-label spaces-label">YOUR SPACES <button aria-label="Create project" onClick={() => openModal({ type: 'create', kind: 'Project' })}><Plus size={16} /></button></div>
    <div className="space-links">
      {data.projects.slice(0, 3).map((project, index) => <button key={project.id} className="space-link" onClick={() => openModal({ type: 'project', id: project.id })}>
        <span className={`space-dot dot-${index % 3}`} />{project.title}
      </button>)}
    </div>
    <div className="sidebar-bottom">
      <div className="sidebar-note"><span className="sidebar-note-star">✳</span><div><strong>A little more room<br />for your ideas.</strong><p>Make space for what matters.</p></div><button onClick={() => openModal({ type: 'create', kind: 'Note' })} aria-label="Create a note"><ArrowUpRight size={17} /></button></div>
      <button className="sidebar-profile" onClick={() => openModal({ type: 'profile' })}>
        <Avatar person="alex" /><span><strong>Alex Morgan</strong><small>Personal workspace</small></span><MoreHorizontal size={19} />
      </button>
    </div>
  </aside>;
}

function Topbar({ page, openModal }) {
  return <header className="topbar">
    <div className="mobile-brand"><Brand compact /></div>
    <div className="breadcrumb"><span>My workspace</span><span className="breadcrumb-slash">/</span><strong>{PAGE_TITLES[page]}</strong></div>
    <div className="topbar-actions">
      <button className="search-trigger" onClick={() => openModal({ type: 'search' })}><Search size={17} /><span>Search anything</span><kbd>⌘ K</kbd></button>
      <button className="icon-button top-icon mobile-search" aria-label="Search" onClick={() => openModal({ type: 'search' })}><Search size={19} /></button>
      <button className="icon-button top-icon notification-button" aria-label="Notifications" onClick={() => openModal({ type: 'notifications' })}><Bell size={19} /><span className="notification-dot" /></button>
      <button className="top-avatar-button" aria-label="Open your workspace" onClick={() => openModal({ type: 'profile' })}><Avatar person="alex" /></button>
    </div>
  </header>;
}

function BottomNav({ page, navigate, openModal }) {
  return <nav className="bottom-nav" aria-label="Mobile navigation">
    <button className={page === 'home' || page === 'tasks' ? 'selected' : ''} onClick={() => navigate('home')} aria-label="Overview"><LayoutGrid size={21} /><span>Home</span></button>
    <button className={page === 'projects' || page === 'notes' ? 'selected' : ''} onClick={() => navigate('projects')} aria-label="Projects"><Folder size={21} /><span>Files</span></button>
    <button className="bottom-add" onClick={() => openModal({ type: 'create', kind: 'Task' })} aria-label="Create new item"><Plus size={25} strokeWidth={1.8} /></button>
    <button className={page === 'calendar' ? 'selected' : ''} onClick={() => navigate('calendar')} aria-label="Calendar"><CalendarDays size={21} /><span>Calendar</span></button>
    <button className={page === 'messages' ? 'selected' : ''} onClick={() => navigate('messages')} aria-label="Messages"><MessageCircle size={21} /><span>Chat</span></button>
  </nav>;
}

function PageHeading({ page, openModal }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const headings = {
    home: [<>{greeting}, Alex <span className="greeting-sun">✳</span></>, 'A little space for everything on your mind.'],
    tasks: ['Let’s get things done.', 'Small steps make the big things happen.'],
    projects: ['A home for your ideas.', 'All your projects, plans, and possibilities.'],
    calendar: ['Make time for what matters.', 'A little structure makes room for a lot more.'],
    messages: ['Better together.', 'A little space for the conversations that count.'],
    notes: ['Your thoughts, in one place.', 'Capture the little ideas and the big ones, too.'],
  };
  return <div className="page-heading">
    <div><div className="eyebrow heading-eyebrow"><span className="eyebrow-sparkle">✳</span> {page === 'home' ? 'YOUR SPACE, YOUR PACE' : 'YOUR WORKSPACE'} <span className="eyebrow-divider">/</span> {prettyDate(dateKey(), { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}</div>
      <h1>{headings[page][0]}</h1><p>{headings[page][1]}</p>
    </div>
    <div className="heading-actions">
      {page === 'home' && <button className="button button-outline customize-button" onClick={() => openModal({ type: 'customize' })}><SlidersHorizontal size={16} /><span>Customize</span></button>}
      <button className="button button-dark heading-create" onClick={() => openModal({ type: 'create', kind: page === 'notes' ? 'Note' : page === 'calendar' ? 'Event' : page === 'projects' ? 'Project' : 'Task' })}><Plus size={18} /><span>New item</span></button>
    </div>
  </div>;
}

function Hero({ tasks, navigate }) {
  const completed = tasks.filter((task) => task.done).length;
  return <section className="hero-card">
    <div className="hero-copy">
      <div className="hero-kicker"><span className="hero-kicker-dot" /> A LITTLE NOTE TO YOU</div>
      <h2>Make a little room<br /><em>for big ideas.</em></h2>
      <p>Less on your mind, more in your day.<br className="hero-break" /> Let’s make today a good one.</p>
      <button className="hero-link" onClick={() => navigate('calendar')}>Plan your day <span><ArrowUpRight size={15} /></span></button>
    </div>
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art-grid" />
      <div className="hero-art-card hero-art-back"><span>GOOD<br />THINGS<br />AHEAD.</span><Mark /></div>
      <div className="hero-art-card hero-art-front"><div className="hero-art-top"><span>THE DAILY PLAN</span><span>✳</span></div><div className="hero-art-line line-short" /><div className="hero-art-line line-long" /><div className="hero-art-line line-mid" /><div className="hero-art-bottom"><span className="hero-art-check"><Check size={13} strokeWidth={3} /></span><span>{completed}/{tasks.length} little wins</span></div></div>
      <div className="hero-sticker"><Sparkles size={18} /><span>YOU<br />GOT THIS</span></div>
      <span className="hero-art-scribble">✳</span>
    </div>
    <span className="hero-index">01 / THE EVERYDAY</span>
  </section>;
}

function WidgetHeading({ eyebrow, title, action, actionLabel, icon, className = '' }) {
  return <div className={`widget-heading ${className}`}><div>{eyebrow && <div className="widget-eyebrow">{icon && <span>{icon}</span>}{eyebrow}</div>}<h2>{title}</h2></div>{action && <button className="text-action" onClick={action}>{actionLabel || 'View all'} <ArrowUpRight size={15} /></button>}</div>;
}

function TaskRow({ task, toggleTask, removeTask, showDelete = false }) {
  return <div className={`task-row ${task.done ? 'task-complete' : ''}`}>
    <button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggleTask(task.id)} aria-label={`${task.done ? 'Mark incomplete' : 'Mark complete'}: ${task.text}`} aria-pressed={task.done}>{task.done && <Check size={13} strokeWidth={3} />}</button>
    <span className="task-name">{task.text}</span><Tag category={task.category} />
    {showDelete && <button className="row-delete" onClick={() => removeTask(task.id)} aria-label={`Delete ${task.text}`}><Trash2 size={15} /></button>}
  </div>;
}

function Priorities({ tasks, toggleTask, navigate, openModal }) {
  const completed = tasks.filter((task) => task.done).length;
  return <section className="card priorities-card">
    <div className="card-top-line"><div className="widget-eyebrow"><span className="little-blue-icon"><Check size={11} strokeWidth={3} /></span> MAKE IT HAPPEN</div><button className="more-button" aria-label="View all tasks" onClick={() => navigate('tasks')}><MoreHorizontal size={20} /></button></div>
    <div className="priority-title-line"><div><h2>Top priorities</h2><p>A little progress goes a long way.</p></div><div className="priority-count"><strong>{String(completed).padStart(2, '0')}</strong><span> / {String(tasks.length).padStart(2, '0')}</span></div></div>
    <div className="progress-track"><div className="progress-fill" style={{ width: `${tasks.length ? (completed / tasks.length) * 100 : 0}%` }} /></div>
    <div className="priority-list">{tasks.length ? tasks.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} toggleTask={toggleTask} />) : <div className="empty-inline">A fresh start! Add your first priority.</div>}</div>
    <div className="card-footer"><button onClick={() => openModal({ type: 'create', kind: 'Task' })}><Plus size={15} /> Add a priority</button><button onClick={() => navigate('tasks')}>View all <ArrowRight size={14} /></button></div>
  </section>;
}

function ProjectCard({ project, noteCount, openModal }) {
  return <button className={`project-folder folder-${project.accent || 'peach'}`} onClick={() => openModal({ type: 'project', id: project.id })}>
    <span className="folder-back"><span className="folder-tab" /></span>
    <span className="folder-photos">{(project.images || ['studio', 'notes', 'campus']).slice(0, 3).map((image, index) => <img key={`${image}-${index}`} className={`folder-photo photo-${index}`} src={`./images/${image}.jpg`} alt="" />)}</span>
    <span className="folder-front">
      <span className="folder-front-top"><span className="folder-mini-label"><span className="folder-category-dot" /> {project.category.toUpperCase()} SPACE</span><span className="folder-clip"><Paperclip size={22} strokeWidth={1.5} /></span></span>
      <span className="folder-title">{project.title}</span>
      <span className="folder-description">{noteCount} {noteCount === 1 ? 'note' : 'notes'} <span>·</span> A space to create</span>
      <span className="folder-bottom"><AvatarStack people={project.members || ['alex']} size="small" /><span className="folder-arrow"><ArrowUpRight size={16} /></span></span>
    </span>
  </button>;
}

function ProjectsWidget({ projects, notes, navigate, openModal }) {
  return <section className="projects-widget">
    <WidgetHeading eyebrow="KEEP YOUR IDEAS CLOSE" title="Your projects" action={() => navigate('projects')} actionLabel="View all projects" />
    <div className="project-grid">{projects.slice(0, 2).map((project) => <ProjectCard key={project.id} project={project} noteCount={notes.filter((note) => note.projectId === project.id).length} openModal={openModal} />)}</div>
    {!projects.length && <div className="card empty-card">No projects yet. <button onClick={() => openModal({ type: 'create', kind: 'Project' })}>Create one</button></div>}
  </section>;
}

function ScheduleWidget({ events, navigate, openModal }) {
  const todayEvents = events.filter((event) => event.date === dateKey()).sort((a, b) => a.start.localeCompare(b.start));
  return <section className="card schedule-card">
    <div className="card-top-line"><div className="widget-eyebrow"><span className="little-calendar-icon"><CalendarDays size={13} /></span> A LOOK AT YOUR DAY</div><button className="more-button" onClick={() => navigate('calendar')} aria-label="Open calendar"><ArrowUpRight size={19} /></button></div>
    <div className="schedule-heading"><div><h2>Today’s schedule</h2><p>{prettyDate(dateKey(), { weekday: 'long', month: 'short', day: 'numeric' })} <span>·</span> {todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'}</p></div><span className="schedule-day">{dateFromKey(dateKey()).getDate()}</span></div>
    <div className="mini-timeline">
      {todayEvents.slice(0, 3).map((event) => <div className="mini-event" key={event.id}><span className="mini-time">{prettyTime(event.start).replace(' ', '\u00a0')}</span><div className={`mini-event-block event-${event.category.toLowerCase()}`}><span className="event-line" /><span><strong>{event.title}</strong><small>{prettyTime(event.start)} – {prettyTime(event.end)}</small></span></div></div>)}
      {!todayEvents.length && <div className="empty-inline">A little breathing room. Nothing planned yet.</div>}
    </div>
    <div className="card-footer schedule-footer"><button onClick={() => openModal({ type: 'create', kind: 'Event' })}><Plus size={15} /> Add event</button><button onClick={() => navigate('calendar')}>See calendar <ArrowRight size={14} /></button></div>
  </section>;
}

function ChatWidget({ messages, onSend, full = false }) {
  const [message, setMessage] = useState('');
  function submit(event) {
    event.preventDefault();
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  }
  const visible = full ? messages : messages.slice(-3);
  return <section className={`card chat-card ${full ? 'chat-full' : ''}`}>
    <div className="chat-header"><div><div className="widget-eyebrow"><span className="chat-mini-icon"><MessageCircle size={13} /></span> A LITTLE BETTER TOGETHER</div><h2>Team space <span className="chat-sparkle">✳</span></h2><p>Good ideas are better shared.</p></div><div className="chat-members"><AvatarStack /><span>Sample team</span></div></div>
    <div className="chat-body">
      {visible.map((item) => <div key={item.id} className={`chat-message ${item.author === 'alex' ? 'chat-mine' : ''}`}><Avatar person={item.author} size="small" /><div><div className="message-meta"><strong>{PEOPLE[item.author]?.name || 'Alex'}</strong><span>{item.time}</span></div><div className="message-bubble">{item.text}</div></div></div>)}
    </div>
    <form className="chat-input" onSubmit={submit}><input aria-label="Write a message" placeholder="Write a little message..." value={message} onChange={(event) => setMessage(event.target.value)} /><button type="submit" aria-label="Send message"><Send size={16} /></button></form>
    <div className="local-note"><span /> LOCAL DEMO · MESSAGES STAY ON THIS DEVICE</div>
  </section>;
}

function ReceiptWidget({ stamped, toggleStamp }) {
  return <section className="receipt-widget">
    <div className="receipt-heading"><div><div className="widget-eyebrow">A PAPER TRAIL, BUT FUN</div><h2>The stamp log</h2><p>Keep the little things moving.</p></div><span className="receipt-heading-star">✳</span></div>
    <div className="receipt-paper"><div className="receipt-top"><div><span>DOCUMENT NO. 001</span><strong>Project brief.pdf</strong></div><div className="receipt-icon"><FileText size={18} /></div></div><div className="receipt-rule" /><div className="receipt-row"><span><b className="receipt-person pink">M</b> Maya added a note</span><small>9:12 AM</small></div><div className="receipt-row"><span><b className="receipt-person green">N</b> Noah made an edit</span><small>9:24 AM</small></div>{stamped && <div className="receipt-row"><span><b className="receipt-person yellow">A</b> You stamped reviewed</span><small>NOW</small></div>}<div className="receipt-bottom"><div><span>STATUS</span><strong>{stamped ? 'LOOKING GOOD!' : 'READY FOR REVIEW'}</strong></div><span className={`stamp-graphic ${stamped ? 'is-stamped' : ''}`}>{stamped ? 'REVIEWED' : 'STAMP\nME!'}</span></div></div>
    <button className="stamp-button" onClick={toggleStamp}>{stamped ? 'Undo your stamp' : 'Stamp as reviewed'} <ArrowUpRight size={15} /></button>
  </section>;
}

function RemindersWidget({ reminders, openModal }) {
  const upcoming = reminders.filter((item) => item.date >= dateKey()).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 1);
  return <section className="reminder-card"><div className="reminder-icon"><Bell size={18} /></div><div className="reminder-copy"><div className="widget-eyebrow">A GENTLE REMINDER</div>{upcoming.length ? <><strong>{upcoming[0].title}</strong><small>{prettyDate(upcoming[0].date, { month: 'short', day: 'numeric' })} · {prettyTime(upcoming[0].time)} · In-app only</small></> : <><strong>Make a little reminder</strong><small>Keep it in sight, not on your mind.</small></>}</div><button aria-label="Add reminder" onClick={() => openModal({ type: 'create', kind: 'Reminder' })}><Plus size={18} /></button></section>;
}

function Home({ data, toggleTask, navigate, openModal, onSend, toggleStamp }) {
  const modules = data.modules;
  return <div className="dashboard-board">
    <div className="board-left">
      <div className="board-hero"><Hero tasks={data.tasks} navigate={navigate} /></div>
      {modules.projects && <div className="board-projects"><ProjectsWidget projects={data.projects} notes={data.notes} navigate={navigate} openModal={openModal} /></div>}
      {(modules.team || modules.receipt) && <div className={`board-lower ${!modules.team || !modules.receipt ? 'board-lower-single' : ''}`}>
        {modules.team && <div className="board-team"><ChatWidget messages={data.messages} onSend={onSend} /></div>}
        {modules.receipt && <div className="board-receipt"><ReceiptWidget stamped={data.stamped} toggleStamp={toggleStamp} /></div>}
      </div>}
    </div>
    <div className="board-right">
      {modules.priorities && <div className="board-priorities"><Priorities tasks={data.tasks} toggleTask={toggleTask} navigate={navigate} openModal={openModal} /></div>}
      {modules.schedule && <div className="board-schedule"><ScheduleWidget events={data.events} navigate={navigate} openModal={openModal} /></div>}
      {modules.reminders && <div className="board-reminders"><RemindersWidget reminders={data.reminders} openModal={openModal} /></div>}
    </div>
  </div>;
}

function TasksPage({ data, toggleTask, removeTask, openModal }) {
  const completed = data.tasks.filter((task) => task.done).length;
  return <div className="subpage-grid"><section className="card large-list-card"><div className="subpage-card-header"><div><div className="widget-eyebrow">ONE THING AT A TIME</div><h2>All priorities</h2><p>{completed} of {data.tasks.length} completed. You’re doing great.</p></div><button className="round-add" onClick={() => openModal({ type: 'create', kind: 'Task' })} aria-label="Add task"><Plus size={19} /></button></div><div className="all-task-list">{data.tasks.length ? data.tasks.map((task) => <TaskRow key={task.id} task={task} toggleTask={toggleTask} removeTask={removeTask} showDelete />) : <div className="empty-card">Nothing on your list yet. Enjoy the breathing room.</div>}</div></section><aside className="task-side-note"><Mark /><span>ONE DAY AT A TIME</span><h2>Progress, not perfection.</h2><p>It all adds up, even the little things.</p></aside></div>;
}

function ProjectsPage({ data, openModal, navigate }) {
  return <div className="projects-page"><div className="page-section-bar"><div><div className="widget-eyebrow">A LITTLE BIT OF EVERYTHING</div><h2>All your spaces <span className="heading-number">{String(data.projects.length).padStart(2, '0')}</span></h2></div><button className="text-action" onClick={() => navigate('notes')}>Explore notes <ArrowUpRight size={15} /></button></div><div className="project-grid project-grid-full">{data.projects.map((project) => <ProjectCard key={project.id} project={project} noteCount={data.notes.filter((note) => note.projectId === project.id).length} openModal={openModal} />)}<button className="new-folder" onClick={() => openModal({ type: 'create', kind: 'Project' })}><span><Plus size={25} /></span><strong>Make a new space</strong><small>For your next big idea</small></button></div></div>;
}

function NotesPage({ data, openModal }) {
  return <div className="notes-page"><div className="page-section-bar"><div><div className="widget-eyebrow">A PLACE TO THINK</div><h2>All notes <span className="heading-number">{String(data.notes.length).padStart(2, '0')}</span></h2></div><button className="text-action" onClick={() => openModal({ type: 'create', kind: 'Note' })}><Plus size={15} /> New note</button></div><div className="note-grid">{data.notes.map((note, index) => <button className={`note-card note-color-${index % 4}`} key={note.id} onClick={() => openModal({ type: 'note', id: note.id })}><span className="note-card-top"><span className="note-card-icon"><StickyNote size={17} /></span><ArrowUpRight size={17} /></span><strong>{note.title}</strong><p>{note.body || 'An empty page, full of possibility.'}</p><span className="note-card-bottom"><span>{data.projects.find((project) => project.id === note.projectId)?.title || 'Unfiled'}</span><span>{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(note.updatedAt))}</span></span></button>)}<button className="new-note-card" onClick={() => openModal({ type: 'create', kind: 'Note' })}><Plus size={22} /><span>Start a new note</span></button></div></div>;
}

function CalendarPage({ data, openModal, removeEvent, removeReminder }) {
  const [selected, setSelected] = useState(dateKey());
  const [view, setView] = useState('Day');
  const week = weekFor(selected);
  const events = data.events.filter((event) => event.date === selected).sort((a, b) => a.start.localeCompare(b.start));
  const startHour = Math.min(8, ...events.map((event) => Number(event.start.slice(0, 2))));
  const endHour = Math.max(18, ...events.map((event) => Math.ceil((Number(event.end.slice(0, 2)) * 60 + Number(event.end.slice(3))) / 60)));
  const hours = Array.from({ length: Math.max(endHour - startHour, 1) + 1 }, (_, index) => startHour + index);
  const dayReminders = data.reminders.filter((item) => item.date === selected).sort((a, b) => a.time.localeCompare(b.time));
  return <div className="calendar-layout"><section className="card calendar-card"><div className="calendar-top"><div><div className="widget-eyebrow">A LITTLE TIME FOR EVERYTHING</div><h2>{prettyDate(selected, { month: 'long', year: 'numeric' })}</h2></div><div className="calendar-controls"><button onClick={() => setSelected(addDays(selected, -7))} aria-label="Previous week"><ChevronLeft size={18} /></button><button onClick={() => setSelected(dateKey())}>Today</button><button onClick={() => setSelected(addDays(selected, 7))} aria-label="Next week"><ChevronRight size={18} /></button></div></div><div className="week-strip">{week.map((day) => <button className={day === selected ? 'active' : ''} key={day} onClick={() => setSelected(day)}><span>{prettyDate(day, { weekday: 'short' })}</span><strong>{dateFromKey(day).getDate()}</strong><i className={data.events.some((event) => event.date === day) ? 'has-events' : ''} /></button>)}</div><div className="calendar-view-heading"><div><h3>{prettyDate(selected, { weekday: 'long', month: 'short', day: 'numeric' })}</h3><p>{view === 'Day' ? `${events.length} ${events.length === 1 ? 'event' : 'events'} planned` : 'Your week, at a glance'}</p></div><div className="segmented-control">{['Day', 'Week'].map((item) => <button className={view === item ? 'active' : ''} key={item} onClick={() => setView(item)}>{item}</button>)}</div></div>
    {view === 'Day' ? <div className="full-timeline" style={{ height: `${hours.length * 68}px` }}><div className="timeline-hours">{hours.map((hour) => <div className="hour-row" key={hour}><span>{prettyTime(`${String(hour % 24).padStart(2, '0')}:00`).replace(':00', '')}</span><i /></div>)}</div><div className="timeline-blocks">{layoutDayEvents(events).map((event) => { const start = Number(event.start.slice(0, 2)) * 60 + Number(event.start.slice(3)); const end = Number(event.end.slice(0, 2)) * 60 + Number(event.end.slice(3)); return <div key={event.id} className={`timeline-event event-${event.category.toLowerCase()}`} style={{ top: `${((start - startHour * 60) / 60) * 68}px`, minHeight: `${Math.max(((end - start) / 60) * 68 - 5, 50)}px`, left: `${(event.column / event.columns) * 100}%`, width: `calc(${100 / event.columns}% - 4px)`, right: 'auto' }}><div><strong>{event.title}</strong><span>{prettyTime(event.start)} – {prettyTime(event.end)}</span></div><button onClick={() => removeEvent(event.id)} aria-label={`Delete ${event.title}`}><X size={14} /></button></div>; })}</div></div> : <div className="week-list">{week.map((day) => { const dayEvents = data.events.filter((event) => event.date === day).sort((a, b) => a.start.localeCompare(b.start)); return <div className="week-list-day" key={day}><div><strong>{prettyDate(day, { weekday: 'long' })}</strong><span>{prettyDate(day, { month: 'short', day: 'numeric' })}</span></div><section>{dayEvents.length ? dayEvents.map((event) => <div className={`week-event event-${event.category.toLowerCase()}`} key={event.id}><span>{prettyTime(event.start)}</span><strong>{event.title}</strong><button onClick={() => removeEvent(event.id)} aria-label={`Delete ${event.title}`}><X size={14} /></button></div>) : <p>A little breathing room.</p>}</section></div>; })}</div>}
    </section><aside className="calendar-aside"><div className="calendar-aside-art"><span>✳</span><div className="widget-eyebrow">DON’T FORGET</div><h2>A little reminder.</h2><p>Make space to pause and come back to yourself.</p><button onClick={() => openModal({ type: 'create', kind: 'Reminder', date: selected })}>Add reminder <Plus size={15} /></button></div><div className="card reminder-list-card"><div className="widget-eyebrow">IN-APP REMINDERS</div><h3>For this day</h3>{dayReminders.length ? dayReminders.map((item) => <div className="reminder-list-row" key={item.id}><span><Bell size={15} /><span><strong>{item.title}</strong><small>{prettyTime(item.time)}</small></span></span><button onClick={() => removeReminder(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={15} /></button></div>) : <p>Nothing here yet.</p>}<small>Reminders appear in the app; they don’t send device notifications.</small></div><button className="button button-dark calendar-add" onClick={() => openModal({ type: 'create', kind: 'Event', date: selected })}><Plus size={18} /> Add an event</button></aside></div>;
}

function Modal({ children, onClose, wide = false }) {
  useEffect(() => {
    const listener = (event) => { if (event.key === 'Escape') onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', listener);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', listener); };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-label="Workspace dialog" aria-modal="true"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>{children}</div></div>;
}

function CreateModal({ initialKind = 'Task', initialDate, initialProject, projects, onCreate, onClose }) {
  const [kind, setKind] = useState(initialKind);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Work');
  const [projectId, setProjectId] = useState(initialProject || '');
  const [date, setDate] = useState(initialDate || dateKey());
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [error, setError] = useState('');
  const kinds = ['Task', 'Note', 'Event', 'Project', 'Reminder'];
  function submit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    if (kind === 'Event' && end <= start) { setError('The end time must be after the start time.'); return; }
    setError('');
    onCreate({ kind, title: title.trim(), body, category, projectId, date, start, end });
  }
  return <Modal onClose={onClose}><div className="modal-kicker">MAKE A LITTLE SPACE</div><h2>Something new.</h2><p className="modal-subtitle">What would you like to add today?</p><div className="create-tabs">{kinds.map((item) => <button className={kind === item ? 'active' : ''} key={item} onClick={() => { setKind(item); setError(''); }} type="button">{item}</button>)}</div><form className="modal-form" onSubmit={submit}><label>{kind === 'Project' ? 'Space name' : kind === 'Note' ? 'Note title' : `${kind} name`}<input autoFocus required maxLength={100} placeholder={kind === 'Task' ? 'What’s on your mind?' : kind === 'Project' ? 'Give your space a name' : `Name your ${kind.toLowerCase()}`} value={title} onChange={(event) => setTitle(event.target.value)} /></label>{kind === 'Note' && <><label>Your note<textarea rows="5" placeholder="Start with a little thought..." value={body} onChange={(event) => setBody(event.target.value)} /></label><label>Project <select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Unfiled</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}</select></label></>}{['Task', 'Event', 'Project'].includes(kind) && <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>}{['Event', 'Reminder'].includes(kind) && <><label>Date<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label><div className="form-row"><label>{kind === 'Reminder' ? 'Time' : 'Starts'}<input type="time" required value={start} onChange={(event) => setStart(event.target.value)} /></label>{kind === 'Event' && <label>Ends<input type="time" required value={end} onChange={(event) => setEnd(event.target.value)} /></label>}</div></>}{kind === 'Reminder' && <p className="form-hint">This is an in-app reminder, not a device notification.</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark modal-submit" type="submit"><Plus size={17} /> Add {kind.toLowerCase()}</button></form></Modal>;
}

function ProjectModal({ project, notes, openModal, onClose }) {
  if (!project) return null;
  const projectNotes = notes.filter((note) => note.projectId === project.id);
  return <Modal onClose={onClose}><div className="modal-kicker">A SPACE FOR YOUR IDEAS</div><h2>{project.title}</h2><p className="modal-subtitle">All the little things that make up something big.</p><div className="project-modal-cover"><img src={`./images/${(project.images || ['studio'])[0]}.jpg`} alt="" /><div><Tag category={project.category} /><strong>{projectNotes.length} {projectNotes.length === 1 ? 'note' : 'notes'}</strong><AvatarStack people={project.members || ['alex']} size="small" /></div></div><div className="modal-list-heading"><strong>Notes in this space</strong><button onClick={() => openModal({ type: 'create', kind: 'Note', projectId: project.id })}><Plus size={16} /> Add note</button></div><div className="modal-note-list">{projectNotes.length ? projectNotes.map((note) => <button key={note.id} onClick={() => openModal({ type: 'note', id: note.id })}><span><StickyNote size={17} />{note.title}</span><ArrowUpRight size={16} /></button>) : <p>Nothing here yet. Start with a note.</p>}</div></Modal>;
}

function NoteModal({ note, projects, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [projectId, setProjectId] = useState(note.projectId || '');
  return <Modal onClose={onClose} wide><div className="modal-kicker">A PLACE TO THINK</div><h2>Your note.</h2><p className="modal-subtitle">An idea worth keeping, just as it is.</p><form className="modal-form" onSubmit={(event) => { event.preventDefault(); if (title.trim()) onSave({ ...note, title: title.trim(), body, projectId, updatedAt: new Date().toISOString() }); }}><label>Title<input required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Note<textarea className="note-editor" rows="10" value={body} onChange={(event) => setBody(event.target.value)} /></label><label>Project<select value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="">Unfiled</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label><div className="note-modal-actions"><button type="button" className="delete-note" onClick={() => { if (window.confirm('Delete this note?')) onDelete(note.id); }}><Trash2 size={16} /> Delete note</button><button className="button button-dark" type="submit"><Check size={17} /> Save note</button></div></form></Modal>;
}

function CustomizeModal({ modules, toggleModule, onClose }) {
  return <Modal onClose={onClose}><div className="modal-kicker">MAKE IT YOURS</div><h2>Your kind of day.</h2><p className="modal-subtitle">Choose the cards you’d like to see on your overview.</p><div className="module-list">{MODULES.map(([key, label]) => <label key={key}><span>{label}</span><input type="checkbox" checked={modules[key]} onChange={() => toggleModule(key)} /><i /></label>)}</div><button className="button button-dark modal-submit" onClick={onClose}>Done <Check size={17} /></button></Modal>;
}

function SearchModal({ data, navigate, openModal, onClose }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const projects = term ? data.projects.filter((item) => item.title.toLowerCase().includes(term)) : [];
  const notes = term ? data.notes.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(term)) : [];
  const tasks = term ? data.tasks.filter((item) => item.text.toLowerCase().includes(term)) : [];
  return <Modal onClose={onClose}><div className="modal-kicker">FIND YOUR THING</div><h2>Search your space.</h2><div className="modal-search"><Search size={19} /><input autoFocus placeholder="Search tasks, projects, notes..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="search-results">{!term && <p>Everything you need is right here.</p>}{term && !projects.length && !notes.length && !tasks.length && <p>No results yet. Try another word.</p>}{projects.map((item) => <button key={item.id} onClick={() => openModal({ type: 'project', id: item.id })}><Folder size={17} /><span><strong>{item.title}</strong><small>Project</small></span><ArrowUpRight size={16} /></button>)}{notes.map((item) => <button key={item.id} onClick={() => openModal({ type: 'note', id: item.id })}><StickyNote size={17} /><span><strong>{item.title}</strong><small>Note</small></span><ArrowUpRight size={16} /></button>)}{tasks.map((item) => <button key={item.id} onClick={() => { onClose(); navigate('tasks'); }}><CheckSquare size={17} /><span><strong>{item.text}</strong><small>Task</small></span><ArrowUpRight size={16} /></button>)}</div></Modal>;
}

function InfoModal({ type, onClose, reset }) {
  const profile = type === 'profile';
  return <Modal onClose={onClose}><div className="modal-kicker">{profile ? 'YOUR LITTLE CORNER' : 'ALL CAUGHT UP'}</div><h2>{profile ? 'Hello, Alex.' : 'Nothing new here.'}</h2><p className="modal-subtitle">{profile ? 'A little space for everything that matters to you.' : 'There are no device notifications in this offline demo.'}</p>{profile && <><div className="profile-panel"><Avatar person="alex" size="large" /><div><strong>Alex Morgan</strong><span>Personal workspace</span></div><span className="profile-local">LOCAL</span></div><div className="info-copy"><strong>Made for your everyday.</strong><p>This is a local-first demo. Your notes, tasks, messages and stamps are saved on this device. Sample team activity is illustrative; it isn’t synced with other people.</p></div><button className="reset-button" onClick={() => { if (window.confirm('Reset the workspace? This will remove your locally saved changes.')) reset(); }}>Reset sample workspace</button></>}<button className="button button-dark modal-submit" onClick={onClose}>Got it <Check size={17} /></button></Modal>;
}

export default function App() {
  const [data, setData] = useState(loadWorkspace);
  const [page, setPage] = useState('home');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* Keep the workspace usable in memory if storage is unavailable. */ } }, [data]);
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 2800); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const listener = (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setModal({ type: 'search' }); } };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  useEffect(() => {
    window.morrowHandleBack = () => { if (modal) { setModal(null); return true; } if (page !== 'home') { setPage('home'); window.scrollTo({ top: 0 }); return true; } return false; };
    return () => { delete window.morrowHandleBack; };
  }, [modal, page]);
  const selectedProject = useMemo(() => data.projects.find((project) => project.id === modal?.id), [data.projects, modal]);
  const selectedNote = useMemo(() => data.notes.find((note) => note.id === modal?.id), [data.notes, modal]);
  const openModal = (value) => setModal(value);
  const closeModal = () => setModal(null);
  const navigate = (next) => { setPage(next); setModal(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toggleTask = (id) => setData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) }));
  const removeTask = (id) => { setData((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) })); setToast('Priority removed.'); };
  const removeEvent = (id) => { setData((current) => ({ ...current, events: current.events.filter((event) => event.id !== id) })); setToast('Event removed.'); };
  const removeReminder = (id) => { setData((current) => ({ ...current, reminders: current.reminders.filter((item) => item.id !== id) })); setToast('Reminder removed.'); };
  const sendMessage = (text) => { const time = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date()); setData((current) => ({ ...current, messages: [...current.messages, { id: createId(), author: 'alex', text, time }] })); };
  const createItem = (item) => {
    const id = createId();
    setData((current) => {
      if (item.kind === 'Task') return { ...current, tasks: [...current.tasks, { id, text: item.title, category: item.category, done: false }] };
      if (item.kind === 'Note') return { ...current, notes: [{ id, title: item.title, body: item.body, projectId: item.projectId, updatedAt: new Date().toISOString() }, ...current.notes] };
      if (item.kind === 'Event') return { ...current, events: [...current.events, { id, title: item.title, date: item.date, start: item.start, end: item.end, category: item.category }] };
      if (item.kind === 'Reminder') return { ...current, reminders: [...current.reminders, { id, title: item.title, date: item.date, time: item.start }] };
      const accent = item.category === 'Study' ? 'blue' : item.category === 'Personal' ? 'yellow' : 'peach';
      const images = item.category === 'Study' ? ['campus', 'notes', 'studio'] : item.category === 'Personal' ? ['notes', 'studio', 'campus'] : ['studio', 'notes', 'campus'];
      return { ...current, projects: [...current.projects, { id, title: item.title, category: item.category, accent, images, members: ['alex'] }] };
    });
    setModal(null); setToast(`${item.kind} added to your space.`);
  };
  const saveNote = (note) => { setData((current) => ({ ...current, notes: current.notes.map((item) => item.id === note.id ? note : item) })); setModal(null); setToast('Note saved.'); };
  const deleteNote = (id) => { setData((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) })); setModal(null); setToast('Note deleted.'); };
  const toggleStamp = () => { setData((current) => ({ ...current, stamped: !current.stamped })); setToast(data.stamped ? 'Stamp removed.' : 'Stamped as reviewed!'); };
  const toggleModule = (key) => setData((current) => ({ ...current, modules: { ...current.modules, [key]: !current.modules[key] } }));
  const reset = () => { setData(createInitialWorkspace()); setModal(null); setPage('home'); setToast('Sample workspace reset.'); };
  return <div className="app-shell"><Sidebar page={page} navigate={navigate} openModal={openModal} data={data} /><main className="main-area"><Topbar page={page} openModal={openModal} /><div className="main-content"><PageHeading page={page} openModal={openModal} />{page === 'home' && <Home data={data} toggleTask={toggleTask} navigate={navigate} openModal={openModal} onSend={sendMessage} toggleStamp={toggleStamp} />}{page === 'tasks' && <TasksPage data={data} toggleTask={toggleTask} removeTask={removeTask} openModal={openModal} />}{page === 'projects' && <ProjectsPage data={data} openModal={openModal} navigate={navigate} />}{page === 'calendar' && <CalendarPage data={data} openModal={openModal} removeEvent={removeEvent} removeReminder={removeReminder} />}{page === 'messages' && <div className="messages-page"><ChatWidget messages={data.messages} onSend={sendMessage} full /><div className="messages-side"><span>✳</span><h2>A little more<br />connected.</h2><p>All your good ideas, in one place. This sample chat is saved locally on this device.</p></div></div>}{page === 'notes' && <NotesPage data={data} openModal={openModal} />}</div><footer className="app-footer"><span>MADE FOR THE WAY YOU THINK <span>✳</span></span><span>YOUR SPACE, YOUR PACE.</span></footer></main><BottomNav page={page} navigate={navigate} openModal={openModal} />
    {modal?.type === 'create' && <CreateModal key={`${modal.kind}-${modal.projectId || ''}-${modal.date || ''}`} initialKind={modal.kind} initialDate={modal.date} initialProject={modal.projectId} projects={data.projects} onCreate={createItem} onClose={closeModal} />}
    {modal?.type === 'project' && <ProjectModal project={selectedProject} notes={data.notes} openModal={openModal} onClose={closeModal} />}
    {modal?.type === 'note' && selectedNote && <NoteModal key={selectedNote.id} note={selectedNote} projects={data.projects} onSave={saveNote} onDelete={deleteNote} onClose={closeModal} />}
    {modal?.type === 'customize' && <CustomizeModal modules={data.modules} toggleModule={toggleModule} onClose={closeModal} />}
    {modal?.type === 'search' && <SearchModal data={data} navigate={navigate} openModal={openModal} onClose={closeModal} />}
    {(modal?.type === 'profile' || modal?.type === 'notifications') && <InfoModal type={modal.type} onClose={closeModal} reset={reset} />}
    {toast && <div className="toast" role="status"><span><Check size={14} /></span>{toast}</div>}
  </div>;
}
