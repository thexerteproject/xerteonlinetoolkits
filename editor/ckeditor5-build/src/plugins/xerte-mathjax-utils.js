export const MATH_SYNTAX = {
	TEX: 'tex',
	ASCIIMATH: 'asciimath',
	MATHML: 'mathml'
};

const FORMATS = [
	{ syntax: MATH_SYNTAX.TEX, display: 'inline', open: '\\(', close: '\\)' },
	{ syntax: MATH_SYNTAX.TEX, display: 'block', open: '\\[', close: '\\]' },
	{ syntax: MATH_SYNTAX.ASCIIMATH, display: 'inline', open: '`', close: '`' },
	{ syntax: MATH_SYNTAX.MATHML, display: 'block', open: '<math display="block">', close: '</math>' },
	{ syntax: MATH_SYNTAX.MATHML, display: 'inline', open: '<math>', close: '</math>' }
];

export function parseMathJaxValue( value ) {
	const raw = String( value || '' );
	const trimmed = raw.trim();
	for ( const format of FORMATS ) {
		if ( trimmed.startsWith( format.open ) && trimmed.endsWith( format.close ) ) {
			return {
				source: trimmed.slice( format.open.length, -format.close.length ),
				syntax: format.syntax,
				display: format.display
			};
		}
	}

	// CKEditor 4 defaulted new, otherwise unrecognised equations to block TeX.
	return { source: raw, syntax: MATH_SYNTAX.TEX, display: 'block' };
}

export function normalizeMathJaxInput( value, syntax, display ) {
	const raw = String( value || '' );
	const trimmed = raw.trim();
	for ( const [ open, close, normalizedDisplay ] of [ [ '\\\\(', '\\\\)', 'inline' ], [ '\\\\[', '\\\\]', 'block' ] ] ) {
		if ( trimmed.startsWith( open ) && trimmed.endsWith( close ) ) {
			return { source: trimmed.slice( open.length, -close.length ), syntax: MATH_SYNTAX.TEX, display: normalizedDisplay };
		}
	}
	for ( const format of FORMATS ) {
		if ( trimmed.startsWith( format.open ) && trimmed.endsWith( format.close ) ) {
			return {
				source: trimmed.slice( format.open.length, -format.close.length ),
				syntax: format.syntax,
				display: format.display
			};
		}
	}
	return { source: raw, syntax, display };
}

export function serializeMathJaxValue( { source = '', syntax = MATH_SYNTAX.TEX, display = 'block' } = {} ) {
	if ( syntax === MATH_SYNTAX.ASCIIMATH ) {
		return `\`${ source }\``;
	}
	if ( syntax === MATH_SYNTAX.MATHML ) {
		return display === 'block' ? `<math display="block">${ source }</math>` : `<math>${ source }</math>`;
	}
	return display === 'block' ? `\\[${ source }\\]` : `\\(${ source }\\)`;
}
