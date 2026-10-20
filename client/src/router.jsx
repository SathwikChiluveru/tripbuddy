import { createContext, useContext, useEffect, useState } from 'react';
const RouterContext = createContext(null);
export function BrowserRouter({
  children
}) {
  const [location, setLocation] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
    state: window.history.state
  });
  useEffect(() => {
    const listener = () => setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      state: window.history.state
    });
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);
  function navigate(to, options = {}) {
    window.history[options.replace ? 'replaceState' : 'pushState'](options.state || null, '', to);
    setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      state: options.state
    });
  }
  return <RouterContext.Provider value={{
    location,
    navigate
  }}>{children}</RouterContext.Provider>;
}
export const useNavigate = () => useContext(RouterContext).navigate;
export const useLocation = () => useContext(RouterContext).location;
export function Link({
  to,
  onClick,
  children,
  ...props
}) {
  const navigate = useNavigate();
  const internal = typeof to === 'string' && to.startsWith('/') && !to.startsWith('//') && !to.includes('\\') && (() => {
    try { return new URL(to, window.location.origin).origin === window.location.origin; }
    catch { return false; }
  })();
  const safeHref = internal || (typeof to === 'string' && (/^https:\/\//i.test(to) || /^mailto:/i.test(to))) ? to : '#';
  return <a href={safeHref} {...props} onClick={e => {
    onClick?.(e);
    if (internal && !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      navigate(to);
    }
  }}>{children}</a>;
}
export function NavLink({
  className = '',
  to,
  ...props
}) {
  const location = useLocation();
  return <Link to={to} className={`${className} ${location.pathname === to ? 'active' : ''}`} aria-current={location.pathname === to ? 'page' : undefined} {...props} />;
}
export function Navigate({
  to,
  state,
  replace
}) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, {
      state,
      replace
    });
  }, [to]);
  return null;
}
const Params = createContext({});
export const useParams = () => useContext(Params);
export function Route() {
  return null;
}
export function Routes({
  children
}) {
  const {
    pathname
  } = useLocation();
  for (const child of children) {
    const pattern = child.props.path;
    if (pattern === '*') return child.props.element;
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    }) + '/?$');
    const match = pathname.match(re);
    if (match) return <Params.Provider value={Object.fromEntries(keys.map((key, i) => [key, safeDecode(match[i + 1])]))}>{child.props.element}</Params.Provider>;
  }
  return null;
}

function safeDecode(value) { try { return decodeURIComponent(value); } catch { return value; } }
