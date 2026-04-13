---
status: done
---

# Task: multi-marca

## Contexto

A Arco Educação opera com duas marcas — **SAS** e **COC** — que compartilham a mesma plataforma de LMS. O protótipo do laboratório de redação deve ser apresentado para escolas clientes de cada marca sem que uma escola veja elementos da outra marca. Isso impõe dois requisitos que se reforçam:

1. **Isolamento de acesso**: A URL entregue a uma escola já carrega a marca — se ela navegar "para fora" do domínio da sua marca, deve ser redirecionada ou receber um erro, nunca ver conteúdo da marca concorrente.
2. **Customização por marca**: Logo, tokens de tema, nomes de coleção, imagens dos cards e itens do menu de propostas variam por marca.

---

## Estratégia técnica

### Persistência da marca: cookie `httpOnly`

A marca é determinada **uma única vez**, na rota de entrada da escola (`/entrar/[marca]`). Um middleware do Next.js (`src/middleware.ts`) grava um cookie `marca` e redireciona para a home do persona correto. Todas as rotas subsequentes leem esse cookie — nunca a URL nem um query param — evitando que a escola acesse acidentalmente a marca errada.

```
/entrar/sas  →  seta cookie marca=sas  →  redireciona para /professor (ou /gestor)
/entrar/coc  →  seta cookie marca=coc  →  redireciona para /professor (ou /gestor)
```

O middleware intercepta **toda** requisição às rotas `/professor/*` e `/gestor/*`:
- Cookie presente e válido → prossegue.
- Cookie ausente → redireciona para `/entrar` (página genérica de erro/seleção).
- Cookie com valor inválido → idem.

O cookie deve ter `Path=/`, `SameSite=Lax` e, em produção, `Secure`. Para o protótipo, `httpOnly=false` é aceitável para facilitar debug via DevTools.

### Propagação da marca no App

O cookie é lido no layout raiz (`src/app/layout.tsx`) via `cookies()` do `next/headers` e o valor de `Marca` é injetado como atributo `data-marca` no `<html>` — isso permite CSS variables por marca sem JavaScript adicional no cliente.

Para componentes client-side que precisam da marca, um `MarcaContext` (React context) é populado no layout raiz e lido com um hook `useMarca()`.

### Tipos centrais

```ts
// src/types/marca.ts

export type Marca = 'sas' | 'coc';

export interface MarcaConfig {
  id: Marca;
  nomeExibicao: string;           // "SAS" | "COC"
  logoSrc: string;                // caminho da logo no /public
  corPrimaria: string;            // ex: '#0D4AD6' (SAS) | '#007724' (COC)
  corPrimariaHover: string;
  nomeColecaoPratique: string;    // "Pratique Redação" | "Laboratório de Redação"
  imagemColecaoPratique: string;  // caminho da imagem no /public
  itensProposta: ItensProposta;
}

export interface ItensProposta {
  professor: ItemProposta[];
  estudante: ItemProposta[];
}

export interface ItemProposta {
  label: string;
  tipo: 'video' | 'proposta' | 'manual';
}
```

### Configuração por marca

```ts
// src/config/marcas.ts

export const MARCAS: Record<Marca, MarcaConfig> = {
  sas: {
    id: 'sas',
    nomeExibicao: 'SAS',
    logoSrc: '/logos/sas.svg',
    corPrimaria: '#0D4AD6',
    corPrimariaHover: '#0035B2',
    nomeColecaoPratique: 'Pratique Redação',
    imagemColecaoPratique: '/images/pratique-redacao.jpg',
    itensProposta: {
      professor: [
        { label: 'Material de apoio (vídeo)', tipo: 'video' },
        { label: 'Proposta de redação', tipo: 'proposta' },
      ],
      estudante: [
        { label: 'Material de apoio (vídeo)', tipo: 'video' },
        { label: 'Proposta de redação', tipo: 'proposta' },
      ],
    },
  },
  coc: {
    id: 'coc',
    nomeExibicao: 'COC',
    logoSrc: '/logos/coc.svg',
    corPrimaria: '#007724',       // ajustar conforme brand guideline real
    corPrimariaHover: '#035816',
    nomeColecaoPratique: 'Laboratório de Redação',
    imagemColecaoPratique: '/images/lab-redacao-coc.jpg',
    itensProposta: {
      professor: [
        { label: 'Manual pedagógico', tipo: 'manual' },
        { label: 'Proposta de redação', tipo: 'proposta' },
      ],
      estudante: [
        { label: 'Material de apoio (vídeo)', tipo: 'video' },
        { label: 'Proposta de redação', tipo: 'proposta' },
      ],
    },
  },
};
```

---

## Entregáveis

### 1. Rotas de entrada

**`src/app/entrar/[marca]/route.ts`** (Route Handler)
- Valida que `marca` é `'sas'` ou `'coc'`.
- Grava cookie `marca` com o valor validado.
- Redireciona para `/professor` (persona padrão do protótipo) ou para uma query param `?next=` se passada na URL de entrada.
- Se `marca` inválido: redireciona para `/entrar` com mensagem de erro.

**`src/app/entrar/page.tsx`**
- Página de fallback exibida quando o cookie `marca` está ausente ou inválido.
- Exibe mensagem neutra (sem revelar nomes das marcas): "Link inválido ou expirado. Solicite um novo link ao seu contato na Arco Educação."
- Sem links ou botões que revelem nomes de marcas.

### 2. Middleware de proteção

