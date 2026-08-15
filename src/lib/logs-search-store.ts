'use client';

import { useSyncExternalStore } from 'react';

// /logs sayfasının arama kutusu üst navbar'da yaşıyor (NavBar.tsx), ama hem
// navbar'daki büyüteç hem de /logs header'ındaki buton satırındaki ikon aynı
// arama kutusunu açıp aynı sorguyu paylaşmalı. Filtreleme mantığı posts
// state'ine sahip olan logs/page.tsx'te kalıyor. Context/URL param olmadan
// basit, tek kaynaklı bir paylaşılan store.
interface LogsSearchState {
  query: string;
  open: boolean;
}

let state: LogsSearchState = { query: '', open: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

export function setLogsSearchQuery(q: string) {
  state = { ...state, query: q };
  emit();
}

export function setLogsSearchOpen(open: boolean) {
  state = { ...state, open };
  emit();
}

// Herhangi bir tetikleyici (navbar ikonu, header'daki arama butonu) arama
// kutusunu açmak için bunu çağırır.
export function openLogsSearch() {
  setLogsSearchOpen(true);
}

// /logs'tan ayrılırken çağrılır — kutuyu ve sorguyu temizler.
export function resetLogsSearch() {
  state = { query: '', open: false };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLogsSearchQuery() {
  return useSyncExternalStore(subscribe, () => state.query, () => '');
}

export function useLogsSearchOpen() {
  return useSyncExternalStore(subscribe, () => state.open, () => false);
}
