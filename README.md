# Letters site (posts + comments)
**Notun post:** `posts/postN.json` banao (N = porer number). Fields: date, place, body[], sign, image (optional: `assets/x.jpg` ba online URL), title (optional, share card-er jonno).
**Build:** `node build.js` (posts/index.json ar p/*.html banay). GitHub Actions push-e eta auto kore.
**Local test:** `node build.js && python3 -m http.server`
**Setup:**
1. `site.json`-e `siteUrl` thik koro (https://mdhujaifatowhid.github.io/REPO-NAME)
2. `assets/card.png` (1200x630) rakho, photo chhara post-er default share card
3. Supabase-e `supabase.sql` run kore `script.js`-e URL ar anon key boshao
4. GitHub repo > Settings > Pages > Source = "GitHub Actions"
5. Share card test: Facebook Sharing Debugger, Twitter/X card validator
