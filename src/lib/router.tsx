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

function normalizePath(path: string): string {
  if (!path) return '/';
  const clean = path.replace(/\/+/g, '/');
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean.startsWith('/') ? clean : `/${clean}`;
}

export const BrowserRouter: React.FC<{ children: ReactNode; basePath?: string }> = ({
  children,
  basePath = '',
}) => {
  const [pathname, setPathname] = useState<string>(() => {
    return normalizePath(window.location.pathname);
  });
  const [outletContent, setOutletContent] = useState<ReactNode | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    const target = normalizePath(to);
    if (options?.replace) {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }
    setPathname(target);
    window.scrollTo(0, 0);
  };

  const value = useMemo(
    () => ({
      pathname,
      navigate,
      basePath,
      outletContent,
      setOutletContent,
    }),
    [pathname, basePath, outletContent]
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
    <a href={to} onClick={handleClick} className={className} {...props}>
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
