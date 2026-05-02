$body = @{
    firstName = "Test"
    lastName = "Integration"
    email = "eleo.informatique@gmail.com"
    phone = "06 10 67 46 52"
    fundingMode = "FONDS_PROPRES"
    formationTitle = "Technicien informatique IA-augmente"
    professionalGoal = "Valider l integration email Resend"
    message = "Ceci est un prospect de test cree par l outil de verification. Peut etre supprime."
} | ConvertTo-Json -Compress

$body | Out-File -FilePath test-body.json -Encoding utf8 -NoNewline

Write-Host "=== POST /api/prospects ==="
$res = curl.exe -s -X POST "https://formation.eleo-informatique.fr/api/prospects" `
    -H "Content-Type: application/json" `
    -d "@test-body.json" `
    --max-time 30
Write-Host $res

Remove-Item test-body.json -ErrorAction SilentlyContinue
