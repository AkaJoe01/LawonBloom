import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const dangerouslyRestricted = {
  selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
  message:
    "dangerouslySetInnerHTML is restricted to sanitized blog output in components/blog/PostBody.tsx",
};

const legacyFontClasses = {
  selector:
    'JSXAttribute[name.name="className"][value.value=/\\bfont-(display|display-hero|h1-editorial|h2-subheading|body-large|label-caps)\\b/]',
  message:
    "Legacy unlayered font classes are banned in blog components; use the blog typography scale",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
  ]),
  {
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": ["error", dangerouslyRestricted],
    },
  },
  {
    files: ["components/blog/**/*.tsx", "app/(site)/blog/**/*.tsx"],
    rules: {
      "no-restricted-syntax": ["error", dangerouslyRestricted, legacyFontClasses],
    },
  },
  {
    files: ["components/blog/PostBody.tsx", "components/seo/**/*.tsx"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    files: ["app/(site)/clinical-excellence/page.tsx", "app/(site)/path/page.tsx"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/seo/index", "**/seo/index.*"],
              message:
                "lib/seo.ts shadows the lib/seo/ directory; lib/seo/index.ts would be unreachable dead code. Import from the barrel (@/lib/seo) or a subpath (lib/seo/site etc.). See the resolution-rule header in lib/seo.ts.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
