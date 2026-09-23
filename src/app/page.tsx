import { redirect } from 'next/navigation';

/**
 * `/` is now a pure redirect to `/print` so that recruiters landing on the
 * site's root URL see the printable CV immediately. The full portfolio
 * homepage (project grid, hero, workspace tiles) is no longer reachable at
 * `/` — it has been replaced by the gate: `/print` is public, every other
 * route requires the workspace password.
 */
export default function HomePage() {
  redirect('/print');
}