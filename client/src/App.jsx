import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from './router.jsx';
import { ArrowLeft as FiArrowLeft, ArrowUpRight as FiArrowUpRight, ArrowRight as FiArrowRight, MapPin as FiMapPin, Calendar as FiCalendar, Users as FiUsers, Search as FiSearch, Plus as FiPlus, MessageCircle as FiMessageCircle, Compass as FiCompass, Menu as FiMenu, X as FiX, LogOut as FiLogOut, Upload as FiUpload, Send as FiSend, Sparkles as FiSparkles } from 'lucide-react';
import { io } from './vendor/socket.io.esm.min.js';
import { api, idOf, dateLabel } from './api';
import destinations from '../../shared/destinations.json';
import coast from './assets/photo-1507525428034-b723cf961d3e.png';
import mountains from './assets/ski.jpg';
import travel from './assets/background1.jpg';
const WorldMap = lazy(() => import('./components/WorldMap.jsx'));
const Auth = createContext(null);
const useAuth = () => useContext(Auth);
const photos = [coast, mountains, travel];
function safeImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  if (/^\/(?:uploads\/(?:[0-9a-f-]{36}\.(?:png|jpe?g|webp)|[a-f\d]{24}\/[0-9a-f-]{36}\.(?:png|jpe?g|webp))|demo-images\/[a-z0-9_-]+\.(?:png|jpe?g|webp))$/i.test(value)) return value;
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol === 'https:' && url.hostname === 'lh3.googleusercontent.com' && !url.username && !url.password) return url.href;
  } catch { return ''; }
  return '';
}
function safeReturnTo(value, fallback = '/main') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try { return new URL(value, window.location.origin).origin === window.location.origin ? value : fallback; }
  catch { return fallback; }
}
function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function refresh() {
    try {
      const data = await api('/auth/me');
      setUser(data.user || data);
      setError('');
      return data.user || data;
    } catch (e) {
      setUser(null);
      if (e.status !== 401) setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  async function login(values) {
    await api('/auth/login', {
      method: 'POST',
      body: values
    });
    const data = await api('/auth/me');
    setUser(data.user || data);
    setError('');
  }
  async function logout() {
    await api('/auth/logout', {
      method: 'POST',
      body: {}
    });
    setUser(null);
  }
  return <Auth.Provider value={{
    user,
    loading,
    error,
    refresh,
    login,
    logout
  }}>{children}</Auth.Provider>;
}
function ErrorNote({
  error
}) {
  return error ? <p className="error" role="alert">{error}</p> : null;
}
function Loading() {
  return <div className="loading" role="status"><span className="spinner" /> Gathering the details...</div>;
}
function Empty({
  title = 'Your next chapter is waiting.',
  text = 'Find a trip that feels like you, or bring your own idea to life.'
}) {
  return <div className="empty"><FiCompass size={36} /><h2>{title}</h2><p>{text}</p><Link className="button" to="/main">Explore trips <FiArrowRight /></Link></div>;
}
function Protected({
  children
}) {
  const {
    user,
    loading,
    error,
    refresh
  } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (error) return <main className="page"><ErrorNote error={error} /><button onClick={refresh}>Try again</button></main>;
  return user ? children : <Navigate to="/login" state={{
    from: location.pathname
  }} replace />;
}
function Header() {
  const {
    user,
    logout
  } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  return <><header className="header"><Link className="brand" to="/" aria-label="TripBuddy home"><FiCompass />tripbuddy</Link><button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? <FiX /> : <FiMenu />}</button>{!user && <Link className="login-link mobile-login" to="/login">Sign in <FiArrowUpRight /></Link>}<nav id="primary-navigation" className={open ? 'nav open' : 'nav'} aria-label="Main navigation"><NavLink to="/main">Explore trips</NavLink>{user && <><NavLink to="/mytrips">My trips</NavLink><NavLink to="/chat">Messages</NavLink></>}<Link className="nav-create" to="/createtrip"><FiPlus /> {user ? 'Plan a trip' : 'Sign in to plan'}</Link>{user ? <><Link className="avatar" title="Your profile" to="/profile">{(user.username || 'You').slice(0, 2).toUpperCase()}</Link><button className="icon-button" aria-label="Sign out" onClick={async () => {
            try {
              await logout();
              navigate('/');
            } catch (e) {
              setError(e.message);
            }
          }}><FiLogOut /></button></> : <Link className="login-link desktop-login" to="/login">Sign in <FiArrowUpRight /></Link>}</nav></header><ErrorNote error={error} /></>;
}
function Footer() {
  return <footer><Link className="brand" to="/">tripbuddy</Link><p>A little further. A little more together.</p><Link to="/main">Find your next adventure <FiArrowUpRight /></Link></footer>;
}
function TripCard({
  trip,
  index = 0
}) {
  const members = trip.tripMates?.length || 0;
  const places = Math.max(0, Number(trip.totalSlots || 0) - members);
  return <article className="trip-card"><Link className="trip-photo" to={`/viewtrip/${trip._id}`}><img src={safeImageUrl(trip.imageUrl) || photos[index % 3]} alt={`${trip.city || trip.country || 'Travel'} destination`} onError={e => {
        e.currentTarget.src = photos[index % 3];
      }} /><span className="photo-tag">{trip.description?.startsWith('[Demo itinerary]') ? 'Demo itinerary' : trip.categories?.[0] || 'A new adventure'}</span><span className="photo-arrow"><FiArrowUpRight /></span><span className="photo-title">{trip.title}</span></Link><div className="trip-card-details"><div className="trip-meta"><span><FiMapPin />{[trip.city, trip.country].filter(Boolean).join(', ')}</span><span className={places ? 'spots-open' : 'spots-full'}>{places ? `${places} spots left` : 'Full'}</span></div><p className="date"><FiCalendar />{dateLabel(trip.startDate)} to {dateLabel(trip.endDate)}</p><div className="trip-card-bottom"><span>{trip.tripMates?.length || 0} {(trip.tripMates?.length || 0) === 1 ? 'traveler' : 'travelers'} joined</span><Link to={`/viewtrip/${trip._id}`} aria-label={`See details for ${trip.title}`}>See the plan <FiArrowUpRight /></Link></div></div></article>;
}
function useTrips({mine = false, query = '', category = 'All trips', hostId = ''} = {}) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState({key: '', offset: 0});
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify([mine, query, category, hostId]);
  const offset = page.key === key ? page.offset : 0;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    if (!offset) setTrips([]);
    const params = new URLSearchParams({limit: '100', offset: String(offset)});
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'All trips') params.set('category', category);
    const endpoint = hostId ? '/trip/getTripById/' + hostId : mine ? '/trip/myTrips' : '/trip/getTrips';
    api(endpoint + '?' + params).then(data => {
      if (!active) return;
      const rows = Array.isArray(data) ? data : data.trips || [];
      setTrips(previous => offset ? [...previous, ...rows.filter(row => !previous.some(old => old._id === row._id))] : rows);
      setHasMore(rows.length === 100);
    }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key, offset, retry]);
  function loadMore() {
    if (error) setRetry(value => value + 1);
    else setPage({key, offset: offset + 100});
  }
  return {trips, loading: loading && offset === 0, loadingMore: loading && offset > 0, error, hasMore, loadMore};
}
function MoreTrips({hasMore, loadingMore, error, loadMore}) {
  return hasMore || error ? <div className="load-more"><button className="button secondary" disabled={loadingMore} onClick={loadMore}>{loadingMore ? 'Finding more adventures...' : error ? 'Try again' : 'Load more trips'}</button></div> : null;
}
function Landing() {
  const { user } = useAuth();
  const {
    trips,
    loading,
    error
  } = useTrips();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  return <><main><section className="hero"><div className="hero-copy"><h1>Good places.<br />Even better<br /> <em>company.</em></h1><p>Travel solo. Find your people along the way. Meet independent travelers with the same destination on their mind.</p><form className="hero-search" onSubmit={e => {
            e.preventDefault();
            navigate(`/main?q=${encodeURIComponent(query)}`);
          }}><FiMapPin /><label className="sr-only" htmlFor="destination">Where would you like to go?</label><input id="destination" value={query} onChange={e => setQuery(e.target.value)} placeholder="Where's calling you?" /><button aria-label="Explore destinations"><FiArrowRight /></button></form><div className="hero-note"><span className="hero-note-icon"><FiUsers /></span><span>Solo by choice. Together when it counts.</span></div></div><div className="hero-visual"><img className="hero-main-photo" src={travel} alt="Travelers taking in a rugged coastal landscape" /><div className="hero-photo-inset"><img src={coast} alt="A quiet shoreline at the edge of a journey" /><span><FiMapPin/> Follow the feeling</span></div><div className="hero-location-tag"><FiMapPin/><span>Along Portugal's coast</span><i/></div><div className="hero-photo-strip"><img src={mountains} alt="Mountain landscape"/><div><small>YOUR NEXT CHAPTER</small><strong>Somewhere new,<br/>with someone new.</strong><Link to="/main">Find a trip <FiArrowUpRight/></Link></div></div><div className="floating-note"><FiCompass /><span>Go your own way.<br /><b>Meet along the way.</b></span></div></div></section><section className="section"><div className="section-heading"><div><h2>Somewhere new,<br /> <em>with someone new.</em></h2><p>Small groups. Shared curiosity. Plans to look forward to.</p></div><Link className="text-link" to="/main">Explore all trips <FiArrowUpRight /></Link></div><ErrorNote error={error} />{loading ? <Loading /> : trips.length ? <div className="trip-grid landing-trip-grid">{trips.slice(0, 3).map((trip, index) => <TripCard key={trip._id} trip={trip} index={index} />)}</div> : <div className="first-trip"><p>The map is wide open. Be the first to bring a trip to life.</p><Link className="text-link" to="/createtrip">{user ? 'Plan the first adventure' : 'Sign in to plan the first adventure'} <FiArrowUpRight /></Link></div>}</section><section className="manifesto"><span className="line-art"><FiCompass /></span><h2>More than a destination.<br /><em>A connection.</em></h2><p>A sunrise hike, a slow afternoon, a wrong turn that becomes the best part. Find people who travel the way you do.</p><Link className="button light" to="/register">{user ? 'Find your people' : 'Sign in to find your people'} <FiArrowUpRight /></Link></section></main><Footer /></>;
}
function Explore({
  mine = false
}) {
  const location = useLocation();
  const { user } = useAuth();
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') || '');
  const [category, setCategory] = useState('All trips');
  const categories = ['All trips', 'Adventure', 'Beach', 'Culture', 'Nature', 'City'];
  const result = useTrips({mine, query, category});
  const {trips: filtered, loading, error} = result;
  const hosted = filtered.filter(trip => idOf(trip.hostId || trip.host) === user?._id);
  const joined = filtered.filter(trip => idOf(trip.hostId || trip.host) !== user?._id);
  return <main className="page"><div className="page-heading"><div><h1>{mine ? 'Your travel journal.' : 'Where to next?'}</h1><p>{mine ? 'See the trips you host and the crews you have joined.' : 'Find a place that excites you. Meet people who feel the same.'}</p></div><Link className="button" to="/createtrip"><FiPlus /> {user ? 'Plan a trip' : 'Sign in to plan'}</Link></div><div className="discovery-tools"><label className="search-input"><FiSearch /><span className="sr-only">Search trips</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a destination or a trip" /></label><div className="filter-tabs" aria-label="Trip categories">{categories.map(c => <button key={c} aria-pressed={category === c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div></div><ErrorNote error={error} />{loading ? <Loading /> : <><p className="result-count">{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</p>{filtered.length ? <>{mine ? <div className="trip-journal">{[['Trips you host', hosted], ['Trips you joined', joined]].map(([title, group]) => <section className="trip-journal-section" key={title}><h2>{title} <span>{group.length}</span></h2>{group.length ? <div className="trip-grid">{group.map((trip, index) => <TripCard key={trip._id} trip={trip} index={index} />)}</div> : <p>{title === 'Trips you host' ? 'No trips hosted yet. Start with a place you love.' : 'No trips joined yet. Find a crew headed somewhere new.'}</p>}</section>)}</div> : <div className="trip-grid">{filtered.map((trip, index) => <TripCard key={trip._id} trip={trip} index={index} />)}</div>}</> : <Empty title={query || category !== 'All trips' ? 'A little off the beaten path.' : mine ? 'Your story starts here.' : 'The next adventure could be yours.'} text={query || category !== 'All trips' ? 'Try another destination or choose a different category.' : undefined} />}</>}<MoreTrips {...result}/></main>;
}
let googleScriptPromise;
function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    const timeout = window.setTimeout(() => fail(), 15000);
    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      googleScriptPromise = undefined;
      reject(new Error('Google sign-in could not load. Check your connection and try again.'));
    }
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timeout);
      if (window.google?.accounts?.oauth2) resolve();
      else fail();
    };
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}
function GoogleSignIn() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const configured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  useEffect(() => {
    if (!configured) return;
    let active = true;
    setError('');
    loadGoogleIdentity().then(() => { if (active) setReady(true); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [retry, configured]);
  function signIn() {
    setError('');
    setBusy(true);
    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        ux_mode: 'popup',
        redirect_uri: 'postmessage',
        callback: async response => {
          if (!response.code || response.error) {
            setError('Google sign-in was not completed. Please try again.');
            setBusy(false);
            return;
          }
          try {
            await api('/auth/google/callback', {method: 'POST', headers: {'X-Requested-With': 'XmlHttpRequest'}, body: {code: response.code}});
            const signedInUser = await refresh();
            if (!signedInUser) throw new Error('Your session could not be confirmed. Please try signing in again.');
            navigate(safeReturnTo(location.state?.from), {replace: true});
          } catch (e) { setError(e.message); }
          finally { setBusy(false); }
        },
        error_callback: () => {
          setBusy(false);
          setError('The Google sign-in window was closed or blocked. Allow popups and try again.');
        }
      });
      client.requestCode();
    } catch {
      setBusy(false);
      setError('Google sign-in is unavailable. Please try again.');
    }
  }
  return <div className="google-sign-in"><button type="button" className="google-button" disabled={!configured || !ready || busy} onClick={signIn}><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.27 5.47-4.76 7.16l7.73 6C44.38 37.98 46.98 31.94 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.82l-7.74-6C30.02 37.82 27.25 39 24 39c-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.2C6.51 42.62 14.62 48 24 48Z"/></svg>{busy ? 'Connecting to Google…' : 'Continue with Google'}</button>{configured && !ready && !error && <p className="hint" role="status">Loading secure Google sign-in?</p>}{!configured ? <p className="hint">Google sign-in needs a Google OAuth client ID in the app settings.</p> : <p className="hint">New here? Your TripBuddy profile is created with Google.</p>}<ErrorNote error={error}/>{error && configured && !ready && <button type="button" className="text-link retry-google" onClick={() => setRetry(value => value + 1)}>Retry Google sign-in</button>}</div>;
}
function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (user) return <Navigate to="/main" replace />;
  return <main className="auth-layout"><div className="auth-photo"><img src={mountains} alt="A trail winding through a dramatic mountain landscape" /><div className="auth-photo-story"><span className="auth-place"><FiMapPin/> The good kind of getting lost</span><h2>Take the trip.<br /><em>Keep your own pace.</em></h2><p>Find a travel companion when your paths happen to meet.</p><div className="auth-photo-thumbs"><img src={coast} alt="Open water along the coast"/><img src={travel} alt="A group of travelers outdoors"/><span><FiArrowUpRight/></span></div></div></div><div className="auth-form"><h1>Good to have you here.</h1><p>Start with a destination. Let the right people find their way into the plan.</p><GoogleSignIn/><div className="auth-benefits"><div><span><FiMapPin/></span><p><b>Find your kind of trip</b><small>Browse plans built around places and pace.</small></p></div><div><span><FiUsers/></span><p><b>Meet along the way</b><small>Connect with fellow independent travelers.</small></p></div><div><span><FiMessageCircle/></span><p><b>Make a plan together</b><small>Chat before the first mile.</small></p></div></div><button className="auth-back" onClick={() => navigate(safeReturnTo(location.state?.from, '/'))}>Back to exploring</button></div></main>;
}
function Field({
  label,
  name,
  ...props
}) {
  return <label className="field"><span>{label}</span><input name={name} {...props} /></label>;
}
function Upload({
  endpoint,
  value,
  onChange
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="upload-field"><label className="upload"><FiUpload /><span>{busy ? 'Uploading photo...' : value ? 'Choose a different photo' : 'Add a photo'}<small>JPEG, PNG or WebP ... up to 5 MB</small></span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          setError('Choose an image smaller than 5 MB.');
          return;
        }
        setBusy(true);
        setError('');
        try {
          const body = new FormData();
          body.append('image', file);
          const data = await api(endpoint, {
            method: 'POST',
            body
          });
          onChange(data.url);
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }} /></label>{value && <img className="upload-preview" src={value} alt="Your selected photo" />}<ErrorNote error={error} /></div>;
}
function TripForm({
  initial,
  onSaved
}) {
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '');
  const [country, setCountry] = useState(initial?.country || '');
  const [city, setCity] = useState(initial?.city || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const unchangedLegacyDestination = initial && values.country === initial.country && values.city === initial.city;
    if (!unchangedLegacyDestination) {
      const matchedCountry = Object.keys(destinations).find(name => name.toLocaleLowerCase() === values.country.trim().toLocaleLowerCase());
      if (!matchedCountry) {
        setError('Choose a country from the suggestions so we can verify the destination.');
        setBusy(false);
        return;
      }
      const matchedCity = destinations[matchedCountry].find(name => name.toLocaleLowerCase() === values.city.trim().toLocaleLowerCase());
      if (!matchedCity) {
        setError(`Choose a city listed for ${matchedCountry}.`);
        setBusy(false);
        return;
      }
      values.country = matchedCountry;
      values.city = matchedCity;
    }
    if (values.endDate <= values.startDate) {
      setError('Your return date must be after your start date. Choose a later return date.');
      setBusy(false);
      return;
    }
    const body = {
      ...values,
      totalSlots: Number(values.totalSlots),
      categories: values.categories.split(',').map(s => s.trim()).filter(Boolean),
      tags: values.tags.split(',').map(s => s.trim()).filter(Boolean),
      imageUrl
    };
    try {
      const data = await api(initial ? `/trip/editTrip/${initial._id}` : '/trip/createTrip', {
        method: initial ? 'PUT' : 'POST',
        body
      });
      if (onSaved) onSaved();else navigate(`/viewtrip/${data.trip?._id || data._id || data.tripId}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const selectedCountry = Object.keys(destinations).find(name => name.toLocaleLowerCase() === country.trim().toLocaleLowerCase());
  const cityOptions = selectedCountry ? destinations[selectedCountry] : [];
  return <form className="editor-form" onSubmit={submit}><h2 className="form-section-title">Destination and dates</h2><Field label="Give your trip a name" name="title" required maxLength={120} placeholder="A slow week on the Italian coast" defaultValue={initial?.title} /><div className="form-row"><div className="field"><label htmlFor="trip-country-input">Country</label><input id="trip-country-input" name="country" required value={country} onChange={event => { setCountry(event.target.value); if (event.target.value !== country) setCity(''); }} list="trip-countries" autoComplete="country-name" placeholder="Start typing a country" aria-describedby="country-hint" /><small className="field-hint" id="country-hint">Choose a suggested country to verify your trip location.</small><datalist id="trip-countries">{Object.keys(destinations).map(name => <option key={name} value={name} />)}</datalist></div><div className="field"><label htmlFor="trip-city-input">City or region</label><input id="trip-city-input" name="city" required value={city} onChange={event => setCity(event.target.value)} list="trip-cities" autoComplete="address-level2" placeholder={selectedCountry ? 'Start typing a city' : 'Choose a country first'} aria-describedby="city-hint" /><small className="field-hint" id="city-hint">{selectedCountry ? `Suggestions for ${selectedCountry}.` : 'City suggestions appear after choosing a country.'}</small><datalist id="trip-cities">{cityOptions.map(name => <option key={name} value={name} />)}</datalist></div></div><div className="form-row"><Field name="startDate" label="Start date" type="date" required min={new Date().toISOString().slice(0, 10)} defaultValue={initial?.startDate?.slice(0, 10)} /><Field name="endDate" label="End date" type="date" required defaultValue={initial?.endDate?.slice(0, 10)} /></div><h2 className="form-section-title">Group and travel style</h2><div className="form-row"><Field name="totalSlots" label="Group size, including you" type="number" required min={1} max={100} defaultValue={initial?.totalSlots || 4} /><Field name="categories" label="Travel style (optional, comma separated)" placeholder="Adventure, Nature" defaultValue={initial?.categories?.join(', ')} /></div><Field name="tags" label="Interests (optional, comma separated)" placeholder="Hiking, photography, local food" defaultValue={initial?.tags?.join(', ')} /><h2 className="form-section-title">Your story and a photo (optional)</h2><label className="field"><span>Tell your future buddies about the trip</span><textarea name="description" rows={6} defaultValue={initial?.description} placeholder="The places you’ll go, the pace you love, and what people should know..." /></label><Upload endpoint="/trip/upload" value={imageUrl} onChange={setImageUrl} /><ErrorNote error={error} /><button className="button" disabled={busy}>{busy ? 'Saving your adventure...' : initial ? 'Save changes' : 'Publish your trip'}<FiArrowUpRight /></button></form>;
}
function CreateTrip() {
  return <main className="page narrow"><div className="page-heading"><div><h1>Make a little adventure.</h1><p>You bring the idea. Your people will find you.</p></div></div><TripForm /></main>;
}
function TripDetail() {
  const {
    tripId
  } = useParams();
  const {
    user
  } = useAuth();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const joinedNote = useRef(null);
  useEffect(() => { if (joined) joinedNote.current?.focus(); }, [joined]);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const load = async () => {
    const data = await api(`/trip/getTripByTripId/${tripId}`);
    setTrip(data.trip || data);
  };
  useEffect(() => {
    load().catch(e => setError(e.message));
  }, [tripId]);
  if (!trip) return <main className="page">{error ? <><ErrorNote error={error} /><button className="button secondary" onClick={() => { setError(''); load().catch(e => setError(e.message)); }}>Try loading this trip again</button></> : <Loading />}</main>;
  const host = idOf(trip.hostId || trip.host) === user?._id;
  const member = trip.tripMates?.some(m => idOf(m) === user?._id);
  const full = (trip.tripMates?.length || 0) >= trip.totalSlots;
  async function action(kind) {
    if (!user) {
      navigate('/login', {
        state: {
          from: `/viewtrip/${tripId}`
        }
      });
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (kind === 'delete') {
        await api(`/trip/${tripId}`, {
          method: 'DELETE'
        });
        navigate('/mytrips');
      } else {
        await api(`/trip/${kind}Trip/${tripId}`, {
          method: 'POST',
          body: {}
        });
        await load();
        if (kind === 'join') setJoined(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <main className="page"><Link className="text-link back-link" to="/main"><FiArrowLeft /> Back to explore</Link><div className="detail-heading"><div><p className="location"><FiMapPin />{trip.city}, {trip.country}</p><h1>{trip.title}</h1>{trip.description?.startsWith("[Demo itinerary]") && <span className="demo-label">Demo itinerary</span>}</div><div className="tags">{trip.categories?.map(c => <span key={c}>{c}</span>)}</div></div><img className="detail-photo" src={safeImageUrl(trip.imageUrl) || coast} alt={`${trip.city}, ${trip.country}`} /><div className="detail-body"><div><h2>A little about the adventure</h2><p className="description">{trip.description?.replace('[Demo itinerary] ', '')}</p><div className="tags">{trip.tags?.map(t => <span key={t}>#{t}</span>)}</div><h2>Your travel crew</h2><p>{trip.tripMates?.length || 0} of {trip.totalSlots} travelers have joined.</p><div className="participants">{trip.tripMates?.map(m => <Participant key={idOf(m)} person={m} />)}</div>{trip.host && <p className="host-link">Hosted by <Link to={`/profilepage/${idOf(trip.hostId || trip.host)}`}>{trip.host.username || trip.host || 'your trip organizer'}</Link></p>}</div><aside className="booking"><h3>The plan at a glance</h3><p><FiCalendar /><span>{dateLabel(trip.startDate)}<br />to {dateLabel(trip.endDate)}</span></p><p><FiUsers />{trip.tripMates?.length || 0} of {trip.totalSlots} travelers / {Math.max(0, trip.totalSlots - (trip.tripMates?.length || 0))} spots left</p><ErrorNote error={error} />{joined && <p ref={joinedNote} className="success-note" role="status" tabIndex={-1}>You joined the trip. <Link to={`/chat?tripId=${trip._id}`}>Open the group chat</Link></p>}{host ? <><Link className="button full" to={`/chat?tripId=${trip._id}`}>Open group chat <FiMessageCircle /></Link><button className="button secondary full" onClick={() => setEditing(!editing)}>{editing ? 'Close editor' : 'Edit trip'}</button><button className="danger" disabled={busy} onClick={() => {
            if (window.confirm('Delete this trip and its group chat? This cannot be undone.')) action('delete');
          }}>Delete trip</button></> : member ? <><Link className="button full" to={`/chat?tripId=${trip._id}`}>Meet the group <FiMessageCircle /></Link><button className="button secondary full" disabled={busy} onClick={() => action('leave')}>{busy ? 'Updating...' : 'Leave trip'}</button></> : <button className="button full" disabled={busy || full} onClick={() => action('join')}>{busy ? 'Joining...' : full ? 'This trip is full' : 'Join the adventure'}<FiArrowUpRight /></button>}<small>Make a plan with your group before booking travel.</small></aside></div>{editing && <section className="edit-section"><h2>Refine your plans</h2><TripForm initial={trip} onSaved={() => {
        setEditing(false);
        load().catch(e => setError(e.message));
      }} /></section>}</main>;
}
function Participant({
  person
}) {
  const [profile, setProfile] = useState(typeof person === 'object' ? person : null);
  useEffect(() => {
    if (typeof person !== 'object') api(`/user/getUserById/${person}`).then(setProfile).catch(() => {});
  }, [person]);
  return <Link className="participant" to={`/profilepage/${idOf(person)}`}><span className="avatar">{safeImageUrl(profile?.imageUrl) ? <img src={safeImageUrl(profile.imageUrl)} alt="" /> : (profile?.username || 'T').slice(0, 2).toUpperCase()}</span>{profile?.username || 'Traveler'}</Link>;
}
function HostedTrips({ userId }) {
  const result = useTrips({hostId: userId});
  const {trips, loading, error} = result;
  return <section className="hosted-trips"><h2>Adventures they bring to life</h2><ErrorNote error={error}/>{loading ? <Loading/> : trips.length ? <div className="trip-grid">{trips.map((trip,index) => <TripCard key={trip._id} trip={trip} index={index}/>)}</div> : <p>No hosted trips yet. The next idea may be just around the corner.</p>}<MoreTrips {...result}/></section>;
}
function Profile({
  edit = false
}) {
  const {
    user,
    refresh
  } = useAuth();
  const {
    userId
  } = useParams();
  const own = !userId || userId === user?._id;
  const id = userId || user?._id;
  const [profile, setProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    api(`/user/getUserById/${id}`).then(data => {
      setProfile(data.user || data);
      setImageUrl((data.user || data).imageUrl || '');
    }).catch(e => setError(e.message));
  }, [id]);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const formData = new FormData(e.currentTarget);
      const result = await api(`/user/${id}/editProfile`, {
        method: 'PUT',
        body: {
          ...Object.fromEntries(formData),
          countriesVisited: String(formData.get("countriesVisited") || "").split(",").map(value => value.trim()).filter(Boolean),
          countriesPlanned: String(formData.get("countriesPlanned") || "").split(",").map(value => value.trim()).filter(Boolean),
          imageUrl
        }
      });
      setProfile(result.user);
      await refresh();
      navigate('/profile');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!profile) return <main className="page">{error ? <><ErrorNote error={error} /><button className="button secondary" onClick={() => { setError(''); api(`/user/getUserById/${id}`).then(data => setProfile(data.user || data)).catch(e => setError(e.message)); }}>Try loading this profile again</button></> : <Loading />}</main>;
  return <main className="page narrow"><div className="profile-intro"><div className="profile-avatar">{safeImageUrl(profile.imageUrl) ? <img src={safeImageUrl(profile.imageUrl)} alt={profile.username} /> : profile.username?.slice(0, 2).toUpperCase()}</div><div><h1>{edit ? 'A little more you.' : profile.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile.username}</h1><p>@{profile.username}</p></div>{own && !edit && <Link className="button secondary" to="/editprofile">Edit profile</Link>}</div>{edit ? <form className="editor-form" onSubmit={save}><div className="form-row"><Field label="First name" name="firstName" defaultValue={profile.firstName} /><Field label="Last name" name="lastName" defaultValue={profile.lastName} /></div><Field name="username" label="Username" readOnly defaultValue={profile.username} /><label className="field"><span>About you</span><textarea name="bio" rows={5} defaultValue={profile.aboutMe || profile.bio} placeholder="What kind of traveler are you?" /></label><Field name="age" label="Age" type="number" min={18} max={120} defaultValue={profile.age || 18} /><Field name="countriesVisited" label="Countries you’ve visited (comma separated)" defaultValue={profile.countriesVisited?.join(", ")} placeholder="Japan, Singapore, Italy" /><Field name="countriesPlanned" label="Countries on your list (comma separated)" defaultValue={profile.countriesPlanned?.join(", ")} placeholder="Peru, Iceland, New Zealand" /><Upload endpoint="/user/upload" value={imageUrl} onChange={setImageUrl} /><ErrorNote error={error} /><button className="button" disabled={busy}>{busy ? 'Saving...' : 'Save profile'}<FiArrowRight /></button></form> : <div className="profile-about"><h2>About {own ? 'you' : profile.firstName || profile.username}</h2><p>{profile.aboutMe || profile.bio || 'Every traveler has a story. This one is still being written.'}</p>{profile.country && <p className="location"><FiMapPin />{profile.country}</p>}<Suspense fallback={<div className="map-loading" role="status">Preparing your map?</div>}><WorldMap visited={profile.countriesVisited || []} planned={profile.countriesPlanned || []}/></Suspense>{own && <Link className="text-link" to="/mytrips">See your trips <FiArrowUpRight /></Link>}</div>}{!edit && <HostedTrips userId={id}/>}</main>;
}
function Chat() {
  const {
    user
  } = useAuth();
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesRef = useRef(null);
  useEffect(() => {
    const list = messagesRef.current;
    if (!list) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({ top: list.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [active, messages.length]);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    api(`/chat/user/${user._id}/chats`).then(data => setChats(data.userChats || [])).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [user._id]);
  useEffect(() => {
    const tripId = new URLSearchParams(location.search).get('tripId');
    if (!tripId || !chats.length) return;
    const matchingChat = chats.find(chat => idOf(chat.tripId || chat.trip) === tripId);
    if (matchingChat) {
      setActive(matchingChat._id);
      navigate('/chat', { replace: true });
    }
  }, [chats, location.search, navigate]);
  useEffect(() => {
    if (!active) return;
    let alive = true;
    setMessages([]);
    setLoading(true);
    setError('');
    api(`/chat/${active}`).then(data => {
      if (alive) setMessages(data.messages || []);
    }).catch(e => setError(e.message)).finally(() => {
      if (alive) setLoading(false);
    });
    const socket = io({
      withCredentials: true
    });
    socket.emit('joinRoom', active);
    socket.on('newMessage', message => {
      if (message.chatId === active) setMessages(previous => previous.some(m => m._id && m._id === message._id) ? previous : [...previous, message]);
    });
    return () => {
      alive = false;
      socket.disconnect();
    };
  }, [active]);
  async function send(e) {
    e.preventDefault();
    if (!content.trim()) return;
    const text = content.trim();
    const draftId = `draft-${Date.now()}`;
    setMessages(previous => [...previous, { _id: draftId, sender: { _id: user._id, username: user.username }, content: text, timestamp: new Date().toISOString(), pending: true }]);
    setSending(true);
    setError('');
    try {
      await api(`/chat/${active}/message`, {
        method: 'POST',
        body: {
          content: text
        }
      });
      setContent('');
      const data = await api(`/chat/${active}`);
      setMessages(data.messages || []);
    } catch (e) {
      setMessages(previous => previous.filter(message => message._id !== draftId));
      setError(e.message);
    } finally {
      setSending(false);
    }
  }
  const currentChat = chats.find(chat => chat._id === active);
  const tripDetails = currentChat?.trip || (typeof currentChat?.tripId === 'object' ? currentChat.tripId : null);
  const currentTrip = currentChat?.tripId?.title || currentChat?.trip?.title || currentChat?.chatName || currentChat?.name || 'Trip group';
  return <main className="page"><div className="page-heading"><div><h1>Good plans start here.</h1><p>Your travel crew, one conversation away.</p></div></div><ErrorNote error={error} />{loading && !active ? <Loading /> : !chats.length ? <Empty title="Your crew is out there." text="Join or host a trip to start a conversation with your travel buddies." /> : <div className="chat-layout"><aside className="chat-list"><div className="chat-list-heading"><span className="chat-heading-icon"><FiMessageCircle/></span><div><h2>Your conversations</h2><p>Make the plan together</p></div></div>{chats.map(chat => <button key={chat._id} className={active === chat._id ? 'active' : ''} aria-pressed={active === chat._id} onClick={() => setActive(chat._id)}><span className="chat-list-avatar"><FiCompass/></span><span>{chat.tripId?.title || chat.trip?.title || chat.chatName || chat.name || 'Trip group'}<small>{active === chat._id ? 'You’re in the room' : 'Open conversation'}</small></span><FiArrowRight /></button>)}</aside><section className="conversation" aria-label="Group conversation">{!active ? <div className="empty"><FiMessageCircle size={34} /><h2>Pull up a seat.</h2><p>Choose a conversation to catch up with your crew.</p></div> : <><header className="conversation-header"><div className="conversation-avatar"><FiCompass/></div><div><h2>{currentTrip}</h2><p>{currentChat?.participants?.length ? `${currentChat.participants.length} ${currentChat.participants.length === 1 ? 'traveler' : 'travelers'} in this chat` : 'Group conversation'}{tripDetails?.city ? ` | ${tripDetails.city}, ${tripDetails.country}` : ''}{tripDetails?.startDate ? ` | ${dateLabel(tripDetails.startDate)}` : ''}</p>{tripDetails && <Link className="conversation-trip-link" to={`/viewtrip/${idOf(currentChat.tripId || currentChat.trip)}`}>Trip details <FiArrowUpRight /></Link>}</div><span className="conversation-sparkle"><FiSparkles/></span></header><div className="messages" ref={messagesRef} aria-live="polite">{loading ? <Loading /> : messages.length ? messages.map((message, index) => { const own = idOf(message.sender) === user._id; return <div className={`message-row ${own ? 'own' : ''}`} key={message._id || index}>{!own && <span className="message-avatar" aria-hidden="true">{(message.sender?.username || 'T').slice(0, 1).toUpperCase()}</span>}<div className={`message ${own ? 'own' : ''} ${message.pending ? 'pending' : ''}`}><div className="message-head"><small>{own ? 'You' : message.sender?.username || 'Travel buddy'}</small><time>{new Date(message.timestamp || message.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</time></div><p>{message.content}</p></div></div>; }) : <p className="conversation-empty">Say hello. A great adventure starts with a conversation.</p>}</div><form className="message-form" onSubmit={send}><label className="sr-only" htmlFor="message">Your message</label><input id="message" value={content} onChange={e => setContent(e.target.value)} placeholder="Share a thought with the group..." maxLength={2000} /><button className="button" disabled={sending || !content.trim()} aria-label={sending ? 'Sending message' : 'Send message'}><FiSend /></button></form></>}</section></div>}</main>;
}
function NotFound() {
  return <main className="page"><Empty title="A little lost?" text="This page has wandered off. Let’s get you back to the adventures." /></main>;
}
function ScrollTop() {
  const {
    pathname
  } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  }, [pathname]);
  return null;
}
export default function App() {
  return <AuthProvider><ScrollTop /><Header /><Routes><Route path="/" element={<Landing />} /><Route path="/main" element={<Explore />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage register />} /><Route path="/createtrip" element={<Protected><CreateTrip /></Protected>} /><Route path="/mytrips" element={<Protected><Explore mine /></Protected>} /><Route path="/viewtrip/:tripId" element={<TripDetail />} /><Route path="/profile" element={<Protected><Profile /></Protected>} /><Route path="/profilepage/:userId" element={<Profile />} /><Route path="/editprofile" element={<Protected><Profile edit /></Protected>} /><Route path="/chat" element={<Protected><Chat /></Protected>} /><Route path="*" element={<NotFound />} /></Routes></AuthProvider>;
}
