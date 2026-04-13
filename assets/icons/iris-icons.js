/**
 * IrisDS — Product/Feature Icon Registry
 * Source: Figma → IrisDS → Icons (file: oxRf3scNZycsYvu9lHNaXi)
 * Section node: 1470:6 (Product/Feature Icons)
 *
 * Each icon has 3 sizes:
 *   sm  → 16 × 16 px  (Small)
 *   md  → 20 × 20 px  (Medium)
 *   lg  → 24 × 24 px  (Large)
 *
 * Figma node IDs are provided for reference/re-export.
 * SVG files should be placed at: assets/icons/{name}-{size}.svg
 *
 * To export from Figma:
 *   1. Open the IrisDS Icons file in Figma Desktop
 *   2. Select each size variant of the icon frame
 *   3. Export as SVG → save to assets/icons/{name}-{size}.svg
 *
 * Or via Figma REST API:
 *   GET https://api.figma.com/v1/images/{fileKey}?ids={nodeId}&format=svg
 *   Authorization: Bearer {FIGMA_TOKEN}
 */

export const IRIS_ICON_FILE_KEY = 'oxRf3scNZycsYvu9lHNaXi';

/**
 * Registry: icon-name → { label, keywords, figmaNodeId, sizes: { sm, md, lg } }
 *   figmaNodeId: the Figma frame that groups all sizes
 *   sizes: individual size node IDs
 */
export const IRIS_ICONS = {
  'more-horizontal': {
    label: 'More Horizontal',
    keywords: ['more', 'mais', 'actions', 'ações', 'options', 'opções', 'overflow', 'ellipsis', 'dots', 'pontos'],
    figmaNodeId: '43:1654',
    sizes: { sm: '43:1661', md: '43:1659', lg: '43:1655' },
  },
};

/** Sorted list of all icon names */
export const IRIS_ICON_NAMES = Object.keys(IRIS_ICONS).sort();

/** Sizes config */
export const IRIS_ICON_SIZES = {
  sm: { px: 16, label: 'Small' },
  md: { px: 20, label: 'Medium' },
  lg: { px: 24, label: 'Large' },
};

/**
 * Resolve the src path for an icon file.
 * Convention: assets/icons/{name}-{size}.svg
 * Adjust basePath if your deployment serves assets from a different root.
 */
export function irisIconSrc(name, size = 'lg', basePath = '../icons') {
  return `${basePath}/${name}-${size}.svg`;
}

/**
 * Create an <img> element for the given icon.
 * Returns null if the icon name is unknown.
 */
export function createIrisIconElement(name, size = 'lg', basePath = '../icons') {
  const icon = IRIS_ICONS[name];
  if (!icon) {
    console.warn(`[IrisIcons] Unknown icon: "${name}". Available: ${IRIS_ICON_NAMES.join(', ')}`);
    return null;
  }
  const px = IRIS_ICON_SIZES[size]?.px ?? 24;
  const img = document.createElement('img');
  img.src = irisIconSrc(name, size, basePath);
  img.width = px;
  img.height = px;
  img.alt = icon.label;
  img.className = `iris-icon iris-icon--${size}`;
  img.setAttribute('data-icon', name);
  img.setAttribute('loading', 'lazy');
  return img;
}

/**
 * Auto-initialize all <span class="iris-icon" data-icon="..." data-size="..."> elements on the page.
 */
export function initIrisIcons(basePath = '../icons') {
  document.querySelectorAll('[data-iris-icon]').forEach(el => {
    const name = el.dataset.irisIcon;
    const size = el.dataset.irisSize || 'lg';
    const img = createIrisIconElement(name, size, basePath);
    if (img) {
      el.innerHTML = '';
      el.appendChild(img);
    }
  });
}

// Auto-init on DOMContentLoaded when used as a plain script
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initIrisIcons());
}
