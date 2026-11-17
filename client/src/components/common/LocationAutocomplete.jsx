import { LoaderCircle, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

function LocationAutocomplete({ label = 'Location', value, onChange, onSelect, selected }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 3 || selected?.name === query) {
      setSuggestions([]);
      setError('');
      return undefined;
    }

    const controller = new AbortController();
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const variations = [query];
        if (/shere\s+punjab/i.test(query)) {
          variations.push(query.replace(/shere\s+punjab/i, 'Sher-e-Punjab'));
          variations.push(query.replace(/chowk/i, '').replace(/,\s*,/g, ',').trim());
        }
        const resultsById = new Map();
        for (const variation of [...new Set(variations)]) {
          const params = new URLSearchParams({
            q: variation,
            format: 'jsonv2',
            addressdetails: '1',
            limit: '8',
            countrycodes: 'in'
          });
          const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
            signal: controller.signal,
            headers: { 'Accept-Language': 'en' }
          });
          if (!response.ok) throw new Error('Location search failed');
          const results = await response.json();
          results.forEach((result) => resultsById.set(result.place_id, result));
          if (resultsById.size >= 8) break;
        }
        if (currentRequestId !== requestId.current) return;
        const results = [...resultsById.values()].slice(0, 8);
        setSuggestions(results);
        if (results.length === 0) setError('Location not found. Try a nearby area, landmark or city.');
      } catch (requestError) {
        if (requestError.name !== 'AbortError' && currentRequestId === requestId.current) setError('Location search is temporarily unavailable.');
      } finally {
        if (!controller.signal.aborted && currentRequestId === requestId.current) setLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, selected]);

  function chooseSuggestion(suggestion) {
    onSelect({
      name: suggestion.display_name,
      lat: Number(suggestion.lat),
      lng: Number(suggestion.lon)
    });
    setSuggestions([]);
    setError('');
  }

  return (
    <div className="relative">
      <label className="field-label">{label}
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true" />
          <input
            className="field-input pl-9"
            value={value}
            placeholder="Search an area, landmark or city"
            onChange={(event) => onChange(event.target.value)}
            autoComplete="off"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-autocomplete="list"
          />
          {loading && <LoaderCircle size={17} className="absolute right-3 top-3 animate-spin text-brand-600" aria-label="Searching locations" />}
        </div>
      </label>
      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg" role="listbox">
          {suggestions.map((suggestion) => (
            <li key={suggestion.place_id}>
              <button type="button" className="flex w-full items-start gap-3 px-3 py-3 text-left text-sm hover:bg-brand-50" onClick={() => chooseSuggestion(suggestion)}>
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span>{suggestion.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-amber-700" role="status">{error}</p>}
      {selected && <p className="mt-1 text-xs text-emerald-700">Selected location confirmed.</p>}
    </div>
  );
}

export default LocationAutocomplete;
