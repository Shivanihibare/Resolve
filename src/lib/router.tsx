/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ResolveIT Enterprise Router
 * Self-contained, lightweight zero-dependency SPA Router
 * Compatible with Browser HTML5 History and Vite / GitHub Pages base paths.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

interface RouterContextType {
  pathname: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  basePath: string;
  outletContent: ReactNode | null;
  setOutletContent: (content: ReactNode | null) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function normalizePath(path: string): string {
  if (!path) return '/';
  const clean = path.replace(/\/+/g, '/');
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean.startsWith('/') ? clean : `/${clean}`;
}

export function cleanBasePath(base: string): string {
  if (!base || base === '/') return '';
  let clean = base.replace(/\/+/g, '/');
  if (!clean.startsWith('/') && !clean.startsWith('.')) {
    clean = `/${clean}`;
  }
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean === '/' ? '' : clean;
}

export function stripBasePath(fullPath: string, basePath: string): string {
  const cleanBase = cleanBasePath(basePath);
  const normalized = normalizePath(fullPath);
  if (!cleanBase) return normalized;

  if (normalized === cleanBase) {
    return '/';
  }
  if (normalized.startsWith(`${cleanBase}/`)) {
    return normalizePath(normalized.slice(cleanBase.length));
  }
  return normalized;
}

export function withBasePath(path: string, basePath: string): string {
  const cleanBase = cleanBasePath(basePath);
  if (!cleanBase) return normalizePath(path);

  // If path is an external URL, protocol, hash-only, or query-only, leave as is
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path) || path.startsWith('#') || path.startsWith('?')) {
    return path;
  }

  // Preserve query string or hash
  const match = path.match(/^([^?#]*)(.*)$/);
  const pathname = match ? match[1] : path;
  const searchAndHash = match ? match[2] : '';

  const cleanPath = normalizePath(pathname);
  let resolved: string;
  if (cleanPath === cleanBase || cleanPath.startsWith(`${cleanBase}/`)) {
    resolved = cleanPath === cleanBase ? `${cleanBase}/` : cleanPath;
  } else if (cleanPath === '/') {
    resolved = `${cleanBase}/`;
  } else {
    resolved = `${cleanBase}${cleanPath}`;
  }

  return `${resolved}${searchAndHash}`;
}

export const BrowserRouter: React.FC<{ children: ReactNode; basePath?: string }> = ({
  children,
  basePath: propBasePath,
}) => {
  const effectiveBasePath =
    propBasePath ?? (import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || '/');

  const [pathname, setPathname] = useState<string>(() => {
    return stripBasePath(window.location.pathname, effectiveBasePath);
  });
  const [outletContent, setOutletContent] = useState<ReactNode | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(stripBasePath(window.location.pathname, effectiveBasePath));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [effectiveBasePath]);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    const match = to.match(/^([^?#]*)(.*)$/);
    const rawPath = match ? match[1] : to;
    const searchAndHash = match ? match[2] : '';

    const internalPath = stripBasePath(rawPath, effectiveBasePath);
    const targetUrl = withBasePath(internalPath, effectiveBasePath) + searchAndHash;

    if (options?.replace) {
      window.history.replaceState({}, '', targetUrl);
    } else {
      window.history.pushState({}, '', targetUrl);
    }
    setPathname(internalPath);
    window.scrollTo(0, 0);
  };

  const value = useMemo(
    () => ({
      pathname,
      navigate,
      basePath: effectiveBasePath,
      outletContent,
      setOutletContent,
    }),
    [pathname, effectiveBasePath, outletContent]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export function useLocation() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useLocation must be used within BrowserRouter');
  return { pathname: ctx.pathname };
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useNavigate must be used within BrowserRouter');
  return ctx.navigate;
}

export interface RouteProps {
  path?: string;
  element?: ReactNode;
  children?: ReactNode;
  index?: boolean;
}

export const Route: React.FC<RouteProps> = () => {
  return null;
};

export const Outlet: React.FC = () => {
  const ctx = useContext(RouterContext);
  return <>{ctx?.outletContent}</>;
};

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace = true }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace, navigate]);
  return null;
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
  children: ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, replace, children, className, onClick, ...props }) => {
  const navigate = useNavigate();
  const ctx = useContext(RouterContext);
  const basePath = ctx?.basePath ?? (import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || '/');
  const href = withBasePath(to, basePath);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (
      !e.defaultPrevented &&
      e.button === 0 &&
      !e.metaKey &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      (!props.target || props.target === '_self')
    ) {
      e.preventDefault();
      navigate(to, { replace });
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export interface NavLinkProps extends Omit<LinkProps, 'className' | 'children'> {
  className?: string | ((props: { isActive: boolean }) => string);
  children: ReactNode | ((props: { isActive: boolean }) => ReactNode);
  end?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, className, children, end = false, ...props }) => {
  const { pathname } = useLocation();
  const current = normalizePath(pathname);
  const target = normalizePath(to);

  const isActive = end ? current === target : current.startsWith(target);

  const computedClass = typeof className === 'function' ? className({ isActive }) : className;
  const computedChildren = typeof children === 'function' ? children({ isActive }) : children;

  return (
    <Link to={to} className={computedClass} {...props}>
      {computedChildren}
    </Link>
  );
};

export const Routes: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname, setOutletContent } = useContext(RouterContext)!;
  const current = normalizePath(pathname);

  let matchedElement: ReactNode = null;
  let notFoundElement: ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<RouteProps>(child)) return;

    const { path, element, children: subChildren } = child.props;

    if (path === '*') {
      notFoundElement = element;
      return;
    }

    if (!path) return;

    const routePath = normalizePath(path);

    // Exact match for top-level non-parent route
    if (!subChildren && current === routePath) {
      matchedElement = element;
      return;
    }

    // Parent layout route match (e.g., path="/customer" or path="/")
    if (subChildren) {
      let isParentMatch = false;
      if (routePath === '/') {
        isParentMatch = true;
      } else {
        isParentMatch = current === routePath || current.startsWith(`${routePath}/`);
      }

      if (isParentMatch) {
        let subMatched: ReactNode = null;

        React.Children.forEach(subChildren, (subChild) => {
          if (!React.isValidElement<RouteProps>(subChild)) return;
          const sub = subChild.props;

          if (sub.index && current === routePath) {
            subMatched = sub.element;
            return;
          }

          if (sub.path) {
            const fullSubPath = routePath === '/' ? normalizePath(sub.path) : normalizePath(`${routePath}/${sub.path}`);
            if (current === fullSubPath) {
              subMatched = sub.element;
              return;
            }
          }
        });

        if (subMatched !== null) {
          matchedElement = (
            <ParentWrapper element={element} outlet={subMatched} setOutletContent={setOutletContent} />
          );
        }
      }
    }
  });

  return <>{matchedElement || notFoundElement || null}</>;
};

const ParentWrapper: React.FC<{
  element: ReactNode;
  outlet: ReactNode;
  setOutletContent: (node: ReactNode) => void;
}> = ({ element, outlet, setOutletContent }) => {
  useEffect(() => {
    setOutletContent(outlet);
  }, [outlet, setOutletContent]);

  return <>{element}</>;
};
