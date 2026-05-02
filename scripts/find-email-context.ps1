$url = "https://eleo-informatique.fr/formation-informatique-et-formation-bureautique-aix-en-provence/"
curl.exe -sL "$url" --max-time 15 -o wp-find-email.html
$html = Get-Content wp-find-email.html -Raw
$pos = $html.IndexOf("adresse@email.fr")
Write-Host "Position: $pos"
if ($pos -gt 0) {
    $start = [Math]::Max(0, $pos - 500)
    $len = [Math]::Min(700, $html.Length - $start)
    Write-Host "=== Contexte ==="
    Write-Host $html.Substring($start, $len)
}
