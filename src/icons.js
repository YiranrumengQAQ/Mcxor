const svg = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const Icons = {
  upload: () => svg('<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3"/>'),
  help: () => svg('<circle cx="12" cy="12" r="8.5"/><path d="M9.8 9.2a2.3 2.3 0 1 1 3.7 1.8c-1 .7-1.5 1.1-1.5 2.2M12 16.5h.01"/>'),
  moon: () => svg('<path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>'),
  sun: () => svg('<circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3-7-1.4 1.4M6.4 17.6 5 19m0-14 1.4 1.4m12.2 12.2L17.2 17.2"/>'),
  file: () => svg('<path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4M9 12h6m-6 3h6"/>'),
  key: () => svg('<circle cx="8.5" cy="15.5" r="3.5"/><path d="m11 13 8-8m-2 2 2 2m-5 1 2 2"/>'),
  shield: () => svg('<path d="m12 3 7 3v5c0 4.2-2.8 7.7-7 9-4.2-1.3-7-4.8-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>'),
  bolt: () => svg('<path d="m13 2-8 11h6l-1 9 8-12h-6l1-8Z"/>'),
  layers: () => svg('<path d="m12 3 8 4-8 4-8-4 8-4Zm-8 8 8 4 8-4M4 15l8 4 8-4"/>'),
  check: () => svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 9"/>'),
  error: () => svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5m0 3h.01"/>'),
  download: () => svg('<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/>'),
  arrow: () => svg('<path d="M4 12h15m-6-6 6 6-6 6"/>'),
  close: () => svg('<path d="m6 6 12 12M18 6 6 18"/>')
};
