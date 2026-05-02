$pages = @(
    "https://eleo-informatique.fr/",
    "https://eleo-informatique.fr/contact/",
    "https://eleo-informatique.fr/formation-informatique-et-formation-bureautique-aix-en-provence/",
    "https://eleo-informatique.fr/entreprise-depannage-informatique-aix-en-provence/",
    "https://eleo-informatique.fr/cybersecurite/"
)
foreach ($p in $pages) {
    Write-Host "=== $p ==="
    $html = curl.exe -sL "$p" --max-time 15
    $emails = [regex]::Matches($html, '[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(fr|com|net|org)') | ForEach-Object { $_.Value } | Sort-Object -Unique
    foreach ($e in $emails) { Write-Host "  $e" }
    Write-Host ""
}
