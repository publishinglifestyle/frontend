import { Translations } from "../translations.d";

/**
 * Function to get translations based on detected language
 * @param {string} detectedLanguage - The language code detected from the browser (e.g., 'en-US').
 * @returns {Promise<Translations>} - A promise that resolves to the translations for the detected language.
 */
export const getTranslations = async (
  detectedLanguage: string
): Promise<Translations> => {
  const defaultLanguage = "en";

  // Extract the first two characters of the detected language
  const languageCode = detectedLanguage.slice(0, 2);

  // Determine the language to use
  const language = ["en", "it"].includes(languageCode)
    ? languageCode
    : defaultLanguage;

  try {
    // Dynamically import the correct JSON file and cast to Translations
    const translations: Translations = await import(
      `../translations/${language}.json`
    ).then((module) => module.default);
    return translations;
  } catch (error) {
    console.error("Error loading translation file:", error);
    // Fallback to default language if there's an error and cast to Translations
    const translations: Translations = await import(
      `../translations/${defaultLanguage}.json`
    ).then((module) => module.default);
    return translations;
  }
};
