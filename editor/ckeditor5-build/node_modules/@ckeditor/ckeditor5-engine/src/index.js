/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
export { disableViewPlaceholder, enableViewPlaceholder, hideViewPlaceholder, needsViewPlaceholder, showViewPlaceholder } from './view/placeholder.js';
// Controller.
export { EditingController } from './controller/editingcontroller.js';
export { DataController } from './controller/datacontroller.js';
// Conversion.
export { Conversion } from './conversion/conversion.js';
export { ConversionHelpers } from './conversion/conversionhelpers.js';
export { UpcastHelpers } from './conversion/upcasthelpers.js';
export { DowncastHelpers } from './conversion/downcasthelpers.js';
export { Mapper } from './conversion/mapper.js';
export { HtmlDataProcessor } from './dataprocessor/htmldataprocessor.js';
export { XmlDataProcessor } from './dataprocessor/xmldataprocessor.js';
export { InsertOperation } from './model/operation/insertoperation.js';
export { MoveOperation } from './model/operation/moveoperation.js';
export { MergeOperation } from './model/operation/mergeoperation.js';
export { SplitOperation } from './model/operation/splitoperation.js';
export { MarkerOperation } from './model/operation/markeroperation.js';
export { OperationFactory } from './model/operation/operationfactory.js';
export { AttributeOperation } from './model/operation/attributeoperation.js';
export { RenameOperation } from './model/operation/renameoperation.js';
export { RootAttributeOperation } from './model/operation/rootattributeoperation.js';
export { RootOperation } from './model/operation/rootoperation.js';
export { NoOperation } from './model/operation/nooperation.js';
export { transformOperationSets } from './model/operation/transform.js';
// Model.
export { ModelDocumentSelection } from './model/documentselection.js';
export { ModelRange } from './model/range.js';
export { ModelLiveRange } from './model/liverange.js';
export { ModelLivePosition } from './model/liveposition.js';
export { Model } from './model/model.js';
export { ModelTreeWalker } from './model/treewalker.js';
export { ModelElement } from './model/element.js';
export { ModelPosition } from './model/position.js';
export { ModelDocumentFragment } from './model/documentfragment.js';
export { ModelDocument } from './model/document.js';
export { History } from './model/history.js';
export { ModelText } from './model/text.js';
export { ModelTextProxy } from './model/textproxy.js';
export { MarkerCollection } from './model/markercollection.js';
export { Batch } from './model/batch.js';
export { Differ } from './model/differ.js';
export { ModelNode } from './model/node.js';
export { ModelNodeList } from './model/nodelist.js';
export { ModelRootElement } from './model/rootelement.js';
export { ModelSchema, ModelSchemaContext } from './model/schema.js';
export { ModelSelection } from './model/selection.js';
export { ModelTypeCheckable } from './model/typecheckable.js';
export { ModelWriter } from './model/writer.js';
// Model utils.
export { autoParagraphEmptyRoots, isParagraphable, wrapInParagraph } from './model/utils/autoparagraphing.js';
// View.
export { ViewDataTransfer } from './view/datatransfer.js';
export { ViewDomConverter } from './view/domconverter.js';
export { ViewRenderer } from './view/renderer.js';
export { EditingView } from './view/view.js';
export { ViewDocument } from './view/document.js';
export { ViewText } from './view/text.js';
export { ViewTextProxy } from './view/textproxy.js';
export { ViewTokenList } from './view/tokenlist.js';
export { ViewElement } from './view/element.js';
export { ViewContainerElement, getViewFillerOffset } from './view/containerelement.js';
export { ViewEditableElement } from './view/editableelement.js';
export { ViewRootEditableElement } from './view/rooteditableelement.js';
export { ViewAttributeElement } from './view/attributeelement.js';
export { ViewEmptyElement } from './view/emptyelement.js';
export { ViewRawElement } from './view/rawelement.js';
export { ViewUIElement } from './view/uielement.js';
export { ViewDocumentFragment } from './view/documentfragment.js';
export { ViewDocumentSelection } from './view/documentselection.js';
export { ViewNode } from './view/node.js';
export { ViewPosition } from './view/position.js';
export { ViewRange } from './view/range.js';
export { ViewSelection } from './view/selection.js';
export { ViewTreeWalker } from './view/treewalker.js';
export { ViewTypeCheckable } from './view/typecheckable.js';
// View / Observer.
export { Observer } from './view/observer/observer.js';
export { ClickObserver } from './view/observer/clickobserver.js';
export { DomEventObserver } from './view/observer/domeventobserver.js';
export { MouseObserver } from './view/observer/mouseobserver.js';
export { TabObserver } from './view/observer/tabobserver.js';
export { TouchObserver } from './view/observer/touchobserver.js';
export { PointerObserver } from './view/observer/pointerobserver.js';
export { FakeSelectionObserver } from './view/observer/fakeselectionobserver.js';
export { KeyObserver } from './view/observer/keyobserver.js';
export { MutationObserver } from './view/observer/mutationobserver.js';
export { SelectionObserver } from './view/observer/selectionobserver.js';
export { CompositionObserver } from './view/observer/compositionobserver.js';
export { InputObserver } from './view/observer/inputobserver.js';
export { FocusObserver } from './view/observer/focusobserver.js';
export { ViewDowncastWriter } from './view/downcastwriter.js';
export { ViewUpcastWriter, ViewUpcastWriter as UpcastWriter // TODO: Remove after MathType has been adjusted.
 } from './view/upcastwriter.js';
