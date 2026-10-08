/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

const SUPPORTED_LOCALES = [
	'en', // English
	'af', // Afrikaans
	'sq', // Albanian
	'ar', // Arabic
	'hy', // Armenian
	'ast', // Asturian
	'az', // Azerbaijani
	'eu', // Basque
	'be', // Belarusian
	'bn', // Bengali
	'bs', // Bosnian
	'bg', // Bulgarian
	'ca', // Catalan
	'zh_CN', // Chinese (China)
	'zh_TW', // Chinese (Taiwan)
	'hr', // Croatian
	'cs', // Czech
	'da', // Danish
	'nl', // Dutch
	'en_AU', // English (Australia)
	'en_GB', // English (United Kingdom)
	'eo', // Esperanto
	'et', // Estonian
	'fi', // Finnish
	'fr', // French
	'gl', // Galician
	'de', // German
	'de_CH', // German (Switzerland)
	'el', // Greek
	'gu', // Gujarati
	'he', // Hebrew
	'hi', // Hindi
	'hu', // Hungarian
	'id', // Indonesian
	'it', // Italian
	'ja', // Japanese
	'jv', // Javanese
	'kn', // Kannada
	'kk', // Kazakh
	'km', // Khmer
	'ko', // Korean
	'ku', // Kurdish
	'lv', // Latvian
	'lt', // Lithuanian
	'ms', // Malay
	'ne_NP', // Nepali (Nepal)
	'no', // Norwegian
	'nb', // Norwegian Bokmål
	'oc', // Occitan (post 1500)
	'fa', // Persian
	'pl', // Polish
	'pt', // Portuguese
	'pt_BR', // Portuguese (Brazil)
	'ro', // Romanian
	'ru', // Russian
	'sr', // Serbian
	'sr@latin', // Serbian (Latin)
	'si_LK', // Sinhala (Sri Lanka)
	'sk', // Slovak
	'sl', // Slovenian
	'es', // Spanish
	'es_CO', // Spanish (Colombia)
	'sv', // Swedish
	'tt', // Tatar
	'th', // Thai
	'ti', // Tigrinya
	'tr', // Turkish
	'tk', // Turkmen
	'uk', // Ukrainian
	'ur', // Urdu
	'ug', // Uyghur
	'uz', // Uzbek
	'vi' // Vietnamese
];

const LOCALES_FILENAME_MAP = {
	'ne_NP': 'ne',
	'si_LK': 'si',
	'sr@latin': 'sr-latn',
	'zh_TW': 'zh'
};

/**
 * @returns {Array.<Language>}
 */
export default function getLanguages() {
	return SUPPORTED_LOCALES.map( localeCode => {
		const languageCode = localeCode.split( /[-_@]/ )[ 0 ];
		const languageFileName = LOCALES_FILENAME_MAP[ localeCode ] || localeCode.toLowerCase().replace( /[^a-z0-9]+/, '-' );

		return {
			localeCode,
			languageCode,
			languageFileName
		};
	} );
}

/**
 * @typedef {object} Language
 *
 * @property {string} localeCode
 * @property {string} languageCode
 * @property {string} languageFileName
 */
