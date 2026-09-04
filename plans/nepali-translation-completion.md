# Implementation Plan: Complete Nepali Translation

## Context
The goal is to ensure the entire "Smart Service Flow" web application is fully translated into Nepali. While the `i18n` infrastructure and many translations exist in `client/src/i18n/ne/common.json`, we need to verify all components and pages are fully using the `t()` function from `react-i18next` and that no hardcoded English strings remain.

## Recommended Approach
1. **Systematic Audit**: Iterate through all files in `client/src/pages/` and `client/src/layouts/` to ensure all UI text is wrapped in `t('namespace.key')`.
2. **Key Verification**: Compare implemented translations against hardcoded English strings in components.
3. **Consistency Check**: Ensure `LanguageSwitcher.tsx` works correctly and persists language choice across pages.
4. **Validation**: Test the language switching in the browser to ensure the UI updates dynamically and all text components respond correctly.

## Critical Files to Modify
- `client/src/i18n/ne/common.json` (Add missing translations)
- `client/src/i18n/en/common.json` (Ensure keys match if adding new ones)
- Various files in `client/src/pages/` and `client/src/layouts/` (Wrap hardcoded strings)

## Verification
- **Functional Check**: Switch between English and Nepali in the header.
- **Visual Audit**: Verify that all pages, modals, and components update correctly without missing translations (i.e., no unexpected "undefined" or remaining English text).
- **Edge Case Check**: Check error messages and validation text (currently in `auth.validation` namespace).
