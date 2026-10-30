import { site } from "@/lib/site";
import type { Dictionary } from "@/i18n/dictionaries";

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="bg-band mt-20 w-full text-[color:var(--color-cream)]">
      {/* Alinhado junto à barra de navegação: 40px da lateral esquerda,
          fora da coluna centralizada (mesmo respiro do header). */}
      <div className="w-full px-10 py-10 text-base">
        {/* Figma: "Redes sociais" e IG/IN são Clother Regular (400). Os handles
            abaixo é que são Light (300). O peso global virou 300, então fixo o
            400 aqui explicitamente. */}
        <p className="font-normal">{dict.footer.social}</p>
        <ul className="mt-2 flex flex-col gap-1">
          <li className="flex items-center gap-3">
            <span className="w-5 shrink-0 font-normal">IG</span>
            <a
              href={site.social.instagram.url}
              target="_blank"
              rel="noreferrer"
              className="font-light underline decoration-from-font hover:opacity-80"
            >
              {site.social.instagram.handle}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-5 shrink-0 font-normal">IN</span>
            <a
              href={site.social.linkedin.url}
              target="_blank"
              rel="noreferrer"
              className="font-light underline decoration-from-font hover:opacity-80"
            >
              {site.social.linkedin.handle}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
