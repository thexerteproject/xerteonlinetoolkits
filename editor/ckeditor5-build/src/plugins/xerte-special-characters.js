/**
 * Add Xerte's legacy Greek and mathematical characters to CKEditor 5.
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';

const greekCharacters = [
	[ 'Alpha', 'Α' ], [ 'Beta', 'Β' ], [ 'Gamma', 'Γ' ], [ 'Delta', 'Δ' ],
	[ 'Epsilon', 'Ε' ], [ 'Zeta', 'Ζ' ], [ 'Eta', 'Η' ], [ 'Theta', 'Θ' ],
	[ 'Iota', 'Ι' ], [ 'Kappa', 'Κ' ], [ 'Lambda', 'Λ' ], [ 'Mu', 'Μ' ],
	[ 'Nu', 'Ν' ], [ 'Xi', 'Ξ' ], [ 'Omicron', 'Ο' ], [ 'Pi', 'Π' ],
	[ 'Rho', 'Ρ' ], [ 'Sigma', 'Σ' ], [ 'Tau', 'Τ' ], [ 'Upsilon', 'Υ' ],
	[ 'Phi', 'Φ' ], [ 'Chi', 'Χ' ], [ 'Psi', 'Ψ' ], [ 'Omega', 'Ω' ],
	[ 'alpha', 'α' ], [ 'beta', 'β' ], [ 'gamma', 'γ' ], [ 'delta', 'δ' ],
	[ 'epsilon', 'ε' ], [ 'zeta', 'ζ' ], [ 'eta', 'η' ], [ 'theta', 'θ' ],
	[ 'iota', 'ι' ], [ 'kappa', 'κ' ], [ 'lambda', 'λ' ], [ 'mu', 'μ' ],
	[ 'nu', 'ν' ], [ 'xi', 'ξ' ], [ 'omicron', 'ο' ], [ 'pi', 'π' ],
	[ 'rho', 'ρ' ], [ 'sigma', 'σ' ], [ 'final sigma', 'ς' ], [ 'tau', 'τ' ],
	[ 'upsilon', 'υ' ], [ 'phi', 'φ' ], [ 'chi', 'χ' ], [ 'psi', 'ψ' ],
	[ 'omega', 'ω' ]
].map( ( [ name, character ] ) => ( {
	title: `Greek ${ name[ 0 ] === name[ 0 ].toUpperCase() ? 'capital' : 'small' } letter ${ name }`,
	character
} ) );

const mathematicalCharacters = [
	{ title: 'Less than or equal', character: '≤' },
	{ title: 'Greater than or equal', character: '≥' },
	{ title: 'Not equal', character: '≠' },
	{ title: 'Plus-minus', character: '±' },
	{ title: 'Centered dot', character: '·' },
	{ title: 'Therefore', character: '∴' }
];

export class XerteSpecialCharacters extends Plugin {
	static get pluginName() {
		return 'XerteSpecialCharacters';
	}

	init() {
		const specialCharacters = this.editor.plugins.get( 'SpecialCharacters' );

		specialCharacters.addItems( 'Greek', greekCharacters );
		specialCharacters.addItems( 'Mathematical', mathematicalCharacters );
	}
}