**`src/middleware.ts`**
- Intercepta todas as requisições para `/professor/*`, `/gestor/*` e `/aluno/*`.
- Lê o cookie `marca`.
- Se ausente ou inválido: `NextResponse.redirect('/entrar')`.
- Se válido: prossegue, opcionalmente adiciona header `x-marca` para uso em Server Components sem re-leitura de cookie.

```ts
// Matcher
export const config = {
  matcher: ['/professor/:path*', '/gestor/:path*', '/aluno/:path*'],
};
```

### 3. Context e hook

**`src/contexts/MarcaContext.tsx`**
- Cria `MarcaContext` com o valor de `MarcaConfig`.
- Provider `MarcaProvider` recebe `marca: Marca` como prop.
- Hook `useMarca(): MarcaConfig` para uso em Client Components.

**`src/app/layout.tsx`** (layout raiz)
- Lê cookie `marca` via `cookies()` (ou header `x-marca` injetado pelo middleware).
- Envolve toda a árvore com `<MarcaProvider marca={marca}>`.
- Adiciona `data-marca={marca}` no `<html>` para CSS variables.

### 4. Logos por marca

- `public/logos/sas.svg` — logo SAS (a obter com o design/brand team)
- `public/logos/coc.svg` — logo COC (a obter com o design/brand team)
- Componente `<Logo />` em `src/components/Logo.tsx` lê `useMarca()` e exibe a logo correta.
- Substituir logo hardcoded na `Sidebar` e nos headers de context-views pelo componente `<Logo />`.

### 5. Tokens de tema por marca

Adicionar em `src/app/globals.css` (ou equivalente) variáveis CSS condicionais por marca:

```css
[data-marca="sas"] {
  --color-primary: #0D4AD6;
  --color-primary-hover: #0035B2;
}

[data-marca="coc"] {
  --color-primary: #007724;
  --color-primary-hover: #035816;
}
```

Todos os botões primários, links ativos e indicadores de navegação já devem usar `var(--color-primary)` em vez de valores hardcoded `#0D4AD6`.

### 6. Nome e imagem da coleção por marca

Nos pontos onde o nome "Pratique Redação" aparece em texto (cards de proposta, seção de configuração, drawer de turmas, seção de liberação):
- Substituir string literal por `marcaConfig.nomeColecaoPratique`.

Nas imagens dos cards de proposta com `colecaoId` do tipo Pratique/Lab:
- Substituir `/images/pratique-redacao.jpg` por `marcaConfig.imagemColecaoPratique`.

> **Imagem COC**: `public/images/lab-redacao-coc.jpg` deve ser fornecida pelo design/brand team.  
> **Fallback**: enquanto não disponível, usar a mesma imagem do SAS.

### 7. Itens do menu de propostas por marca

No componente que renderiza as abas/seções de detalhamento de uma proposta (professor e estudante), substituir a lista estática de itens por `marcaConfig.itensProposta.professor` e `marcaConfig.itensProposta.estudante`.

**SAS** (professor e estudante têm o mesmo set):
1. Material de apoio (vídeo)
2. Proposta de redação

**COC** (professor e estudante divergem):
- Professor: Manual pedagógico | Proposta de redação
- Estudante: Material de apoio (vídeo) | Proposta de redação

---

## Arquivos a criar / modificar

| Arquivo | Ação |
|---|---|
| `src/types/marca.ts` | Criar |
| `src/config/marcas.ts` | Criar |
| `src/contexts/MarcaContext.tsx` | Criar |
| `src/middleware.ts` | Criar |
| `src/app/entrar/[marca]/route.ts` | Criar |
| `src/app/entrar/page.tsx` | Criar |
| `src/app/layout.tsx` | Modificar — adicionar `MarcaProvider` |
| `src/components/Logo.tsx` | Criar |
| `src/components/Sidebar.tsx` | Modificar — usar `<Logo />` |
| `src/app/globals.css` | Modificar — CSS variables por `data-marca` |
| `public/logos/sas.svg` | Adicionar (asset externo) |
| `public/logos/coc.svg` | Adicionar (asset externo) |
| `public/images/lab-redacao-coc.jpg` | Adicionar (asset externo) |
| Componentes com "Pratique Redação" hardcoded | Modificar |
| Componente de itens de proposta | Modificar |

---

## Assets externos necessários (pré-requisitos)

Antes da implementação, coletar com o time de design/brand:
- [ ] Logo SAS em SVG (variante para fundo branco e fundo escuro, se houver)
- [ ] Logo COC em SVG (mesmas variantes)
- [ ] Tokens de cor primária COC confirmados pelo brand guideline
- [ ] Imagem de card para a coleção "Laboratório de Redação" (COC)

---

## Critérios de pronto

- [ ] `/entrar/sas` define cookie e redireciona; escola SAS só vê logo e cor SAS.
- [ ] `/entrar/coc` define cookie e redireciona; escola COC só vê logo e cor COC.
- [ ] Acesso direto a `/professor` sem cookie redireciona para `/entrar`.
- [ ] Navegar de `/entrar/sas` para `/entrar/coc` troca a marca corretamente (cookie sobrescrito).
- [ ] Nome "Pratique Redação" exibido para SAS; "Laboratório de Redação" para COC.
- [ ] Imagem do card da coleção correta por marca.
- [ ] Itens do menu de propostas corretos para gestor, professor e estudante por marca.
- [ ] Cor primária dos botões e elementos de destaque reflete a marca ativa.
- [ ] Logo correta exibida na sidebar e nos headers de context-views.
