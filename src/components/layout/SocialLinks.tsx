import { socials, type SocialId } from "@content/site";
import { Icon } from "@/components/ui/Icon";

interface SocialLinksProps {
  /** Which networks to show, in order. Defaults to every public one. */
  ids?: readonly SocialId[];
  className?: string;
  /** Accessible name of the list. */
  label: string;
  /** Builds the accessible name of a link, e.g. "GitHub (nouvel onglet)". */
  linkLabel: (label: string) => string;
}

/** Icon-only links to the studio networks (accounts without a public URL are skipped). */
export function SocialLinks({ ids, className, label, linkLabel }: SocialLinksProps) {
  const list = (ids ? ids.map((id) => socials.find((s) => s.id === id)) : socials).filter(
    (s): s is (typeof socials)[number] & { url: string } => Boolean(s?.url),
  );
  return (
    <ul className={className} aria-label={label}>
      {list.map((social) => (
        <li key={social.id}>
          <a href={social.url} target="_blank" rel="noopener" aria-label={linkLabel(social.label)}>
            <Icon name={social.id} />
          </a>
        </li>
      ))}
    </ul>
  );
}
