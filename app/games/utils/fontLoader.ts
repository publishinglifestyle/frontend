import { dancingScriptFont } from '../fonts/dancing_script';
import { caveatVariableFont } from '../fonts/caveat_variable';
import { abrilFatfaceFont } from '../fonts/abril_fatface';
import { shadowsIntoLightFont } from '../fonts/shadows_into_light';

// Font family mapping: short names to CSS font-family names
const FONT_FAMILY_MAP: Record<string, string> = {
  dancing: 'dancing',
  caveat: 'caveat',
  abril: 'abril',
  shadows: 'shadows',
  times: 'Times New Roman, Times, serif',
  courier: 'Courier New, Courier, monospace',
  helvetica: 'Helvetica, Arial, sans-serif',
};

// Custom font data mapping
const CUSTOM_FONT_DATA: Record<string, string> = {
  dancing: dancingScriptFont,
  caveat: caveatVariableFont,
  abril: abrilFatfaceFont,
  shadows: shadowsIntoLightFont,
};

// List of custom fonts that need to be loaded via FontFace API
const CUSTOM_FONTS = ['dancing', 'caveat', 'abril', 'shadows'];

// Track which fonts have been registered to avoid duplicate registration
const registeredFonts = new Set<string>();

/**
 * Get the CSS font-family string for a given font name.
 * Maps short names (dancing, times, etc.) to proper CSS font-family values.
 */
export function getFontFamily(fontName: string): string {
  const lowerName = fontName.toLowerCase();
  return FONT_FAMILY_MAP[lowerName] || fontName;
}

/**
 * Check if a font name is a custom font that needs to be loaded.
 */
export function isCustomFont(fontName: string): boolean {
  return CUSTOM_FONTS.includes(fontName.toLowerCase());
}

/**
 * Register a custom font with the browser using the FontFace API.
 * This makes the font available for use in canvas and CSS.
 */
async function registerFont(fontName: string): Promise<void> {
  const lowerName = fontName.toLowerCase();

  // Skip if already registered or not a custom font
  if (registeredFonts.has(lowerName) || !CUSTOM_FONT_DATA[lowerName]) {
    return;
  }

  const fontData = CUSTOM_FONT_DATA[lowerName];
  const fontFamily = getFontFamily(lowerName);

  try {
    // Create a FontFace object with the base64 data
    const fontFace = new FontFace(
      fontFamily,
      `url(data:font/truetype;base64,${fontData})`,
      { style: 'normal', weight: 'normal' }
    );

    // Load the font
    await fontFace.load();

    // Add to document fonts
    // Cast to any to work around TypeScript FontFaceSet type limitations
    (document.fonts as any).add(fontFace);

    // Mark as registered
    registeredFonts.add(lowerName);
  } catch (e) {
    console.warn(`Failed to register font ${fontName}:`, e);
  }
}

/**
 * Ensures that the specified fonts are loaded before canvas rendering.
 * This registers custom fonts with the browser using the FontFace API
 * and waits for them to be ready.
 *
 * @param fontNames - Array of font names to load
 * @returns Promise that resolves when all fonts are loaded
 */
export async function ensureFontsLoaded(fontNames: string[]): Promise<void> {
  const loadPromises: Promise<void>[] = [];

  for (const name of fontNames) {
    const lowerName = name.toLowerCase();
    if (CUSTOM_FONTS.includes(lowerName)) {
      loadPromises.push(registerFont(lowerName));
    }
  }

  await Promise.all(loadPromises);

  // Wait for document fonts to be ready
  await document.fonts.ready;
}

/**
 * Ensures a single font is loaded before canvas rendering.
 * Convenience wrapper around ensureFontsLoaded for single font usage.
 *
 * @param fontName - The font name to load
 * @returns Promise that resolves when the font is loaded
 */
export async function ensureFontLoaded(fontName: string): Promise<void> {
  return ensureFontsLoaded([fontName]);
}
