# Scaffold origin

This project was generated from **vistral_supply** using:

```bash
node ../vistral_supply/scripts/scaffold-vistral-product.mjs \
  --dest "../PDP_lifecycle" \
  --slug pdp-lifecycle \
  --title "PDP Lifecycle" \
  --port 3005 \
  --overlay greenfield \
  --force
```

Re-run from Supply only if you need to refresh copied rules/skills/packages. The greenfield overlay in `vistral_supply/scripts/scaffold/overlays/greenfield/` holds app-specific files (home, login, i18n, docs).