export { Matcher } from './view/matcher.js';
export { BubblingEventInfo } from './view/observer/bubblingeventinfo.js';
export { ViewDocumentDomEventData as ViewDocumentDomEventData } from './view/observer/domeventdata.js';
// View / Events.
export { BubblingEmitterMixin } from './view/observer/bubblingemittermixin.js';
// View / Styles.
export { StylesMap, StylesProcessor } from './view/stylesmap.js';
export { addBackgroundStylesRules } from './view/styles/background.js';
export { addBorderStylesRules } from './view/styles/border.js';
export { addMarginStylesRules } from './view/styles/margin.js';
export { addPaddingStylesRules } from './view/styles/padding.js';
export { isColorStyleValue, isLineStyleValue, isLengthStyleValue, isPercentageStyleValue, isRepeatStyleValue, isPositionStyleValue, isAttachmentStyleValue, isURLStyleValue, getBoxSidesStyleValues, getBoxSidesStyleValueReducer, getBoxSidesStyleShorthandValue, getPositionStyleShorthandNormalizer, getShorthandStylesValues } from './view/styles/utils.js';
// Development / testing utils.
export { _getModelData, _setModelData, _parseModel, _stringifyModel } from './dev-utils/model.js';
export { _getViewData, _setViewData, _parseView, _stringifyView } from './dev-utils/view.js';
export { convertMapToTags as _convertMapToTags, convertMapToStringifiedObject as _convertMapToStringifiedObject, dumpTrees as _dumpTrees, initDocumentDumping as _initDocumentDumping, logDocument as _logDocument } from './dev-utils/utils.js';
// Internals
export { insertText as _downcastInsertText, insertAttributesAndChildren as _downcastInsertAttributesAndChildren, remove as _downcastRemove, createViewElementFromDowncastHighlightDescriptor as _downcastCreateViewElementFromDowncastHighlightDescriptor, convertRangeSelection as _downcastConvertRangeSelection, convertCollapsedSelection as _downcastConvertCollapsedSelection, cleanSelection as _downcastCleanSelection, wrap as _downcastWrap, insertElement as _downcastInsertElement, insertStructure as _downcastInsertStructure, insertUIElement as _downcastInsertUIElement } from './conversion/downcasthelpers.js';
export { MapperCache as _MapperCache } from './conversion/mapper.js';
export { convertToModelFragment as _upcastConvertToModelFragment, convertText as _upcastConvertText, convertSelectionChange as _upcastConvertSelectionChange } from './conversion/upcasthelpers.js';
export { ViewElementConsumables as _ViewElementConversionConsumables, normalizeConsumables as _normalizeConversionConsumables } from './conversion/viewconsumable.js';
export { BasicHtmlWriter as _DataProcessorBasicHtmlWriter } from './dataprocessor/basichtmlwriter.js';
export { OperationReplayer as _OperationReplayer } from './dev-utils/operationreplayer.js';
export { DetachOperation as _DetachOperation } from './model/operation/detachoperation.js';
export { transform as _operationTransform } from './model/operation/transform.js';
export { _insert as _insertIntoModelNodeList, _remove as _removeFromModelNodeList, _move as _moveInModelNodeList, _setAttribute as _setAttributeInModelNodeList, _normalizeNodes as _normalizeInModelNodeList } from './model/operation/utils.js';
export { getTextNodeAtPosition as _getModelTextNodeAtPosition, getNodeAfterPosition as _getModelNodeAfterPosition, getNodeBeforePosition as _getModelNodeBeforePosition } from './model/position.js';
export { autoParagraphEmptyRoots as _autoParagraphEmptyModelRoots, isParagraphable as _isParagraphableModelNode, wrapInParagraph as _wrapInModelParagraph } from './model/utils/autoparagraphing.js';
export { deleteContent as _deleteModelContent } from './model/utils/deletecontent.js';
export { getSelectedContent as _getSelectedModelContent } from './model/utils/getselectedcontent.js';
export { insertContent as _insertModelContent } from './model/utils/insertcontent.js';
export { insertObject as _insertModelObject } from './model/utils/insertobject.js';
export { modifySelection as _modifyModelSelection } from './model/utils/modifyselection.js';
export { injectSelectionPostFixer as _injectModelSelectionPostFixer, tryFixingRange as _tryFixingModelRange, mergeIntersectingRanges as _mergeIntersectingModelRanges } from './model/utils/selection-post-fixer.js';
export { NBSP_FILLER as _VIEW_NBSP_FILLER, MARKED_NBSP_FILLER as _VIEW_MARKED_NBSP_FILLER, BR_FILLER as _VIEW_BR_FILLER, INLINE_FILLER_LENGTH as _VIEW_INLINE_FILLER_LENGTH, INLINE_FILLER as _VIEW_INLINE_FILLER, startsWithFiller as _startsWithViewFiller, isInlineFiller as _isInlineViewFiller, getDataWithoutFiller as _getDataWithoutViewFiller, injectQuirksHandling as _injectViewQuirksHandling } from './view/filler.js';
export { isPatternMatched as _isViewPatternMatched } from './view/matcher.js';
export { injectUiElementHandling as _injectViewUIElementHandling } from './view/uielement.js';
