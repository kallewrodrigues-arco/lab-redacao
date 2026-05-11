import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { MarcaProvider } from '@/contexts/MarcaContext';
import type { Marca } from '@/types/marca';
import { DEFAULT_MARCA } from '@/config/marcas';

export const metadata: Metadata = {
  title: 'Laboratório de Redação',
  description: 'Plataforma de gestão de redações escolares',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawMarca = cookieStore.get('marca')?.value;
  const marca: Marca =
    rawMarca === 'sas' || rawMarca === 'coc' ? rawMarca : DEFAULT_MARCA;

  return (
    <html lang="pt-BR" data-marca={marca}>
      <body suppressHydrationWarning>
        <MarcaProvider marca={marca}>
          {children}
        </MarcaProvider>
      </body>
    </html>
  );
}
