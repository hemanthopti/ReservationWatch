import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAll } from '../data/explore';
import { Icon } from './Icon';

const MAX_SUGGESTIONS = 6;

/**
 * Global search combobox (WAI-ARIA 1.2 pattern): arrow keys move through
 * suggestions, Enter opens the active one or the full results page, Escape closes.
 */
export function SearchBox({ label, placeholder, variant = 'header', onNavigate, buttonLabel }: {
  label: string; placeholder: string; variant?: 'header' | 'hero' | 'menu'; onNavigate?: () => void; buttonLabel?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const suggestions = query.trim() ? searchAll(query).slice(0, MAX_SUGGESTIONS) : [];
  const total = query.trim() ? searchAll(query).length : 0;
  const expanded = open && query.trim().length > 0;

  function go(path: string) {
    setOpen(false); setActive(-1); setQuery('');
    onNavigate?.();
    navigate(path);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const chosen = expanded ? suggestions[active] : undefined;
    go(chosen ? chosen.path : `/search?q=${encodeURIComponent(query.trim())}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault(); setOpen(true);
      setActive((index) => (suggestions.length ? (index + 1) % suggestions.length : -1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault(); setOpen(true);
      setActive((index) => (suggestions.length ? (index <= 0 ? suggestions.length - 1 : index - 1) : -1));
    } else if (event.key === 'Escape' && expanded) {
      event.stopPropagation(); setOpen(false); setActive(-1);
    }
  }

  return (
    <form className={`searchbox searchbox-${variant}`} role="search" onSubmit={submit}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <Icon name="search" />
      <input
        id={id} type="search" autoComplete="off" value={query} placeholder={placeholder}
        role="combobox" aria-expanded={expanded} aria-controls={listId} aria-autocomplete="list"
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
      />
      <button type="submit" className={variant === 'hero' ? 'button' : 'search-submit'} aria-label={buttonLabel ? undefined : 'Submit search'}>
        {buttonLabel ?? <Icon name="right" />}
      </button>
      <div className="suggestions" hidden={!expanded}>
        <ul id={listId} role="listbox" aria-label="Search suggestions">
          {suggestions.map((item, index) => (
            <li
              key={item.path} id={`${listId}-${index}`} role="option" aria-selected={index === active}
              onMouseDown={(event) => { event.preventDefault(); go(item.path); }}
              onMouseEnter={() => setActive(index)}
            >
              <span className="suggestion-kind">{item.kind}</span>
              <span className="suggestion-title">{item.title}</span>
            </li>
          ))}
        </ul>
        {suggestions.length === 0
          ? <p className="suggestion-empty">No demonstration records match “{query.trim()}”.</p>
          : <p className="suggestion-footer">{total} result{total === 1 ? '' : 's'} · Enter for all results</p>}
      </div>
    </form>
  );
}
