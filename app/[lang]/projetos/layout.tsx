/**
 * Layout da seção /projetos. Renderiza o `children` (índice ou página de case)
 * e o slot paralelo `@modal`, que mostra o case em modal sobre o índice quando
 * a navegação até ele é feita no cliente (rota interceptada). Aberto direto pela
 * URL ou recarregado, o case é a página completa e o slot cai em
 * `@modal/default.tsx` (null).
 */
export default function ProjetosLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
