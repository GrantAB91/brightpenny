#!/bin/zsh
export PATH="/opt/homebrew/bin:$PATH"
cd /Users/grant/BrightPenny
pages=("home:/" "finance:/finance-options/" "sectors:/sectors/" "about:/about/" "contact:/contact/" "privacy:/privacy/" "thankyou:/thank-you/" "404:/404.html")
for p in $pages; do
  name="${p%%:*}"; path="${p##*:}"
  out="reports/${name}-mobile.json"
  for attempt in 1 2; do
    lighthouse "http://localhost:8010${path}" --output json --output-path "$out" \
      --chrome-flags="--headless=new" \
      --only-categories=performance,accessibility,best-practices,seo --quiet >/dev/null 2>&1
    [[ -s "$out" ]] && break
    pkill -f "chrome-headless" 2>/dev/null
  done
  if [[ -s "$out" ]]; then
    node -e "const r=require('./$out'); const s=Object.entries(r.categories).map(([k,v])=>k.slice(0,4)+' '+Math.round(v.score*100)).join('  '); console.log('${name}'.padEnd(9), s);"
  else
    echo "${name} FAILED"
  fi
  pkill -f "chrome-headless" 2>/dev/null
done
exit 0
