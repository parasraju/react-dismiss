# Changelog

## 0.2.1

- Implemented multiple refs: the first argument now accepts one ref or several; dismissal runs only when the interaction is outside all of them.
- Implemented the `ignore` option: clicks on ignored refs (one ref or several) never dismiss.
- Fixes 0.2.0, whose README documented these features before the code implemented them.

## 0.2.0

- New description and keywords for outside-click search (dropdown, popover, modal, click outside, useDismiss, react-hooks).
- README headings for multiple refs and the ignore option.

## 0.1.1

- Documentation and packaging release.
- Streamlined and structured README for npm with copy-paste quick start, API specification, and behavior overview.

## 0.1.0

- Initial release
- Added `useDismiss`
- Added outside interaction dismissal (`pointerdown` / `click`)
- Added Escape-key dismissal
- Added configurable `enabled`, `outside`, `escape`, `event` options
- Added TypeScript support with strict types
- Added automated tests (26 tests)
