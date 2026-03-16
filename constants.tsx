
import React from 'react';
import { LayoutDashboard, Calendar, ClipboardCheck, Grid3X3, Timer, Sparkles, BookOpen, Hourglass, Users, Trophy, Mic2, Scale } from 'lucide-react';

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'guidance', label: 'Stoic Guidance', icon: <Mic2 size={20} /> },
  { id: 'control-matrix', label: 'Control Matrix', icon: <Scale size={20} /> },
  { id: 'social', label: 'The Agora', icon: <Users size={20} /> },
  { id: 'leaderboard', label: 'Hall of Sages', icon: <Trophy size={20} /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} /> },
  { id: 'discipline', label: 'Discipline', icon: <ClipboardCheck size={20} /> },
  { id: 'timetable', label: 'Timetable', icon: <Grid3X3 size={20} /> },
  { id: 'stopwatch', label: 'Stopwatch', icon: <Timer size={20} /> },
  { id: 'reflections', label: 'Reflections', icon: <BookOpen size={20} /> },
  { id: 'life-clock', label: 'Life Clock', icon: <Hourglass size={20} /> },
  { id: 'finance', label: 'Dream Tracker', icon: <Sparkles size={20} /> },
];
