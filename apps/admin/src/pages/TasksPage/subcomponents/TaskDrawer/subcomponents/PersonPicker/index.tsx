import { useId, useState, type ReactNode } from 'react';
import type { UserDto } from '../../../../../../api/users.api';
import { Avatar } from '../../../../../../components/Avatar';
import { AlertIcon, CheckIcon } from '../../../../../../components/Icons';
import styles from './PersonPicker.module.css';

interface PersonPickerProps {
  label: string;
  people: UserDto[];
  selected: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  error?: string;
}

/** Checklist of people with a search box; used to pick the Employees on a task. */
export function PersonPicker({
  label,
  people,
  selected,
  onChange,
  loading = false,
  error,
}: PersonPickerProps): ReactNode {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? people.filter(
        (user) =>
          user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle),
      )
    : people;

  function toggle(id: string): void {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>
        {label} <span className={styles.count}>{selected.length} selected</span>
      </legend>
      {people.length > 6 && (
        <>
          <label htmlFor={searchId} className="visually-hidden">
            Search {label}
          </label>
          <input
            id={searchId}
            type="search"
            className={styles.search}
            placeholder="Search by name or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </>
      )}
      <div className={`${styles.list} ${error ? styles.invalid : ''}`}>
        {loading && <p className={styles.note}>Loading people…</p>}
        {!loading && people.length === 0 && (
          <p className={styles.note}>No Employees yet. Add some on the Users page first.</p>
        )}
        {!loading && people.length > 0 && visible.length === 0 && (
          <p className={styles.note}>No one matches “{query.trim()}”.</p>
        )}
        {visible.map((user) => {
          const checked = selected.includes(user.id);
          return (
            <label key={user.id} className={`${styles.row} ${checked ? styles.checked : ''}`}>
              <input
                type="checkbox"
                className={styles.input}
                checked={checked}
                onChange={() => toggle(user.id)}
              />
              <Avatar name={user.name} size={32} />
              <span className={styles.who}>
                <span className={styles.name}>{user.name}</span>
                <span className={styles.email}>{user.email}</span>
              </span>
              <span className={styles.tick} aria-hidden="true">
                {checked && <CheckIcon size={16} />}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p className={styles.error}>
          <AlertIcon size={14} />
          {error}
        </p>
      )}
    </fieldset>
  );
}
