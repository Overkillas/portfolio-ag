#!/usr/bin/env bash
#
# Quality Gates Runner — Internacionalização (i18n)
#
# Usage:
#   ./scripts/check-quality-gates.sh [gate-number]
#   ./scripts/check-quality-gates.sh all
#
# Gates:
#   0 - Pre-implementation baseline
#   1 - Infrastructure (Tasks 1-4)
#   2 - Route structure (Task 5)
#   3 - Component migration (Tasks 6-13)
#   4 - Page migration (Task 14)
#   5 - Runtime verification (Task 16)
#   6 - Final pre-merge
#   7 - Projects page (static checks + runtime checks, which SKIP without a server on :3000)
#   8 - Home texts, animations and hovers (static + runtime; runtime SKIPs without a server; browser checks in the e2e.mjs)
#
# Exit code: 0 = PASS, 1 = FAIL
#
# Known Issue: pnpm minimumReleaseAge policy
# ------------------------------------------
# If builds fail with "minimumReleaseAge cutoff" errors, this is an
# environment policy, not a code issue. Fix by running:
#
#   echo "minimum-release-age=0" >> .npmrc
#   # or
#   pnpm config set minimum-release-age 0
#
# The script detects this and marks affected checks as SKIP.

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
SKIP=0

log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_pass() { echo -e "${GREEN}✓${NC} $1"; PASS=$((PASS + 1)); }
log_fail() { echo -e "${RED}✗${NC} $1"; FAIL=$((FAIL + 1)); }
log_skip() { echo -e "${YELLOW}⊘${NC} $1"; SKIP=$((SKIP + 1)); }
log_gate() { echo -e "\n${BLUE}━━━ Gate $1: $2 ━━━${NC}"; }
log_sub() { echo -e "${BLUE}  ▸ $1${NC}"; }

# ============================================================
# GATE 0: Pre-Implementation Baseline
# ============================================================
gate_0() {
  log_gate "0" "Pre-Implementation Baseline"

  # Check for pnpm minimumReleaseAge issue first
  log_sub "Checking for pnpm minimumReleaseAge policy..."
  pnpm build > /tmp/gate0-probe.log 2>&1 || true
  if grep -q "minimumReleaseAge" /tmp/gate0-probe.log 2>/dev/null; then
    log_skip "pnpm minimumReleaseAge policy active (environment issue)"
    log_info "Fix: echo 'minimum-release-age=0' >> .npmrc"
    PKG_POLICY_BLOCKED=true
  else
    PKG_POLICY_BLOCKED=false
  fi

  log_sub "Checking clean working tree..."
  if [ -z "$(git status --porcelain)" ]; then
    log_pass "Working tree is clean"
  else
    # Allow untracked docs/scripts for quality gates infrastructure
    UNTRACKED=$(git status --porcelain | grep "^??" | grep -E "docs/superpowers/(plans|quality-gates)|scripts/check-quality-gates" || true)
    TRACKED_CHANGES=$(git status --porcelain | grep -v "^??" || true)
    NEW_FILES=$(git status --porcelain | grep "^??" | grep -vE "docs/superpowers/(plans|quality-gates)|scripts/check-quality-gates" || true)

    if [ -z "$TRACKED_CHANGES" ] && [ -z "$NEW_FILES" ]; then
      log_pass "Working tree has only quality-gate infrastructure files (untracked)"
    else
      log_fail "Working tree has uncommitted changes"
      git status --porcelain
    fi
  fi

  log_sub "Running build..."
  if pnpm build > /tmp/gate0-build.log 2>&1; then
    log_pass "Build passes (exit 0)"
    ROUTES=$(grep -cE "^[├└○●]" /tmp/gate0-build.log || true)
    log_info "Routes generated: $ROUTES"
  else
    # Check if failure is due to pnpm minimumReleaseAge policy
    if grep -q "minimumReleaseAge" /tmp/gate0-build.log; then
      log_skip "Build blocked by pnpm minimumReleaseAge policy (environment issue, not code)"
      log_info "Fix: run 'pnpm config set minimumReleaseAge 0' or add to .npmrc"
    else
      log_fail "Build failed"
      tail -20 /tmp/gate0-build.log
    fi
  fi

  log_sub "Running lint..."
  if pnpm lint > /tmp/gate0-lint.log 2>&1; then
    log_pass "Lint passes (exit 0)"
  else
    if grep -q "minimumReleaseAge" /tmp/gate0-lint.log; then
      log_skip "Lint blocked by pnpm minimumReleaseAge policy (environment issue)"
    else
      log_fail "Lint failed"
      tail -20 /tmp/gate0-lint.log
    fi
  fi

  log_sub "Starting dev server..."
  pnpm dev > /tmp/gate0-dev.log 2>&1 &
  DEV_PID=$!
  sleep 10
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
  kill $DEV_PID 2>/dev/null || true
  wait $DEV_PID 2>/dev/null || true

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ]; then
    log_pass "Dev server responds (HTTP $HTTP_CODE)"
  else
    if grep -q "minimumReleaseAge" /tmp/gate0-dev.log 2>/dev/null; then
      log_skip "Dev server blocked by pnpm minimumReleaseAge policy"
    else
      log_fail "Dev server not responding (HTTP $HTTP_CODE)"
    fi
  fi
}

# ============================================================
# GATE 1: Infrastructure (Tasks 1-4)
# ============================================================
gate_1() {
  log_gate "1" "Infrastructure (Tasks 1-4)"

  log_sub "TypeScript check..."
  if pnpm exec tsc --noEmit > /tmp/gate1-tsc.log 2>&1; then
    log_pass "TypeScript: no errors"
  elif grep -q "minimumReleaseAge" /tmp/gate1-tsc.log 2>/dev/null; then
    log_skip "TypeScript blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "TypeScript errors found"
    head -20 /tmp/gate1-tsc.log
  fi

  log_sub "Type-safety negative test (en.json missing keys should fail build)..."
  cp dictionaries/en.json /tmp/en.json.backup 2>/dev/null || true
  echo '{"site": {}}' > dictionaries/en.json
  # build é ESPERADO falhar aqui — sem `||`, o set -e mata o script
  BUILD_EXIT=0
  pnpm build > /tmp/gate1-neg.log 2>&1 || BUILD_EXIT=$?
  cp /tmp/en.json.backup dictionaries/en.json 2>/dev/null || true

  if [ $BUILD_EXIT -ne 0 ]; then
    if grep -q "minimumReleaseAge" /tmp/gate1-neg.log; then
      log_skip "Negative test skipped (pnpm policy blocked build)"
    elif grep -qiE "error|Property .* is missing|not assignable" /tmp/gate1-neg.log; then
      log_pass "Type-safety enforced (build fails with incomplete en.json)"
    else
      log_fail "Build failed but no TypeScript error found"
      tail -10 /tmp/gate1-neg.log
    fi
  else
    log_fail "Type-safety NOT enforced (build passed with incomplete en.json)"
  fi

  log_sub "JSON validity..."
  if node -e "JSON.parse(require('fs').readFileSync('dictionaries/pt-BR.json')); JSON.parse(require('fs').readFileSync('dictionaries/en.json')); console.log('ok')" 2>/dev/null; then
    log_pass "Both dictionary JSON files are valid"
  else
    log_fail "Invalid JSON in dictionaries"
  fi

  log_sub "Required exports in i18n/dictionaries.ts..."
  local exports_ok=true
  for export in "getDictionary" "isLocale" "Dictionary"; do
    if grep -q "export.*$export" i18n/dictionaries.ts 2>/dev/null; then
      log_pass "  exports $export"
    else
      log_fail "  missing export: $export"
      exports_ok=false
    fi
  done

  log_sub "Required files exist..."
  for file in "i18n/config.ts" "i18n/dictionaries.ts" "dictionaries/pt-BR.json" "dictionaries/en.json" "lib/i18n/provider.tsx" "lib/i18n/use-translation.ts" "proxy.ts" "components/layout/LanguageSwitcher.tsx"; do
    if [ -f "$file" ]; then
      log_pass "  $file exists"
    else
      log_fail "  $file missing"
    fi
  done

  log_sub "Dictionary structure check..."
  node -e "
const pt = require('./dictionaries/pt-BR.json');
const required = ['site', 'nav', 'home', 'contact', 'categories', 'projects', 'status', 'footer', 'metadata'];
const missing = required.filter(k => !pt[k]);
if (missing.length) {
  console.error('Missing top-level keys:', missing.join(', '));
  process.exit(1);
}
console.log('ok');
" 2>/dev/null && log_pass "pt-BR.json has all required top-level keys" || log_fail "pt-BR.json missing required keys"
}

