/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh-cn' ]: { dictionary, getPluralForm } } = {"zh-cn":{"dictionary":{"Open file manager":"打开文件管理器","Cannot determine a category for the uploaded file.":"无法确定上传文件的类别。","Cannot access default workspace.":"无法访问默认工作区","You have no image editing permissions.":"您没有编辑图片的权限。","Edit image":"编辑图片","Processing the edited image.":"正在处理已编辑的图片。","Server failed to process the image.":"服务器未能处理图片。","Failed to determine category of edited image.":"未能确定已编辑图片的类别。"},getPluralForm(n){return 0;}}};
e[ 'zh-cn' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh-cn' ].dictionary = Object.assign( e[ 'zh-cn' ].dictionary, dictionary );
e[ 'zh-cn' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
