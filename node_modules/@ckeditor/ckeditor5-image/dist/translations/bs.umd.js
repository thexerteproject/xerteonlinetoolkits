/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'bs' ]: { dictionary, getPluralForm } } = {"bs":{"dictionary":{"image widget":"","Wrap text":"Prelomi tekst","Break text":"","In line":"","Side image":"","Full size image":"","Left aligned image":"Lijevo poravnata slika","Centered image":"Centrirana slika","Right aligned image":"Desno poravnata slika","Change image text alternative":"Promijeni ALT atribut za sliku","Text alternative":"ALT atribut","Enter image caption":"Unesi naziv slike","Insert image":"Umetni sliku","Replace image":"","Upload from computer":"","Replace from computer":"","Upload image from computer":"","Image from computer":"","From computer":"","Replace image from computer":"","Upload failed":"Učitavanje slike nije uspjelo","You have no image upload permissions.":"","Image toolbar":"","Resize image":"Promijeni veličinu slike","Resize image to %0":"","Resize image to the original size":"Postavi originalnu veličinu slike","Resize image (in %0)":"","Original":"Original","Custom image size":"","Custom":"","Image resize list":"Lista veličina slike","Insert image via URL":"Umetni sliku preko URLa","Insert via URL":"","Image via URL":"","Via URL":"","Update image URL":"Ažuriraj URL slike","Caption for the image":"","Caption for image: %0":"","The value must not be empty.":"","The value should be a plain number.":"","Uploading image":"","Image upload complete":"","Error during image upload":"","Image":"","Image Resize":"","Text Alternative":""},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'bs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'bs' ].dictionary = Object.assign( e[ 'bs' ].dictionary, dictionary );
e[ 'bs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
