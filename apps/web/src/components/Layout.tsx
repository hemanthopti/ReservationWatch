import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { HealthStatus } from './HealthStatus';
import { Icon } from './Icon';
import { SearchBox } from './SearchBox';
import { PageLoading } from './ui';

interface NavItem { name: string; path: string; matches: string[] }

const primary: NavItem[] = [
  { name: 'Home', path: '/', matches: [] },
  { name: 'Rules', path: '/rules', matches: ['/rules', '/jurisdictions'] },
  { name: 'Reach', path: '/reach', matches: ['/reach'] },
  { name: 'Effects', path: '/effects', matches: ['/effects'] },
  { name: 'Debates', path: '/debates', matches: ['/debates'] },
  { name: 'History', path: '/history', matches: ['/history'] },
  { name: 'Data & Tools', path: '/data', matches: ['/data'] },
];
const secondary: NavItem[] = [
  { name: 'Communities', path: '/communities', matches: ['/communities'] },
  { name: 'Compare', path: '/compare', matches: ['/compare'] },
];

function isActive(item: NavItem, pathname: string) {
  return item.path === '/' ? pathname === '/' : item.matches.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  const main = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Move focus to the new page and reset scroll on navigation (not on filter changes).
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    setOpen(false);
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  const close = () => setOpen(false);
  const link = (item: NavItem) => (
    <Link key={item.path} to={item.path} onClick={close} className={isActive(item, pathname) ? 'active' : undefined}
      aria-current={isActive(item, pathname) ? 'page' : undefined}>
      {item.name}
    </Link>
  );

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="independent">
        <strong>Independent project</strong><span aria-hidden="true"> · </span>Not a government website
      </div>
      <header className="site-header">
        <div className="header-top wrap">
          <Link className="brand" to="/" onClick={close} aria-label="ReservationWatch home">
            <span className="brand-mark" aria-hidden="true">R<span>W</span></span>
            <span className="brand-text">ReservationWatch<small>Context · Evidence · Perspective</small></span>
          </Link>
          <div className="header-search">
            <SearchBox label="Global search" placeholder="Search communities, topics, sources…" />
          </div>
          <button
            ref={menuButton} type="button" className="menu-button" aria-expanded={open} aria-controls="primary-nav"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? 'close' : 'menu'} /> {open ? 'Close' : 'Menu'}
          </button>
        </div>
        <nav
          id="primary-nav" className={`primary-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation"
          onKeyDown={(event) => { if (event.key === 'Escape') { close(); menuButton.current?.focus(); } }}
        >
          <div className="wrap nav-inner">
            <div className="mobile-search">
              <SearchBox label="Search the demonstration" placeholder="Search the demonstration…" variant="menu" onNavigate={close} />
            </div>
            <div className="nav-primary">{primary.map(link)}</div>
            <div className="nav-secondary">{secondary.map(link)}</div>
          </div>
        </nav>
      </header>
      <div className="demo-banner" role="note" aria-label="Synthetic data notice">
        <div className="wrap">
          <strong>SYNTHETIC DEMONSTRATION</strong>
          <span>All records, numbers and studies are fictional. No legal or eligibility conclusions.</span>
          <Link to="/data">About the data</Link>
        </div>
      </div>
      <main id="main" ref={main} tabIndex={-1} className="wrap main-content">
        <Suspense fallback={<PageLoading />}><Outlet /></Suspense>
      </main>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <Link className="footer-brand" to="/">ReservationWatch</Link>
            <p>An independent, evidence-focused research prototype.</p>
            <p><strong>Independent project · Not a government website.</strong><br />Synthetic demonstration only. Not legal advice or an individual eligibility assessment.</p>
          </div>
          <nav aria-label="Footer">
            <p className="eyebrow">Explore</p>
            {[...primary.slice(1), ...secondary].map((item) => <Link key={item.path} to={item.path}>{item.name}</Link>)}
          </nav>
          <div>
            <p className="eyebrow">Prototype status</p>
            <HealthStatus />
            <p>No account required. Local fixtures only; no official dataset.</p>
            <p className="coming-later">Admin interface · Coming later</p>
          </div>
        </div>
      </footer>
    </>
  );
}
