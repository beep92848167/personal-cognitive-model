$path = Join-Path $PSScriptRoot 'update.ps1'
$tokens = $null
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$errors) | Out-Null
if ($errors -and $errors.Count -gt 0) {
    $errors | Format-List
    exit 1
}
Write-Host 'Syntax OK'
