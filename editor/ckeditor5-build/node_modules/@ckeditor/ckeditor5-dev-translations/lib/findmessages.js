/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import parser from '@babel/parser';
import { default as traverse } from '@babel/traverse';

/**
 * Parses source and finds messages from the first argument of `t()` calls.
 *
 * @param {string} source A content of the JS file that will be translated.
 * @param {string} sourceFile A path to source file, used only for creating error messages.
 * @param {(msg: Message) => void} onMessageFound
 * @param {(err: string) => void} onErrorFound
 * @returns {string} Transformed source.
 */
export default function findMessages( source, sourceFile, onMessageFound, onErrorFound ) {
	const ast = parser.parse( source, {
		sourceType: 'module',
		ranges: true,
		plugins: [
			'typescript'
		]
	} );

	// Support for a non-`type=module` project.
	const traverseCallable = typeof traverse === 'function' ? traverse : traverse.default;

	traverseCallable( ast, {
		CallExpression: ( { node } ) => {
			try {
				findMessagesInNode( node );
			} catch ( err ) {
				onErrorFound( 'CKEditor5 Translation tool found problem. \n' + err.stack );
			}
		}
	} );

	function findMessagesInNode( node ) {
		// Log a warning for the `editor.t()` calls and similar which aren't supported yet.
		if ( isTMethodCallExpression( node ) ) {
			const objName = node.callee.object.name;
			const propName = node.callee.property.name;

			onErrorFound(
				// TODO - ${ objName }.${ propName } is naive.
				`Found '${ objName }.${ propName }()' in the ${ sourceFile }. ` +
				'Only messages from direct \'t()\' calls will be handled by CKEditor 5 translation mechanisms.'
			);
		}

		if ( !isTFunctionCallExpression( node ) ) {
			return;
		}

		const firstArgument = node.arguments[ 0 ];

		findMessagesInExpression( firstArgument );
	}

	function findMessagesInExpression( node ) {
		// Matches t( { string: 'foo' } ) and t( { 'string': 'foo' } ).
		// (also `plural` and `id` properties)
		if ( node.type === 'ObjectExpression' ) {
			const properties = node.properties || [];

			const idProperty = getProperty( properties, 'id' );
			const stringProperty = getProperty( properties, 'string' );
			const pluralProperty = getProperty( properties, 'plural' );

			// TODO - value assertions.

			/** @type {Message} */
			const message = {
				string: stringProperty.value.value,
				id: stringProperty.value.value
			};

			if ( idProperty ) {
				message.id = idProperty.value.value;
			}

			if ( pluralProperty ) {
				message.plural = pluralProperty.value.value;
			}

			onMessageFound( message );

			return;
		}

		// Matches t( 'foo' )
		if ( node.type === 'StringLiteral' ) {
			onMessageFound( {
				string: node.value,
				id: node.value
			} );

			return;
		}

		// Matches t( foo ? 'bar' : { string: 'baz', plural: 'biz' } );
		if ( node.type === 'ConditionalExpression' ) {
			findMessagesInExpression( node.consequent );
			findMessagesInExpression( node.alternate );

			return;
		}

		onErrorFound(
			`First t() call argument should be a string literal or an object literal (${ sourceFile }).`
		);
	}
}

// Get property from the list of properties
// It supports both forms: `{ propertyName: foo }` and `{ 'propertyName': 'foo' }`
function getProperty( properties, propertyName ) {
	return properties.find( property => {
		if ( property.key.type === 'Identifier' ) {
			return property.key.name === propertyName;
		}

		if ( property.key.type === 'StringLiteral' ) {
			return property.key.value === propertyName;
		}
	} );
}

function isTFunctionCallExpression( node ) {
	return node.callee.name === 't';
}

function isTMethodCallExpression( node ) {
	return (
		node.callee.type === 'MemberExpression' &&
		node.callee.property.name === 't' &&

		// Skip this.t() calls.
		// These calls can be used frequently in the minified/ obfuscated code.
		node.callee.object.type !== 'ThisExpression'
	);
}

/**
 * @typedef {object} Message
 *
 * @property {string} id
 * @property {string} string
 * @property {string} [plural]
 */
