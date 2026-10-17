const paths = {
  search: 'M11 4a7 7 0 1 0 4.2 12.6l4.1 4.1 1.4-1.4-4.1-4.1A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z',
  menu: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
  close: 'm6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z',
  arrow: 'M7 17 17 7M9 7h8v8',
  right: 'M5 12h13m-5-5 5 5-5 5',
  swap: 'M7 7h12l-3-3m3 3-3 3M17 17H5l3 3m-3-3 3-3',
  download: 'M12 4v11m-5-5 5 5 5-5M5 20h14',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-1 7h2v7h-2zm0-4h2v2h-2z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  doc: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6m-6 4h6',
} as const;

export type IconName = keyof typeof paths;
const filled: IconName[] = ['search', 'menu', 'close', 'info'];

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const isFilled = filled.includes(name);
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill={isFilled ? 'currentColor' : 'none'} stroke={isFilled ? 'none' : 'currentColor'}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
