import type { ComponentPropsWithoutRef } from 'react';
import { useLinkClickHandler, useLocation } from 'react-router-dom';

type Props = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { hash: `#${string}` };

export function InPageLink({ hash, target, onClick, ...props }: Props) {
  const { search } = useLocation();
  const navigate = useLinkClickHandler<HTMLAnchorElement>({ search, hash }, { target });
  // Exported HTML cannot know a visitor's query. A fragment-only href preserves
  // it before hydration; the router handles scroll restoration once mounted.
  return <a {...props} href={hash} target={target} onClick={event => {
    onClick?.(event);
    if (!event.defaultPrevented) navigate(event);
  }} />;
}
