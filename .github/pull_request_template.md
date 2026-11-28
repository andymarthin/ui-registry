## Summary

```text
<changed-directory>/
├── <file-a>   # <responsibility>
└── <file-b>   # <responsibility>
```

- **Obsidian Spec:** `Projects/ui-template-team/specs/<slug>.md`

## Evidence

- **Before:** <baseline state, missing capability, or failing check>
- **After:**
  - `pnpm check`: `<0 errors, N files>`
  - `pnpm test`: `<passed/total tests across N suites>`
  - `pnpm build`: `<built pages and /r/<slug>.md + /r/<slug>.design.md verification>`

## Merge Danger

**Door:** two-way

<1 sentence on reversibility or compatibility.>

**Blast Radius:** <Additive | Scoped | Low | High>

<1 sentence on affected templates, Hub UI, or endpoints.>

## Verification Checklist

- [ ] `pnpm check` passes with 0 errors
- [ ] `pnpm test` passes with 0 failures or skipped tests
- [ ] `pnpm build` emits clean `/r/<slug>.md` (excluding `Preview.tsx` & `meta.ts`) and `/r/<slug>.design.md`
- [ ] Deliverable `.ts`/`.tsx` files use allowed imports only (`react`, `lucide-react`, or in-template relative paths) and `data-inspect-label`
- [ ] `meta.design` (`TemplateDesignSchema`) passes `validateDesignSchema` with `swatchBg`/`swatchAccent` parity
