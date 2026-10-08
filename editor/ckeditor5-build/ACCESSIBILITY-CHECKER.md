# CKEditor 5 accessibility checker

The CKEditor 5 build uses `axe-core` to check the rendered editor content. The
integration reports definite violations and items that need manual review, and
can locate most affected elements in the editor. Results remain in a movable,
resizable floating panel so authors can inspect and edit the content alongside
the findings.

This is an automated authoring aid, not a declaration of WCAG conformance.
Manual accessibility testing remains necessary.

## Licensing

The Xerte integration code is Apache-2.0. `axe-core` is distributed under the
Mozilla Public License 2.0 and includes an "Incompatible With Secondary
Licenses" notice. The exact dependency version is pinned in `package-lock.json`.
Its source and license are available from:

https://github.com/dequelabs/axe-core

The generated CKEditor bundle must be distributed with
`editor/js/vendor/ckeditor5/LICENSE-NOTICE.txt`.

## Differences from the CKEditor 4 / Quail checker

The initial CKEditor 5 integration does not yet reproduce these legacy features:

- automatic and semi-automatic quick fixes;
- persistent per-issue ignores using `data-a11y-ignore`;
- the old listening mode and previous/next keyboard shortcuts;
- localized axe rule descriptions and Xerte checker controls (the initial
  checker UI is English);
- Quail's checks for suspicious link wording, `javascript:` links, adjacent
  duplicate links, alt-text length, blockquotes used for indentation, and some
  visual-list heuristics;
- guaranteed model selection for every HTML fragment (the affected rendered
  element is still highlighted when it cannot be mapped to a model element).

The axe rules are intentionally limited to checks relevant to an editor content
fragment. Page-level checks such as document title, main landmarks, and a page
`h1` belong in published-page testing and are not run here.
