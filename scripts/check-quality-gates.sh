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
    for path in "" "contato" "grafico" "interacao" "servicos" "3d" "projetos/pontos-sem-no" "projetos/batuco-tuco" "projetos/pontinhas-soltas"; do
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
    all)
      gate_0
      gate_1
      gate_2
      gate_3
      gate_4
      # gate_5  # Skip in 'all' — requires manual interaction
      # gate_6  # Skip in 'all' — run before PR
      ;;
    *)
      echo "Usage: $0 [0|1|2|3|4|5|6|all]"
      exit 1
      ;;
  esac

  print_summary
}

main "$@"