# ============================================================
# GATE 2: Route Structure (Task 5)
# ============================================================
gate_2() {
  log_gate "2" "Route Structure (Task 5)"

  log_sub "app/[lang]/ structure..."
  # favicon.ico lives at app/ root — Next serves it at /favicon.ico, never from inside [lang]
  for dir in "app/[lang]/layout.tsx" "app/[lang]/page.tsx" "app/[lang]/globals.css" "app/favicon.ico" "app/[lang]/contato" "app/[lang]/grafico" "app/[lang]/interacao" "app/[lang]/servicos" "app/[lang]/3d" "app/[lang]/projetos"; do
    if [ -e "$dir" ]; then
      log_pass "  $dir exists"
    else
      log_fail "  $dir missing"
    fi
  done

  log_sub "No stray files at app/ root..."
  # favicon.ico legitimately lives at app/ root (served at /favicon.ico) — excluded here like in the find below
  STRAY=$(find app -maxdepth 1 -type f ! -name "*.tsx" ! -name "*.ts" ! -name "*.css" ! -name "*.ico" 2>/dev/null | grep -v "\[lang\]" || true)
  STRAY_FILES=$(ls app/*.tsx app/*.css 2>/dev/null | grep -v "\[lang\]" || true)
  if [ -z "$STRAY_FILES" ]; then
    log_pass "No stray page/layout files at app/ root"
  else
    log_fail "Stray files at app/ root: $STRAY_FILES"
  fi

  log_sub "Build and count routes..."
  BUILD_EXIT=0
  pnpm build > /tmp/gate2-build.log 2>&1 || BUILD_EXIT=$?
  if [ $BUILD_EXIT -eq 0 ]; then
    log_pass "Build passes"
    LOCALE_ROUTES=$(grep -cE "[├└] /(pt-BR|en)" /tmp/gate2-build.log || true)
    log_info "Locale-prefixed routes: $LOCALE_ROUTES (expected: 18)"
    if [ "$LOCALE_ROUTES" -ge 18 ]; then
      log_pass "Route count >= 18"
    else
      log_fail "Route count < 18 (got $LOCALE_ROUTES)"
    fi
  elif grep -q "minimumReleaseAge" /tmp/gate2-build.log; then
    log_skip "Build blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "Build failed"
    tail -20 /tmp/gate2-build.log
  fi

  log_sub "Root layout exports..."
  for fn in "generateStaticParams" "generateMetadata" "notFound" "isLocale" "I18nProvider"; do
    if grep -q "$fn" "app/[lang]/layout.tsx" 2>/dev/null; then
      log_pass "  layout has $fn"
    else
      log_fail "  layout missing $fn"
    fi
  done
}

# ============================================================
# GATE 3: Component Migration (Tasks 6-13)
# ============================================================
gate_3() {
  log_gate "3" "Component Migration (Tasks 6-13)"

  log_sub "Search for hardcoded Portuguese strings..."
  # Ignora linhas de COMENTÁRIO em tsx — strings em comentários não renderizam.
  HARDCODED=$(grep -rE '"(Sobre mim|Solicitar serviços|Gráfico|Interação|Serviços|Vamos trabalhar|Enviar solicitação|Obrigada por ter|Concluído|Em progresso|Em breve|Ver mais\.|Redes sociais|Processo de criação|Prototipagem|Projeto final)"' \
    components/ "app/[lang]/" --include="*.tsx" --include="*.ts" 2>/dev/null \
    | grep -vE '^\S+:\s*//|/\*|\*/|\{/\*' || true)

  if [ -z "$HARDCODED" ]; then
    log_pass "No hardcoded Portuguese strings found"
  else
    log_fail "Hardcoded strings found:"
    echo "$HARDCODED" | head -10
  fi

  log_sub "Components use translations..."
  for comp in "components/layout/Header.tsx" "components/layout/Footer.tsx" "components/contact/ContactForm.tsx" "components/home/CategoryPage.tsx" "components/home/ProjectCard.tsx" "components/case-study/CaseShell.tsx"; do
    if grep -qE "dict|useTranslations|Dictionary" "$comp" 2>/dev/null; then
      log_pass "  $comp uses translations"
    else
      log_fail "  $comp doesn't reference translations"
    fi
  done

  log_sub "content/projects.ts deleted..."
  if git status content/projects.ts 2>/dev/null | grep -q "deleted"; then
    log_pass "content/projects.ts is deleted"
  elif [ ! -f "content/projects.ts" ]; then
    log_pass "content/projects.ts does not exist"
  else
    log_fail "content/projects.ts still exists"
  fi

  log_sub "lib/projects.ts exports..."
  for export in "getLocalizedProject" "getLocalizedProjectsByCategory" "LocalizedProject" "ProjectMeta"; do
    if grep -q "$export" lib/projects.ts 2>/dev/null; then
      log_pass "  exports $export"
    else
      log_fail "  missing export: $export"
    fi
  done

  log_sub "Build passes..."
  BUILD_EXIT=0
  pnpm build > /tmp/gate3-build.log 2>&1 || BUILD_EXIT=$?
  if [ $BUILD_EXIT -eq 0 ]; then
    log_pass "Build passes"
  elif grep -q "minimumReleaseAge" /tmp/gate3-build.log; then
    log_skip "Build blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "Build failed"
    tail -20 /tmp/gate3-build.log
  fi

  log_sub "Lint passes..."
  LINT_EXIT=0
  pnpm lint > /tmp/gate3-lint.log 2>&1 || LINT_EXIT=$?
  if [ $LINT_EXIT -eq 0 ]; then
    log_pass "Lint passes"
  elif grep -q "minimumReleaseAge" /tmp/gate3-lint.log; then
    log_skip "Lint blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "Lint failed"
    tail -20 /tmp/gate3-lint.log
  fi
}

# ============================================================
# GATE 4: Page Migration (Task 14)
# ============================================================
gate_4() {
  log_gate "4" "Page Migration (Task 14)"

  log_sub "Checking all pages have locale handling..."
  PAGES=(
    "app/[lang]/page.tsx"
    "app/[lang]/contato/page.tsx"
    "app/[lang]/grafico/page.tsx"
    "app/[lang]/interacao/page.tsx"
    "app/[lang]/servicos/page.tsx"
    "app/[lang]/3d/page.tsx"
    "app/[lang]/projetos/pontos-sem-no/page.tsx"
    "app/[lang]/projetos/batuco-tuco/page.tsx"
    "app/[lang]/projetos/pontinhas-soltas/page.tsx"
    "app/[lang]/carreira/page.tsx"
  )

  for page in "${PAGES[@]}"; do
    if [ ! -f "$page" ]; then
      log_fail "$page missing"
      continue
    fi

    local issues=0
    grep -q "params: Promise<{ lang: string }>" "$page" || { log_fail "  $page: missing params type"; issues=$((issues + 1)); }
    grep -q "await params" "$page" || { log_fail "  $page: doesn't await params"; issues=$((issues + 1)); }
    grep -q "isLocale" "$page" || { log_fail "  $page: missing isLocale check"; issues=$((issues + 1)); }
    grep -q "notFound" "$page" || { log_fail "  $page: missing notFound guard"; issues=$((issues + 1)); }
    grep -q "getDictionary" "$page" || { log_fail "  $page: missing getDictionary"; issues=$((issues + 1)); }

    if [ $issues -eq 0 ]; then
      log_pass "$page has all locale handling"
    fi
  done

  log_sub "generateMetadata in non-home pages..."
  METADATA_PAGES=(
    "app/[lang]/contato/page.tsx"
    "app/[lang]/grafico/page.tsx"
    "app/[lang]/interacao/page.tsx"
    "app/[lang]/servicos/page.tsx"
    "app/[lang]/3d/page.tsx"
    "app/[lang]/projetos/pontos-sem-no/page.tsx"
    "app/[lang]/projetos/batuco-tuco/page.tsx"
    "app/[lang]/projetos/pontinhas-soltas/page.tsx"
    "app/[lang]/carreira/page.tsx"
  )

  for page in "${METADATA_PAGES[@]}"; do
    if grep -q "generateMetadata" "$page" 2>/dev/null; then
      log_pass "  $(basename $(dirname $page))/page.tsx has generateMetadata"
    else
      log_fail "  $page missing generateMetadata"
    fi
  done

  log_sub "TypeScript check..."
  pnpm exec tsc --noEmit > /tmp/gate4-tsc.log 2>&1
  if [ $? -eq 0 ]; then
    log_pass "TypeScript: no errors"
  elif grep -q "minimumReleaseAge" /tmp/gate4-tsc.log 2>/dev/null; then
    log_skip "TypeScript blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "TypeScript errors"
    head -20 /tmp/gate4-tsc.log
  fi

  log_sub "Build passes..."
  BUILD_EXIT=0
  pnpm build > /tmp/gate4-build.log 2>&1 || BUILD_EXIT=$?
  if [ $BUILD_EXIT -eq 0 ]; then
    log_pass "Build passes"
    ROUTES=$(grep -cE "[├└] /(pt-BR|en)" /tmp/gate4-build.log || true)
    log_info "Routes: $ROUTES"
    [ "$ROUTES" -ge 18 ] && log_pass "18+ routes generated" || log_fail "Less than 18 routes"
  elif grep -q "minimumReleaseAge" /tmp/gate4-build.log; then
    log_skip "Build blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "Build failed"
    tail -20 /tmp/gate4-build.log
  fi
}

# ============================================================
# GATE 5: Runtime Verification (Task 16)
# ============================================================
gate_5() {
  log_gate "5" "Runtime Verification (Task 16)"
  log_info "Starting dev server for runtime tests..."

  pnpm dev > /tmp/gate5-dev.log 2>&1 &
  DEV_PID=$!
  sleep 10

  # Wait for server to be ready
  for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  # Asserções duras: redirect inesperado (ou 200 direto) aqui é FALHA — são a
  # única cobertura do requisito central de detecção (cookie > Accept-Language
  # > default). log_info silencioso permitiria erro passar como PASS.
  log_sub "Test: / redirects to /pt-BR/ (no cookie)..."
  REDIRECT=$(curl -s --max-time 15 -o /dev/null -w "%{redirect_url}" http://localhost:3000/)
  REDIRECT_CODE=$(curl -s --max-time 15 -o /dev/null -w "%{http_code}" http://localhost:3000/)
  if [[ "$REDIRECT_CODE" == "307" ]] && [[ "$REDIRECT" == *"/pt-BR" ]]; then
    log_pass "Redirects to /pt-BR/"
  else
    log_fail "/ → HTTP $REDIRECT_CODE redirect $REDIRECT (expected 307 → /pt-BR)"
  fi

  log_sub "Test: / redirects to /en/ (Accept-Language: en)..."
  REDIRECT_EN=$(curl -s --max-time 15 -o /dev/null -w "%{redirect_url}" -H "Accept-Language: en-US,en;q=0.9" http://localhost:3000/)
  if [[ "$REDIRECT_EN" == *"/en" ]]; then
    log_pass "Redirects to /en/"
  else
    log_fail "Accept-Language → $REDIRECT_EN (expected → /en)"
  fi

  log_sub "Test: / with cookie NEXT_LOCALE=en..."
  REDIRECT_COOKIE=$(curl -s --max-time 15 -o /dev/null -w "%{redirect_url}" -H "Cookie: NEXT_LOCALE=en" http://localhost:3000/)
  if [[ "$REDIRECT_COOKIE" == *"/en" ]]; then
    log_pass "Cookie preference respected"
  else
    log_fail "Cookie en → $REDIRECT_COOKIE (expected → /en)"
  fi

  log_sub "Test: favicon served at root..."
  FAVICON=$(curl -s --max-time 15 -o /dev/null -w "%{http_code}" http://localhost:3000/favicon.ico)
  if [ "$FAVICON" = "200" ]; then
    log_pass "favicon.ico served (200)"
  else
    log_fail "/favicon.ico → HTTP $FAVICON (expected 200)"
  fi

  log_sub "Test: direct locale access returns 200..."
  # Sem trailing slash: o Next normaliza "/pt-BR/" → 308 → "/pt-BR" e o teste
  # mediria o redirect, não a rota.
  FAILED_ROUTES=0
  for locale in pt-BR en; do
    for path in "" "contato" "grafico" "interacao" "servicos" "3d" "projetos/pontos-sem-no" "projetos/batuco-tuco" "projetos/pontinhas-soltas" "carreira"; do
      STATUS=$(curl -s --max-time 15 -o /dev/null -w "%{http_code}" "http://localhost:3000/$locale${path:+/$path}")
      if [ "$STATUS" != "200" ]; then
        log_fail "/$locale/$path → HTTP $STATUS (expected 200)"
        FAILED_ROUTES=$((FAILED_ROUTES + 1))
      fi
    done
  done
  if [ "$FAILED_ROUTES" -eq 0 ]; then
    log_pass "All 18 routes return 200"
  else
    log_fail "$FAILED_ROUTES of 18 routes did not return 200"
  fi

  log_sub "Test: invalid locale returns 404..."
  STATUS=$(curl -s --max-time 15 -o /dev/null -w "%{http_code}" "http://localhost:3000/fr/contato")
  if [ "$STATUS" = "404" ]; then
    log_pass "Invalid locale returns 404"
  else
    log_fail "Invalid locale returns $STATUS (expected 404)"
  fi

  log_sub "Test: HTML lang attribute..."
  # || true: sob set -e, atribuição com substituição de comando falhando (grep
  # sem match) abortaria o runner no lugar de reportar a falha.
  LANG_PT=$(curl -s --max-time 15 "http://localhost:3000/pt-BR" | grep -o '<html[^>]*lang="[^"]*"' | grep -o 'lang="[^"]*"') || true
  LANG_EN=$(curl -s --max-time 15 "http://localhost:3000/en" | grep -o '<html[^>]*lang="[^"]*"' | grep -o 'lang="[^"]*"') || true
  [ "$LANG_PT" = 'lang="pt-BR"' ] && log_pass "pt-BR page has lang=\"pt-BR\"" || log_fail "pt-BR lang: $LANG_PT"
  [ "$LANG_EN" = 'lang="en"' ] && log_pass "en page has lang=\"en\"" || log_fail "en lang: $LANG_EN"

  log_sub "Test: hreflang alternates present..."
  # -i: Next/React sério renderiza o atributo como hrefLang (mesmo atributo
  # hreflang no HTML — parsing é case-insensitive).
  HREFLANG=$(curl -s --max-time 15 "http://localhost:3000/pt-BR" | grep -io 'hreflang="[^"]*"' | sort -u | tr '\n' ' ') || true
  if [[ "$HREFLANG" == *"pt-BR"* ]] && [[ "$HREFLANG" == *"en"* ]]; then
    log_pass "hreflang alternates: $HREFLANG"
  else
    log_fail "hreflang missing or incomplete: $HREFLANG"
  fi

  log_sub "Test: hreflang hrefs are absolute..."
  # Google exige full-qualified URL; href relativo significa metadataBase
  # ausente (SITE_URL não configurado).
  HREFABS=$(curl -s --max-time 15 "http://localhost:3000/pt-BR" | grep -io '<link rel="alternate" hreflang="[^"]*" href="[^"]*"' | grep -ic 'href="http') || true
  if [ "${HREFABS:-0}" -ge 2 ]; then
    log_pass "hreflang hrefs are absolute URLs"
  else
    log_fail "hreflang hrefs not absolute (found $HREFABS absolute): check metadataBase/SITE_URL"
  fi

  log_sub "Test: no raw dictionary keys in HTML..."
  RAW_KEYS=$(curl -s --max-time 15 "http://localhost:3000/en" | grep -oE '(home|nav|contact|projects|status|footer|metadata)\.[a-zA-Z]+' | head -5 || true)
  if [ -z "$RAW_KEYS" ]; then
    log_pass "No raw dictionary keys visible"
  else
    log_fail "Raw dictionary keys found: $RAW_KEYS"
  fi

  log_sub "Test: translated content present..."
  EN_TEXT=$(curl -s --max-time 15 "http://localhost:3000/en" | grep -ciE "hello|about|experience" || true)
  PT_TEXT=$(curl -s --max-time 15 "http://localhost:3000/pt-BR" | grep -ciE "olá|sobre|experiência" || true)
  [ "$EN_TEXT" -gt 0 ] && log_pass "English content found on /en/" || log_fail "No English content on /en/"
  [ "$PT_TEXT" -gt 0 ] && log_pass "Portuguese content found on /pt-BR/" || log_fail "No Portuguese content on /pt-BR/"

  kill $DEV_PID 2>/dev/null || true
  wait $DEV_PID 2>/dev/null || true
}

# ============================================================
# GATE 6: Final Pre-Merge
# ============================================================
gate_6() {
  log_gate "6" "Final Pre-Merge"

  log_sub "Clean build from scratch..."
  rm -rf .next
  BUILD_EXIT=0
  pnpm build > /tmp/gate6-build.log 2>&1 || BUILD_EXIT=$?
  if [ $BUILD_EXIT -eq 0 ]; then
    log_pass "Clean build passes"
    ROUTES=$(grep -cE "[├└] /(pt-BR|en)" /tmp/gate6-build.log || true)
    log_info "Routes: $ROUTES"
    [ "$ROUTES" -ge 18 ] && log_pass "18+ routes" || log_fail "Route count issue"
  elif grep -q "minimumReleaseAge" /tmp/gate6-build.log; then
    log_skip "Build blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "Clean build failed"
    tail -20 /tmp/gate6-build.log
  fi

  log_sub "Lint..."
  LINT_EXIT=0
  pnpm lint > /tmp/gate6-lint.log 2>&1 || LINT_EXIT=$?
  if [ $LINT_EXIT -eq 0 ]; then
    log_pass "Lint passes"
  elif grep -q "minimumReleaseAge" /tmp/gate6-lint.log; then
    log_skip "Lint blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "Lint failed"
    tail -20 /tmp/gate6-lint.log
  fi

  log_sub "TypeScript..."
  TSC_EXIT=0
  pnpm exec tsc --noEmit > /tmp/gate6-tsc.log 2>&1 || TSC_EXIT=$?
  if [ $TSC_EXIT -eq 0 ]; then
    log_pass "TypeScript: no errors"
  elif grep -q "minimumReleaseAge" /tmp/gate6-tsc.log 2>/dev/null; then
    log_skip "TypeScript blocked by pnpm minimumReleaseAge policy"
  else
    log_fail "TypeScript errors"
    head -20 /tmp/gate6-tsc.log
  fi

  log_sub "Secrets check..."
  SECRETS=$(grep -riE "(api[_-]?key|secret|password|token)" dictionaries/ i18n/ proxy.ts 2>/dev/null | grep -v "NEXT_PUBLIC" || true)
  if [ -z "$SECRETS" ]; then
    log_pass "No secrets in dictionaries/i18n/proxy"
  else
    log_fail "Potential secrets found:"
    echo "$SECRETS" | head -5
  fi

  log_sub "Debug logs check..."
  DEBUG_LOGS=$(git diff main...HEAD -- '*.ts' '*.tsx' 2>/dev/null | grep "^+" | grep -E "console\.(log|debug|info)" || true)
  if [ -z "$DEBUG_LOGS" ]; then
    log_pass "No debug logs added"
  else
    log_fail "Debug logs found:"
    echo "$DEBUG_LOGS" | head -5
  fi

  log_sub "Dangerous HTML check..."
  DANGEROUS=$(grep -rE "dangerouslySetInnerHTML" components/ app/ 2>/dev/null || true)
  if [ -z "$DANGEROUS" ]; then
    log_pass "No dangerouslySetInnerHTML usage"
  else
    log_fail "dangerouslySetInnerHTML found"
  fi

  log_sub "Dictionary key parity..."
  node -e "
const pt = require('./dictionaries/pt-BR.json');
const en = require('./dictionaries/en.json');
function getKeys(obj, prefix='') {
  return Object.entries(obj).flatMap(([k,v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? getKeys(v, prefix + k + '.')
      : [prefix + k]
  );
}
const ptKeys = getKeys(pt).sort();
const enKeys = getKeys(en).sort();
const missing = ptKeys.filter(k => !enKeys.includes(k));
const extra = enKeys.filter(k => !ptKeys.includes(k));
if (missing.length) { console.error('Missing in en:', missing.slice(0,10).join(', ')); process.exit(1); }
if (extra.length) { console.error('Extra in en:', extra.slice(0,10).join(', ')); process.exit(1); }
console.log('Parity OK: ' + ptKeys.length + ' keys');
" 2>/dev/null && log_pass "Dictionary keys match (pt-BR ↔ en)" || log_fail "Dictionary key mismatch"

  log_sub "Commit history..."
  COMMITS=$(git log --oneline main..HEAD 2>/dev/null | wc -l || echo "0")
  log_info "Commits since main: $COMMITS"
  if [ "$COMMITS" -ge 5 ]; then
    log_pass "Reasonable commit count"
  else
    log_fail "Too few commits (expected atomic commits per task)"
  fi
}

# ============================================================
# GATE 7: Projects page (/[lang]/projetos + case modal)
# ============================================================
gate_7() {
  log_gate "7" "Projects page (/[lang]/projetos + case modal)"

  # Cases de página completa = slugs com `opensAsPage: true` em lib/projects.ts.
  FULL_PAGE_CASES=$(awk "/slug: '/ { match(\$0, /slug: '[^']+'/); s = substr(\$0, RSTART + 7, RLENGTH - 8) } /opensAsPage: true/ && s { print s; s = \"\" }" lib/projects.ts)
  if [ -z "$FULL_PAGE_CASES" ]; then
    log_fail "No opensAsPage project found in lib/projects.ts (expected batuco-tuco, pontinhas-soltas)"
  fi

  # ----------------------------------------------------------
  # Static checks (no server needed)
  # ----------------------------------------------------------
  log_sub "UI image assets in public/images/projetos/..."
  for asset in "mascote.png" "icones/coelho.png" "icones/servicos.png" "icones/3d.png" "icones/interacao.png" "icones/grafico.png"; do
    if [ -f "public/images/projetos/$asset" ]; then
      log_pass "  $asset exists"
    else
      log_fail "  public/images/projetos/$asset missing"
    fi
  done

  log_sub "No design-example assets in public/..."
  # git ls-files pega o que está versionado; find pega também o que ficou só no disco.
  EXAMPLE_RE='peixes|coelhinhos|jardim|cidade-3d|portfolio-banner|footer-bg|nav-about|nav-projects'
  EXAMPLE_ASSETS=$( (git ls-files public; find public) 2>/dev/null | grep -E "$EXAMPLE_RE" || true)
  if [ -z "$EXAMPLE_ASSETS" ]; then
    log_pass "No example assets from the design in public/"
  else
    log_fail "Example assets from the design found in public/:"
    echo "$EXAMPLE_ASSETS" | sort -u | head -10
  fi

  log_sub "No hardcoded visible strings from the design in components/ and app/..."
  # Só casa a frase logo após uma aspa/crase/'>' (texto literal em JSX ou string),
  # tolerando espaços entre o ancorador e a frase (`> Olha que legal`); nomes de
  # chave do dicionário e comentários sem aspa não entram. Quebra de linha entre
  # o ancorador e a frase não é coberta (grep casa linha a linha).
  HARDCODED_P=$(grep -rnIE "(['\">\`])[[:space:]]*(Olha que legal|Clica pra ver|Achei |Esse é o meu favorito|nada por aqui|Hmm…|DESTAQUE|voltar aos projetos|próximo:|Pesquise por|limpar busca|Nenhum projeto|voltar ao topo|Look how cool|Click to see|FEATURED|back to projects)" components app || true)
  if [ -z "$HARDCODED_P" ]; then
    log_pass "No hardcoded design strings in components/ or app/"
  else
    log_fail "Hardcoded design strings found:"
    echo "$HARDCODED_P" | head -10
  fi

  log_sub "Dictionary keys: projectsPage parity (pt-BR ↔ en) and metadata.projetos..."
  if node -e "
const pt = require('./dictionaries/pt-BR.json');
const en = require('./dictionaries/en.json');
function leaves(obj, prefix) {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? leaves(v, prefix + k + '.')
      : [[prefix + k, v]]
  );
}
const fail = (msg) => { console.error(msg); process.exit(1); };
if (!pt.projectsPage || !en.projectsPage) fail('projectsPage missing in ' + (!pt.projectsPage ? 'pt-BR' : 'en'));
const a = new Map(leaves(pt.projectsPage, 'projectsPage.'));
const b = new Map(leaves(en.projectsPage, 'projectsPage.'));
if (a.size === 0) fail('projectsPage is empty');
const onlyPt = [...a.keys()].filter((k) => !b.has(k));
const onlyEn = [...b.keys()].filter((k) => !a.has(k));
if (onlyPt.length) fail('Only in pt-BR: ' + onlyPt.join(', '));
if (onlyEn.length) fail('Only in en: ' + onlyEn.join(', '));
const ph = (s) => (String(s).match(/\{[a-zA-Z]+\}/g) || []).sort().join(',');
for (const [k, v] of a) {
  if (typeof v !== 'string' || !v.trim()) fail('Empty value in pt-BR: ' + k);
  if (typeof b.get(k) !== 'string' || !b.get(k).trim()) fail('Empty value in en: ' + k);
  if (ph(v) !== ph(b.get(k))) fail('Placeholder mismatch: ' + k);
}
for (const [name, d] of [['pt-BR', pt], ['en', en]]) {
  if (!d.metadata || typeof d.metadata.projetos !== 'string' || !d.metadata.projetos.trim()) fail('metadata.projetos missing in ' + name);
}
console.log('ok: ' + a.size + ' keys');
"; then
    log_pass "projectsPage keys match in both dictionaries; metadata.projetos present"
  else
    log_fail "projectsPage / metadata.projetos dictionary check failed"
  fi

  log_sub "Intercepted-route folder per project (@modal/(.)<slug>)..."
  # Sem a pasta o projeto abre como página completa, sem erro; o (.)[slug] dinâmico não serve
  # (500 no next dev). Os slugs vêm de `slugToKey` em lib/projects.ts.
  MODAL_DIR="app/[lang]/projetos/@modal"
  PROJECT_SLUGS=$(sed -n '/^export const slugToKey = {/,/^} as const;/p' lib/projects.ts | sed -nE "s/^[[:space:]]*'?([a-z0-9-]+)'?:.*/\1/p" || true)
  if [ -z "$PROJECT_SLUGS" ]; then
    log_fail "Could not read project slugs from lib/projects.ts"
  else
    MODAL_OK=1
    for slug in $PROJECT_SLUGS; do
      if [ ! -f "$MODAL_DIR/(.)$slug/page.tsx" ]; then
        log_fail "  $MODAL_DIR/(.)$slug/page.tsx missing for slug '$slug'"
        MODAL_OK=0
      fi
    done
    for dir in "$MODAL_DIR"/\(.\)*; do
      [ -d "$dir" ] || continue
      folder_slug=$(basename "$dir"); folder_slug="${folder_slug#(.)}"
      if ! printf '%s\n' "$PROJECT_SLUGS" | grep -qx -- "$folder_slug"; then
        log_fail "  $dir does not match any project slug"
        MODAL_OK=0
      fi
    done
    if [ "$MODAL_OK" -eq 1 ]; then
      log_pass "Every project slug has its @modal/(.)<slug>/page.tsx and vice versa"
    fi
  fi

  log_sub "No dictionary JSON imported by a Client Component..."
  DICT_IMPORTS=""
  # while-read (e não for): os caminhos têm "[lang]", que o shell expandiria como glob.
  while IFS= read -r file; do
    [ -n "$file" ] || continue
    FOUND=$(grep -nE "from ['\"][^'\"]*dictionaries/" "$file" || true)
    if [ -n "$FOUND" ]; then
      DICT_IMPORTS="$DICT_IMPORTS$file: $FOUND"$'\n'
    fi
  done < <(grep -rlE "^['\"]use client['\"]" components app lib 2>/dev/null || true)
  if [ -z "$DICT_IMPORTS" ]; then
    log_pass "No Client Component imports from dictionaries/"
  else
    log_fail "Client Component imports from dictionaries/:"
    echo "$DICT_IMPORTS" | head -10
  fi

  # ----------------------------------------------------------
  # Runtime checks (dev or prod server on :3000) — SKIP if nothing answers
  # ----------------------------------------------------------
  log_sub "Runtime: server on :3000..."
  # Mesmo critério do gate 5, mas sem subir o servidor: este gate roda por task,
  # com `pnpm dev` (ou `pnpm build && pnpm start`) já no ar. Sem servidor, SKIP.
  # --connect-timeout curto + --max-time longo: recusa de conexão falha na hora,
  # mas um `pnpm dev` frio ainda tem tempo de compilar a primeira rota.
  if ! curl -s --connect-timeout 3 --max-time 60 -o /dev/null "http://localhost:3000/pt-BR"; then
    log_skip "Nothing answers on :3000 — start 'pnpm dev' (or 'pnpm start') and re-run for the runtime checks"
    return 0
  fi

  local BASE="http://localhost:3000"
  # || true em tudo que pode não casar: sob set -e/pipefail, um grep sem match
  # abortaria o runner no lugar de reportar a falha.
  http_code() { curl -s --max-time 60 -o /dev/null -w "%{http_code}" "$@" || true; }
  page() { curl -s --max-time 60 "$BASE$1" | tr '\n' ' ' || true; }
  # Só o primeiro <header>…</header> (os links do header não podem ser confundidos
  # com links do corpo da página).
  header_of() { printf '%s' "$1" | grep -o '<header.*' | sed 's#</header>.*#</header>#' | head -1 || true; }

  log_sub "Test: /{locale}/projetos returns 200..."
  for locale in pt-BR en; do
    STATUS=$(http_code "$BASE/$locale/projetos")
    [ "$STATUS" = "200" ] && log_pass "/$locale/projetos → 200" || log_fail "/$locale/projetos → HTTP $STATUS (expected 200)"
  done

  log_sub "Test: /projetos (no cookie) redirects to /pt-BR/projetos..."
  RCODE=$(http_code "$BASE/projetos")
  RURL=$(curl -s --max-time 60 -o /dev/null -w "%{redirect_url}" "$BASE/projetos" || true)
  if [ "$RCODE" = "307" ] && [[ "$RURL" == *"/pt-BR/projetos" ]]; then
    log_pass "/projetos → 307 → /pt-BR/projetos"
  else
    log_fail "/projetos → HTTP $RCODE redirect '$RURL' (expected 307 → /pt-BR/projetos)"
  fi

  log_sub "Test: invalid locale returns 404 on /fr/projetos..."
  STATUS=$(http_code "$BASE/fr/projetos")
  [ "$STATUS" = "404" ] && log_pass "/fr/projetos → 404" || log_fail "/fr/projetos → HTTP $STATUS (expected 404)"

  local HTML_PT HTML_EN
  HTML_PT=$(page "/pt-BR/projetos")
  HTML_EN=$(page "/en/projetos")

  log_sub "Test: <title> per locale..."
  TITLE_PT=$(printf '%s' "$HTML_PT" | grep -o '<title>[^<]*</title>' | head -1 || true)
  TITLE_EN=$(printf '%s' "$HTML_EN" | grep -o '<title>[^<]*</title>' | head -1 || true)
  [ "$TITLE_PT" = "<title>Projetos · Ágatha Sales</title>" ] && log_pass "pt-BR title: Projetos · Ágatha Sales" || log_fail "pt-BR title: '$TITLE_PT'"
  [ "$TITLE_EN" = "<title>Projects · Ágatha Sales</title>" ] && log_pass "en title: Projects · Ágatha Sales" || log_fail "en title: '$TITLE_EN'"

  log_sub "Test: hreflang pt-BR / en / x-default are absolute and end in /projetos..."
  for locale in pt-BR en; do
    HTML_VAR=$([ "$locale" = "pt-BR" ] && printf '%s' "$HTML_PT" || printf '%s' "$HTML_EN")
    for hl in pt-BR en x-default; do
      # -i: Next/React renderiza o atributo como hrefLang (parsing case-insensitive).
      HL_HREF=$(printf '%s' "$HTML_VAR" | grep -io "<link rel=\"alternate\" hreflang=\"$hl\" href=\"[^\"]*\"" | grep -o 'href="[^"]*"' | head -1 || true)
      if [[ "$HL_HREF" =~ ^href=\"https?://[^\"]+/projetos\"$ ]]; then
        log_pass "/$locale/projetos hreflang $hl → $HL_HREF"
      else
        log_fail "/$locale/projetos hreflang $hl: '$HL_HREF' (expected absolute URL ending in /projetos)"
      fi
    done
  done

  log_sub "Test: header \"projetos\" link points to /{locale}/projetos (home and index)..."
  for locale in pt-BR en; do
    for route in "" "/projetos"; do
      HDR=$(header_of "$(page "/$locale$route")")
      if printf '%s' "$HDR" | grep -q "href=\"/$locale/projetos\""; then
        log_pass "/$locale$route header links to /$locale/projetos"
      else
        log_fail "/$locale$route header has no href=\"/$locale/projetos\""
      fi
    done
  done

  log_sub "Test: header per route (HomeHeader on index, aria-current on projetos only there)..."
  HDR_IDX_PT=$(header_of "$HTML_PT")
  HDR_IDX_EN=$(header_of "$HTML_EN")
  HDR_HOME_PT=$(header_of "$(page "/pt-BR")")
  # Primeiro case que ainda abre com o header do site (não é `opensAsPage`), se houver.
  # Desde o 15 anos (2026-11-09) todos os cases são página completa; o teste do
  # CaseHeader volta a valer sozinho quando um case novo não tiver `opensAsPage`.
  NARROW_CASE=""
  for slug in $PROJECT_SLUGS; do
    if ! printf '%s\n' "$FULL_PAGE_CASES" | grep -qx -- "$slug"; then
      NARROW_CASE="$slug"
      break
    fi
  done
  HDR_CASE_PT=""
  [ -n "$NARROW_CASE" ] && HDR_CASE_PT=$(header_of "$(page "/pt-BR/projetos/$NARROW_CASE")")
  # Índice → HomeHeader ("sobre"/"about", não "Sobre mim"); aria-current só ali.
  if printf '%s' "$HDR_IDX_PT" | grep -q '>sobre<' && printf '%s' "$HDR_IDX_EN" | grep -q '>about<'; then
    log_pass "Index uses HomeHeader (sobre / about)"
  else
    log_fail "Index header is not the HomeHeader (expected '>sobre<' in pt-BR and '>about<' in en)"
  fi
  if printf '%s' "$HDR_IDX_PT" | grep -q 'aria-current="page"[^>]*href="/pt-BR/projetos"\|href="/pt-BR/projetos"[^>]*aria-current="page"' \
    && printf '%s' "$HDR_IDX_EN" | grep -q 'aria-current="page"[^>]*href="/en/projetos"\|href="/en/projetos"[^>]*aria-current="page"'; then
    log_pass "aria-current=\"page\" on the projetos link (index, both locales)"
  else
    log_fail "projetos link lacks aria-current=\"page\" on the index"
  fi
  # Home → o ativo é "sobre" (link p/ a própria home); "projetos" não é ativo.
  HDR_HOME_EN=$(header_of "$(page "/en")")
  if printf '%s' "$HDR_HOME_PT" | grep -q 'aria-current="page"[^>]*href="/pt-BR"\|href="/pt-BR"[^>]*aria-current="page"' \
    && printf '%s' "$HDR_HOME_EN" | grep -q 'aria-current="page"[^>]*href="/en"\|href="/en"[^>]*aria-current="page"'; then
    log_pass "Home header marks the sobre/about link with aria-current=\"page\""
  else
    log_fail "Home header sobre/about link lacks aria-current=\"page\""
  fi
  if printf '%s' "$HDR_HOME_PT" | grep -q 'aria-current="page"[^>]*href="/pt-BR/projetos"\|href="/pt-BR/projetos"[^>]*aria-current="page"' \
    || printf '%s' "$HDR_HOME_EN" | grep -q 'aria-current="page"[^>]*href="/en/projetos"\|href="/en/projetos"[^>]*aria-current="page"'; then
    log_fail "Home header projetos link has aria-current (only sobre should)"
  else
    log_pass "Home header projetos link has no aria-current"
  fi
  # Case aberto direto → CaseHeader do Figma: voltar (aria-label traduzido) e "projetos",
  # ambos para o índice; nada do Header antigo ("Sobre mim").
  if [ -z "$NARROW_CASE" ]; then
    log_pass "No case opens with the site header (every slug in slugToKey is opensAsPage)"
  elif printf '%s' "$HDR_CASE_PT" | grep -q 'aria-label="voltar aos projetos"' \
    && printf '%s' "$HDR_CASE_PT" | grep -q 'href="/pt-BR/projetos"' \
    && ! printf '%s' "$HDR_CASE_PT" | grep -q 'Sobre mim'; then
    log_pass "$NARROW_CASE page opened directly uses the CaseHeader (back + projetos)"
  else
    log_fail "$NARROW_CASE page opened directly does not show the CaseHeader (expected back aria-label and /pt-BR/projetos link, no 'Sobre mim')"
  fi
  # Cases de página completa (opensAsPage: todos os de slugToKey hoje) abertos direto →
  # sem header do site (o frame do Figma só tem a barra de voltar), mas com o seletor de
  # idioma na barra do próprio case (AGENTS.md: nenhuma página sem trocar de idioma).
  for slug in $FULL_PAGE_CASES; do
    FULL_HTML=$(page "/pt-BR/projetos/$slug")
    if [ -z "$(header_of "$FULL_HTML")" ]; then
      log_pass "$slug page opened directly has no site header (Figma)"
    else
      log_fail "$slug page opened directly renders a <header> (the Figma frame has none)"
    fi
    if printf '%s' "$FULL_HTML" | grep -q 'aria-label="Switch to English"\|aria-label="Mudar para English"\|aria-pressed='; then
      log_pass "$slug page renders the language switcher"
    else
      log_fail "$slug page has no language switcher (hidden header must be replaced by CaseTopBar)"
    fi
  done

  log_sub "Test: one link per project per locale (/{locale}/projetos/<slug>)..."
  for locale in pt-BR en; do
    HTML_VAR=$([ "$locale" = "pt-BR" ] && printf '%s' "$HTML_PT" || printf '%s' "$HTML_EN")
    other=$([ "$locale" = "pt-BR" ] && echo "en" || echo "pt-BR")
    for slug in $PROJECT_SLUGS; do
      if printf '%s' "$HTML_VAR" | grep -q "href=\"/$locale/projetos/$slug\""; then
        log_pass "/$locale/projetos links to /$locale/projetos/$slug"
      else
        log_fail "/$locale/projetos has no href=\"/$locale/projetos/$slug\""
      fi
      if printf '%s' "$HTML_VAR" | grep -q "href=\"/$other/projetos/$slug\""; then
        log_fail "/$locale/projetos links to the wrong locale: /$other/projetos/$slug"
      fi
    done
  done

  log_sub "Test: no raw projectsPage.* keys in the HTML..."
  RAW_P=$(printf '%s\n%s' "$HTML_PT" "$HTML_EN" | grep -o 'projectsPage\.[a-zA-Z.]*' | sort -u | head -5 || true)
  if [ -z "$RAW_P" ]; then
    log_pass "No raw projectsPage.* keys visible"
  else
    log_fail "Raw dictionary keys found: $RAW_P"
  fi

  log_sub "Test: case opened directly is the full page (200, no dialog)..."
  for slug in $FULL_PAGE_CASES; do
    for locale in pt-BR en; do
      STATUS=$(http_code "$BASE/$locale/projetos/$slug")
      CASE_HTML=$(page "/$locale/projetos/$slug")
      if [ "$STATUS" = "200" ] && ! printf '%s' "$CASE_HTML" | grep -q 'role="dialog"'; then
        log_pass "/$locale/projetos/$slug → 200, no role=\"dialog\""
      else
        log_fail "/$locale/projetos/$slug → HTTP $STATUS or contains role=\"dialog\""
      fi
    done
  done

  log_sub "Test: unknown project returns 404..."
  STATUS=$(http_code "$BASE/pt-BR/projetos/nao-existe")
  [ "$STATUS" = "404" ] && log_pass "/pt-BR/projetos/nao-existe → 404" || log_fail "/pt-BR/projetos/nao-existe → HTTP $STATUS (expected 404)"
}

# ============================================================
# GATE 8: Home — textos, animações e hovers do protótipo About
# ============================================================
gate_8() {
  log_gate "8" "Home texts, animations and hovers"

  # ----------------------------------------------------------
  # Static checks (no server needed)
  # ----------------------------------------------------------
  log_sub "Dictionary keys: new home keys (pt-BR ↔ en parity, no empty values)..."
  # philosophyColUx pt-BR = "O " e en = "" (por desenho): só a paridade de existência vale
  # para essa chave; as demais não podem ser vazias.
  if node -e "
const pt = require('./dictionaries/pt-BR.json');
const en = require('./dictionaries/en.json');
const fail = (msg) => { console.error(msg); process.exit(1); };
const keys = [
  'intro', 'philosophyBody1',
  'philosophyBody2', 'philosophyBody2Bold1', 'philosophyBody2Mid', 'philosophyBody2Bold2',
  'philosophyBody2Mid2', 'philosophyBody2Bold3', 'philosophyBody2End',
  'philosophyColUx', 'philosophyColUxBold', 'philosophyColUxEnd',
  'philosophyCol3d', 'philosophyCol3dBold1', 'philosophyCol3dMid', 'philosophyCol3dBold2', 'philosophyCol3dEnd',
];
const allowEmpty = new Set(['philosophyColUx']);
let n = 0;
for (const [name, d] of [['pt-BR', pt], ['en', en]]) {
  for (const k of keys) {
    const v = d.home && d.home[k];
    if (typeof v !== 'string') fail('home.' + k + ' missing in ' + name);
    if (!v.trim() && !(allowEmpty.has(k) && name === 'en')) fail('home.' + k + ' empty in ' + name);
    n++;
  }
  for (const t of ['studies', 'career', 'gallery']) {
    for (const f of ['title', 'text']) {
      const v = d.home && d.home.tiles && d.home.tiles[t] && d.home.tiles[t][f];
      if (typeof v !== 'string' || !v.trim()) fail('home.tiles.' + t + '.' + f + ' missing/empty in ' + name);
      n++;
    }
  }
  for (const k of ['philosophyBody1Bold', 'philosophyBody1End']) {
    if (d.home && k in d.home) fail('home.' + k + ' must be removed in ' + name);
  }
}
if (!pt.home.intro.startsWith('Prazer, sou a Ágatha!')) fail('pt-BR home.intro must start with \"Prazer, sou a Ágatha!\"');
if (!en.home.intro.startsWith('Hi, I')) fail('en home.intro must start with \"Hi, I\"');
console.log('ok: ' + n + ' checks');
"; then
    log_pass "home.* new keys present in both dictionaries; Body1Bold/Body1End removed; intro starts right"
  else
    log_fail "home.* new keys check failed"
  fi

  log_sub "Image assets in public/images/home/..."
  for asset in "espiando-cabeca.png" "espiando-dedos.png" "icones/estudos.png" "icones/carreira.png" "icones/galeria.png"; do
    if [ -f "public/images/home/$asset" ]; then
      log_pass "  $asset exists"
    else
      log_fail "  public/images/home/$asset missing"
    fi
  done

  log_sub "globals.css: keyframes and prefers-reduced-motion block..."
  CSS="${GATE8_CSS:-app/[lang]/globals.css}"
  for kf in float breathe swing swingHover; do
    if grep -qE "@keyframes[[:space:]]+$kf[[:space:]]*\{" "$CSS"; then
      log_pass "  @keyframes $kf"
    else
      log_fail "  @keyframes $kf missing in $CSS"
    fi
  done
  # O bloco de movimento reduzido tem que citar as 4 classes de animação (Tasks 3 e 4).
  # Extrai só o bloco @media (contando chaves) e casa a classe exata (.anim-float != .anim-float-2).
  RM_BLOCK=$(awk '
    !f && /@media[[:space:]]*\(prefers-reduced-motion:[[:space:]]*reduce\)/ {f=1}
    f { print; n=gsub(/\{/,"{"); m=gsub(/\}/,"}"); d+=n-m; if (d<=0 && (n+m)>0) exit }
  ' "$CSS" || true)
  if [ -z "$RM_BLOCK" ]; then
    log_fail "  no @media (prefers-reduced-motion: reduce) block in $CSS"
  else
    for cls in anim-float anim-float-2 anim-breathe cracha-swing; do
      if printf '%s' "$RM_BLOCK" | grep -qE "\.${cls}([^-a-zA-Z0-9_]|$)"; then
        log_pass "  reduced-motion block covers .$cls"
      else
        log_fail "  reduced-motion block does not mention .$cls"
      fi
    done
  fi

  log_sub "No hardcoded tile strings in components/ and app/..."
  # Mesma ancoragem da gate 7: só casa a frase logo após aspa/crase/'>'.
  HARDCODED_8=$(grep -rnIE "(['\">\`])[[:space:]]*(Minha carreira no design|Minha galeria|estudos despretensiosos|My design career|My gallery)" components app || true)
  if [ -z "$HARDCODED_8" ]; then
    log_pass "No hardcoded tile strings in components/ or app/"
  else
    log_fail "Hardcoded tile strings found:"
    echo "$HARDCODED_8" | head -10
  fi

  log_sub "ContactForm.tsx untouched since the spec commit (535defa)..."
  if git diff --quiet 535defa -- components/contact/ContactForm.tsx 2>/dev/null; then
    log_pass "components/contact/ContactForm.tsx unchanged"
  else
    log_fail "components/contact/ContactForm.tsx changed since 535defa"
  fi

  log_sub "Peeking client component starts with 'use client'..."
  if [ -f components/home/PeekingReveal.tsx ] && head -n 5 components/home/PeekingReveal.tsx | grep -qE "^['\"]use client['\"]"; then
    log_pass "components/home/PeekingReveal.tsx is a Client Component"
  else
    log_fail "components/home/PeekingReveal.tsx missing or without 'use client'"
  fi

  # ----------------------------------------------------------
  # Runtime checks (GATE_BASE_URL or :3000) — SKIP if nothing answers
  # ----------------------------------------------------------
  local BASE="${GATE_BASE_URL:-http://localhost:3000}"
  BASE="${BASE%/}"
  log_sub "Runtime: server on $BASE..."
  if ! curl -s --connect-timeout 3 --max-time 60 -o /dev/null "$BASE/pt-BR"; then
    log_skip "Nothing answers on $BASE — start 'pnpm build && pnpm start' (or set GATE_BASE_URL) and re-run for the runtime checks"
    return 0
  fi

  page() { curl -s --max-time 60 "$BASE$1" | tr '\n' ' ' || true; }
  local HTML_PT HTML_EN
  HTML_PT=$(page "/pt-BR")
  HTML_EN=$(page "/en")

  # Âncoras `>…` / `<` casam o texto renderizado no DOM e não o payload RSC (dict em props).
  log_sub "Test: /pt-BR has the new intro, 3 tile titles, id=\"top\" and the back-to-top link (visible text)..."
  for pair in ">Prazer, sou a Ágatha!" ">Estudos<" ">Minha carreira no design<" ">Minha galeria<" ">voltar ao topo" 'id="top"'; do
    if printf '%s' "$HTML_PT" | grep -qF -- "$pair"; then
      log_pass "  /pt-BR contains: $pair"
    else
      log_fail "  /pt-BR does not contain: $pair"
    fi
  done

  log_sub "Test: /en has the new intro, 3 tile titles, id=\"top\" and the back-to-top link (visible text)..."
  for pair in ">Hi, I" ">Studies<" ">My design career<" ">My gallery<" ">back to top" 'id="top"'; do
    if printf '%s' "$HTML_EN" | grep -qF -- "$pair"; then
      log_pass "  /en contains: $pair"
    else
      log_fail "  /en does not contain: $pair"
    fi
  done

  log_sub "Test: footer back-to-top is a link inside <footer> (both locales)..."
  for locale in pt-BR en; do
    HTML_VAR=$([ "$locale" = "pt-BR" ] && printf '%s' "$HTML_PT" || printf '%s' "$HTML_EN")
    TXT=$([ "$locale" = "pt-BR" ] && echo "voltar ao topo" || echo "back to top")
    FOOT=$(printf '%s' "$HTML_VAR" | grep -o '<footer.*' | sed 's#</footer>.*#</footer>#' | head -1 || true)
    if printf '%s' "$FOOT" | grep -qE "<a [^>]*href=\"#top\"[^>]*>(<svg[^>]*>.*</svg>)?$TXT</a>"; then
      log_pass "  /$locale footer has the pill link to #top with visible text \"$TXT\""
    else
      log_fail "  /$locale footer has no <a href=\"#top\"> with visible text \"$TXT\""
    fi
  done
}

# ============================================================
# GATE 9: Página Minha carreira (Figma 226:56; antes 201:53)
# ============================================================
gate_9() {
  log_gate "9" "Minha carreira page"

  log_sub "Dictionary: career.* and metadata.career (pt-BR ↔ en, same keys, no empty values)..."
  if node -e "
const pt = require('./dictionaries/pt-BR.json');
const en = require('./dictionaries/en.json');
const fail = (m) => { console.error(m); process.exit(1); };
const walk = (a, b, p) => {
  for (const k of Object.keys(a)) {
    if (!(k in b)) fail(p + k + ' missing in en');
    if (typeof a[k] === 'object') walk(a[k], b[k], p + k + '.');
    else if (typeof a[k] !== 'string' || !a[k].trim() || typeof b[k] !== 'string' || !b[k].trim()) fail(p + k + ' empty');
  }
  for (const k of Object.keys(b)) if (!(k in a)) fail(p + k + ' only in en');
};
if (!pt.career || !en.career) fail('career missing');
walk(pt.career, en.career, 'career.');
if (!pt.metadata.career || !en.metadata.career) fail('metadata.career missing');
// negrito por chaves partidas: a ordem p*/b* tem que ser igual nos dois idiomas
for (const c of ['col1', 'col2', 'col3']) {
  if (Object.keys(pt.career.hero[c]).join() !== Object.keys(en.career.hero[c]).join()) fail('hero.' + c + ' key order differs');
}
console.log('ok');
"; then
    log_pass "career.* parity ok (pt-BR ↔ en), metadata.career present"
  else
    log_fail "career.* dictionary check failed"
  fi

  log_sub "Route, routers and top bar..."
  [ -f "app/[lang]/carreira/page.tsx" ] && log_pass "app/[lang]/carreira/page.tsx exists" || log_fail "app/[lang]/carreira/page.tsx missing"
  grep -q '"x-default": "/pt-BR/carreira"' "app/[lang]/carreira/page.tsx" && log_pass "  alternates with x-default" || log_fail "  carreira page without x-default alternate"
  grep -q "segments\[0\] === 'carreira'" components/layout/HeaderRouter.tsx && log_pass "  HeaderRouter hides the site header on /carreira" || log_fail "  HeaderRouter has no carreira branch"
  grep -q "segments\[0\] === 'carreira'" components/layout/FooterRouter.tsx && log_pass "  FooterRouter uses HomeFooter on /carreira" || log_fail "  FooterRouter has no carreira branch"
  grep -q 'variant="career"' "app/[lang]/carreira/page.tsx" && log_pass "  CaseTopBar variant=\"career\" (back, language switcher, projetos)" || log_fail "  carreira page without CaseTopBar variant=\"career\""
  grep -q 'href={`/${locale}/carreira`}' components/home/StudiesGallery.tsx && log_pass "  home career tile links to /carreira" || log_fail "  home career tile does not link to /carreira"

  log_sub "Assets referenced by components/career exist in public/images/carreira..."
  local missing=0
  for asset in $(grep -rhoE '/images/carreira/[a-z0-9-]+(\.webp)?' components/career | sort -u); do
    case "$asset" in
      *.webp) [ -f "public$asset" ] || { log_fail "  public$asset missing"; missing=1; } ;;
    esac
  done
  # Loop("name") → name.webp + name-static.webp
  for name in $(grep -rhoE 'Loop name="[a-z0-9-]+"' components/career | sed -E 's/.*"(.*)"/\1/' | sort -u); do
    for f in "$name.webp" "$name-static.webp"; do
      [ -f "public/images/carreira/$f" ] || { log_fail "  public/images/carreira/$f missing"; missing=1; }
    done
  done
  # olhos que seguem o cursor (OlharFace monta os nomes por olho)
  for f in olhar-rosto.webp olhar-iris-esq.webp olhar-iris-dir.webp olhar-olho-esq.png olhar-olho-dir.png; do
    [ -f "public/images/carreira/$f" ] || { log_fail "  public/images/carreira/$f missing"; missing=1; }
  done
  [ $missing -eq 0 ] && log_pass "All career assets exist"
  grep -q "useFinePointer" components/career/OlharFace.tsx && log_pass "  OlharFace follows the cursor only with a fine pointer (GIF on touch)" || log_fail "  OlharFace without useFinePointer"

  log_sub "No hardcoded copy in components/career (text comes from dict.career)..."
  # Comentários (linhas que começam com *, // ou {/*) citam o texto do Figma e não contam.
  HARDCODED_9=$(grep -rnIE "(['\">\`])[[:space:]]*(como vim parar|Monitoria|caminhos|hora do desenho|life gallery|Entrei no|Sou cheia de|momentos memoráveis|sobre este site|Pesquisa e UX|Áreas de pesquisa|clique aqui)" components/career \
    | grep -vE '^[^:]+:[0-9]+:[[:space:]]*(\*|//|/\*|\{/\*)' || true)
  if [ -z "$HARDCODED_9" ]; then
    log_pass "No hardcoded career strings"
  else
    log_fail "Hardcoded career strings found:"
    echo "$HARDCODED_9" | head -10
  fi

  log_sub "Motion: knitting scene and drawing board, each with a reduced-motion fallback..."
  head -n 3 components/career/KnittingDoll.tsx | grep -qE "^['\"]use client['\"]" && log_pass "  KnittingDoll is a Client Component" || log_fail "  KnittingDoll without 'use client'"
  grep -q "prefers-reduced-motion: reduce" components/career/knitting.module.css && log_pass "  knitting.module.css has a reduced-motion block" || log_fail "  knitting.module.css without reduced-motion block"
  grep -q "prefers-reduced-motion" components/career/layout.tsx && log_pass "  GIF loops fall back to their first frame" || log_fail "  Loop without reduced-motion <source>"

  # Emenda 5 (Figma 226:56): trem em vídeo, publicações, momentos e sobre este site
  log_sub "Train, papers, memorable moments and about this site (Emenda 5)..."
  [ -f public/videos/carreira/trem.mp4 ] && [ -f public/images/carreira/trem.webp ] && log_pass "  train video + poster exist" || log_fail "  train video or poster missing"
  head -n 3 components/career/CareerTrain.tsx | grep -qE "^['\"]use client['\"]" && log_pass "  CareerTrain is a Client Component" || log_fail "  CareerTrain without 'use client'"
  grep -q "prefers-reduced-motion" components/career/CareerTrain.tsx && grep -q "prefers-reduced-motion" components/career/train.module.css && log_pass "  train keeps the poster (Figma) with reduced motion" || log_fail "  train ignores reduced motion"
  grep -q "prefers-reduced-motion: reduce" components/career/moments.module.css && log_pass "  moments carousel stops with reduced motion" || log_fail "  moments.module.css without reduced-motion block"
  grep -q "prefers-reduced-motion" components/career/CareerPublications.tsx && log_pass "  ticket flip skips the animation with reduced motion" || log_fail "  CareerPublications ignores reduced motion"
  # fotos: <card>-<n>.webp para cada largura em `photos: [...]`
  while IFS=: read -r card list; do
    n=$(echo "$list" | tr ',' '\n' | grep -c .)
    for i in $(seq 1 "$n"); do
      [ -f "public/images/carreira/momentos/$card-$i.webp" ] || { log_fail "  momentos/$card-$i.webp missing"; missing=1; }
    done
  done < <(grep -oE "key: '[a-z0-9]+', photos: \[[^]]+\]" components/career/CareerMoments.tsx | sed -E "s/key: '([a-z0-9]+)', photos: \[([^]]+)\]/\1:\2/")
  for slug in $(grep -oE "slug: '[a-z-]+'" lib/site.ts | sed -E "s/slug: '(.*)'/\1/"); do
    [ -f "public/images/carreira/devs/$slug.webp" ] || { log_fail "  devs/$slug.webp missing"; missing=1; }
  done
  for f in g100961.svg g100962.svg g100963.svg g100964.svg exclude.svg line10.svg line11.svg ellipse379.svg ellipse429.svg union.svg ellipse378.webp; do
    [ -f "public/images/carreira/publicacao/$f" ] || { log_fail "  publicacao/$f missing"; missing=1; }
  done
  [ $missing -eq 0 ] && log_pass "  moment photos, dev avatars and ticket layers exist"
  grep -q "name: 'André Garcia'" lib/site.ts && log_pass "  dev name is André Garcia" || log_fail "  André Garcia missing from career.devs"

  # Lousa mágica + blocos (spec, Emenda 3)
  log_sub "Drawing board (lousa mágica) and tool blocks..."
  for f in DrawingPlayground MagicBoard ToolBlocks; do
    head -n 3 "components/career/board/$f.tsx" | grep -qE "^['\"]use client['\"]" && log_pass "  board/$f is a Client Component" || log_fail "  board/$f without 'use client'"
  done
  for f in base.webp tinta.webp grao.webp cordao.webp faixa.webp pincel.png caneta.svg; do
    [ -f "public/images/carreira/lousa/$f" ] || { log_fail "  public/images/carreira/lousa/$f missing"; missing=1; }
  done
  # um pincel por ferramenta (spec, Emenda 6): toda imagem de BRUSH_IMAGES existe
  for f in $(grep -oE "\\\$\{DIR\}/[a-z/.-]+" components/career/board/brushes.ts | sed 's#^\$[{]DIR[}]/##'); do
    [ -f "public/images/carreira/lousa/$f" ] || { log_fail "  brush image lousa/$f missing"; missing=1; }
  done
  grep -q "TOOL_BRUSH\[tool\]" components/career/board/MagicBoard.tsx && log_pass "  MagicBoard draws each tool with its own brush" || log_fail "  MagicBoard ignores TOOL_BRUSH"
  for t in $(grep -oE "TOOLS = \[[^]]+\]" components/career/board/glyphs.ts | grep -oE "'[a-z]+'" | tr -d "'"); do
    for f in "$t.svg" "$t-verso.svg"; do
      [ -f "public/images/carreira/blocos/$f" ] || { log_fail "  public/images/carreira/blocos/$f missing"; missing=1; }
    done
  done
  [ $missing -eq 0 ] && log_pass "  Board layers and the 8 blocks (front + back) exist"
  grep -q "prefers-reduced-motion: reduce" components/career/board/blocks.module.css && log_pass "  blocks.module.css has a reduced-motion block" || log_fail "  blocks.module.css without reduced-motion block"
  grep -q "reducedMotion()" components/career/board/MagicBoard.tsx && log_pass "  MagicBoard draws/erases instantly with reduced motion" || log_fail "  MagicBoard ignores reduced motion"
  grep -q "useSyncExternalStore" components/career/board/DrawingPlayground.tsx && log_pass "  Blocks start face-down only after hydration (server renders the Figma)" || log_fail "  DrawingPlayground arms the blocks without useSyncExternalStore"
  if node -e "
const pt = require('./dictionaries/pt-BR.json').career.drawing, en = require('./dictionaries/en.json').career.drawing;
const need = { drawnAlt: '{name}', draw: '{name}', drawing: '{name}', flip: '{n}' };
for (const [k, ph] of Object.entries(need)) for (const d of [pt, en]) if (!d[k] || !d[k].includes(ph)) { console.error(k + ' without ' + ph); process.exit(1); }
"; then
    log_pass "  career.drawing placeholders ({name}, {n}) in both languages"
  else
    log_fail "  career.drawing placeholder missing"
  fi
  if pnpm exec vitest run components/career/board > /tmp/gate9-vitest.log 2>&1; then
    log_pass "  vitest: board machine, geometry and glyphs ($(grep -E 'Tests ' /tmp/gate9-vitest.log | grep -oE '[0-9]+ passed'))"
  else
    log_fail "  vitest failed (see /tmp/gate9-vitest.log)"
  fi

  # ----------------------------------------------------------
  # Runtime (GATE_BASE_URL or :3000) — SKIP if nothing answers
  # ----------------------------------------------------------
  local BASE="${GATE_BASE_URL:-http://localhost:3000}"
  BASE="${BASE%/}"
  log_sub "Runtime: server on $BASE..."
  if ! curl -s --connect-timeout 3 --max-time 60 -o /dev/null "$BASE/pt-BR"; then
    log_skip "Nothing answers on $BASE — start 'pnpm build && pnpm start' (or set GATE_BASE_URL) and re-run for the runtime checks"
    return 0
  fi
  for locale in pt-BR en; do
    STATUS=$(curl -s --max-time 60 -o /dev/null -w "%{http_code}" "$BASE/$locale/carreira")
    [ "$STATUS" = "200" ] && log_pass "  /$locale/carreira → 200" || log_fail "  /$locale/carreira → $STATUS"
  done
  local HTML
  HTML=$(curl -s --max-time 60 "$BASE/pt-BR/carreira" | tr '\n' ' ' || true)
  for pair in ">como vim parar aqui?<" ">Monitoria<" ">caminhos<" ">momentos memoráveis<" ">André Garcia<" "trem.mp4" 'hrefLang="en"' 'hrefLang="x-default"' ">voltar ao topo"; do
    if printf '%s' "$HTML" | grep -qF -- "$pair"; then
      log_pass "  /pt-BR/carreira contains: $pair"
    else
      log_fail "  /pt-BR/carreira does not contain: $pair"
    fi
  done
  # a home liga o bloco de carreira à página
  if curl -s --max-time 60 "$BASE/pt-BR" | grep -qF 'href="/pt-BR/carreira"'; then
    log_pass "  /pt-BR links to /pt-BR/carreira"
  else
    log_fail "  /pt-BR has no link to /pt-BR/carreira"
  fi
}

# ============================================================
# Summary
# ============================================================
print_summary() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  QUALITY GATES SUMMARY${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "  ${GREEN}Passed:${NC}  $PASS"
  echo -e "  ${RED}Failed:${NC}  $FAIL"
  echo -e "  ${YELLOW}Skipped:${NC} $SKIP"
  echo ""

  if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL GATES PASSED${NC}"
    exit 0
  else
    echo -e "${RED}✗ $FAIL CHECK(S) FAILED${NC}"
    exit 1
  fi
}

# ============================================================
# Main
# ============================================================
main() {
  cd "$(dirname "$0")/.." || exit 1

  local gate="${1:-all}"

  case "$gate" in
    0) gate_0 ;;
    1) gate_1 ;;
    2) gate_2 ;;
    3) gate_3 ;;
    4) gate_4 ;;
    5) gate_5 ;;
    6) gate_6 ;;
    7) gate_7 ;;
    8) gate_8 ;;
    9) gate_9 ;;
    all)
      gate_0
      gate_1
      gate_2
      gate_3
      gate_4
      # gate_5  # Skip in 'all' — requires manual interaction
      # gate_6  # Skip in 'all' — run before PR
      # gate_7  # Skip in 'all' — projects page, run per task
      # gate_8  # Skip in 'all' — home texts/animations, run per task
      # gate_9  # Skip in 'all' — Minha carreira page, run per task
      ;;
    *)
      echo "Usage: $0 [0|1|2|3|4|5|6|7|8|9|all]"
      exit 1
      ;;
  esac

  print_summary
}

main "$@"
