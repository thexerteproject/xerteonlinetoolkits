/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh' ]: { dictionary, getPluralForm } } = {"zh":{"dictionary":{"Open file manager":"開啟檔案管理程式","Cannot determine a category for the uploaded file.":"無法確定上傳檔案的分類。","Cannot access default workspace.":"無法存取預設工作區。","You have no image editing permissions.":"您沒有圖片編輯權限。","Edit image":"編輯圖片","Processing the edited image.":"正在處理已編輯的圖片。","Server failed to process the image.":"伺服器無法處理該圖片。","Failed to determine category of edited image.":"無法判斷已編輯圖片的類別。"},getPluralForm(n){return 0;}}};
e[ 'zh' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh' ].dictionary = Object.assign( e[ 'zh' ].dictionary, dictionary );
e[ 'zh' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
