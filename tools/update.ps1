param(
    [switch]$sync,
    [switch]$dryRun,
    [Parameter(Mandatory=$true, Position=0)]
    [string]$message
)

function Write-ErrorAndExit {
    param([string]$Text)
    Write-Error $Text
    exit 1
}

$RepoDir = Split-Path -Parent $PSScriptRoot
$DownloadsDir = Join-Path ([Environment]::GetFolderPath("UserProfile")) "Downloads"

if (-not (Test-Path $DownloadsDir)) {
    Write-ErrorAndExit "Downloads folder not found: $DownloadsDir"
}

function Get-NewestZip {
    Get-ChildItem -Path $DownloadsDir -Filter "openpcm-*.zip" -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
}

function Write-SyncMetadata {
    Push-Location $RepoDir
    try {
        $commit = git rev-parse --short HEAD 2>$null
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
    } finally {
        Pop-Location
    }

    if (-not $commit -or -not $branch) {
        Write-ErrorAndExit "Git repository not found at $RepoDir"
    }

    $timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $tests = [ordered]@{
        status = "UNKNOWN"
        passed = ""
        failed = ""
        requirements = [ordered]@{
            covered = ""
            total = ""
        }
    }

    $testsPath = Join-Path $RepoDir "tests\last-test-run.json"
    if (Test-Path $testsPath) {
        try {
            $parsed = Get-Content $testsPath -Raw | ConvertFrom-Json
            if ($parsed.status) { $tests.status = $parsed.status } else { $tests.status = "UNKNOWN" }
            if ($parsed.passed) { $tests.passed = [string]$parsed.passed } else { $tests.passed = "" }
            if ($parsed.failed) { $tests.failed = [string]$parsed.failed } else { $tests.failed = "" }
            if ($parsed.requirements.covered) { $tests.requirements.covered = [string]$parsed.requirements.covered } else { $tests.requirements.covered = "" }
            if ($parsed.requirements.total) { $tests.requirements.total = [string]$parsed.requirements.total } else { $tests.requirements.total = "" }
        } catch {
            Write-Host "Warning: could not parse tests/last-test-run.json"
        }
    }

    $sync = [ordered]@{
        workflowVersion = 5
        timestamp = $timestamp
        branch = $branch
        commit = $commit
        status = $tests.status
        tests = [ordered]@{
            passed = $tests.passed
            failed = $tests.failed
        }
        requirements = [ordered]@{
            covered = $tests.requirements.covered
            total = $tests.requirements.total
        }
    }

    $sync | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $RepoDir ".openpcm-sync.json") -Encoding utf8
}

function Run-TestsIfAvailable {
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Host ""
        Write-Host "Running tests..."
        Push-Location $RepoDir
        try {
            $output = node tools/run-tests.js 2>&1
            $output | Set-Content -Path "tests\last-test-run.json" -Encoding utf8
            try {
                $parsed = $output | ConvertFrom-Json
            } catch {
                Write-ErrorAndExit "Test runner output was not valid JSON."
            }

            if ($parsed.failed -gt 0 -or $parsed.status -ne "PASS") {
                Write-ErrorAndExit "Tests failed: $($parsed.failed) failed"
            }
        } finally {
            Pop-Location
        }

        return $true
    }

    Write-Host ""
    Write-Host "Running tests..."
    Write-Host "Node.js unavailable; preserving existing test artifact."
    return $false
}

function Create-SyncPackage {
    Write-Host ""
    Write-Host "Updating sync metadata..."
    Write-SyncMetadata

    Write-Host ""
    Write-Host "Creating sync package..."
    Push-Location $RepoDir
    try {
        $commit = git rev-parse --short HEAD
        $branch = git rev-parse --abbrev-ref HEAD
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $packageName = "${timestamp}-openpcm-${branch}-${commit}.zip"
        $packagePath = Join-Path $DownloadsDir $packageName

        if (Test-Path $packagePath) {
            Remove-Item -Path $packagePath -Force
        }

        $files = Get-ChildItem -Path $RepoDir -Recurse -File | Where-Object {
            $_.FullName -notmatch [regex]::Escape("$RepoDir\.git") -and
            $_.FullName -notmatch [regex]::Escape("$RepoDir\node_modules") -and
            $_.Extension -ne ".zip"
        }

        if (-not $files) {
            Write-ErrorAndExit "No files found to archive."
        }

        Compress-Archive -LiteralPath $files.FullName -DestinationPath $packagePath -Force

        if (-not (Test-Path $packagePath) -or ((Get-Item $packagePath).Length -eq 0)) {
            Write-ErrorAndExit "ERROR: Sync package was not created or is empty."
        }

        Write-Host ""
        Write-Host "Sync package"
        Write-Host $packageName
        Write-Host $packagePath
        Write-Host "`nNext"
        Write-Host "1. Upload ZIP to ChatGPT"
        Write-Host "2. Type: SYNC"
    } finally {
        Pop-Location
    }
}

function Apply-Zip {
    Write-Host "`nUnzipping..."
    $tmpdir = Join-Path $env:TEMP ([guid]::NewGuid().ToString())
    New-Item -Path $tmpdir -ItemType Directory | Out-Null

    try {
        Expand-Archive -LiteralPath $ZipFilePath.FullName -DestinationPath $tmpdir -Force
        Write-Host "Applying files..."

        Get-ChildItem -Path $tmpdir -Force | ForEach-Object {
            if ($_.Name -eq ".git") {
                return
            }
            Copy-Item -Path $_.FullName -Destination $RepoDir -Recurse -Force
        }
    } finally {
        Remove-Item -Path $tmpdir -Recurse -Force
    }
}

function Commit-And-Push {
    Push-Location $RepoDir
    try {
        Write-Host "`nGit status:"
        git status --short

        Write-Host "`nCommitting:"
        Write-Host "  $message"

        if ($dryRun) {
            Write-Host "Dry run mode enabled; skipping commit and push."
            return
        }

        git add -A
        if (git diff --cached --quiet) {
            Write-Host "No changes to commit."
        } else {
            git commit -m $message
        }

        Write-Host "`nPushing..."
        git push
    } finally {
        Pop-Location
    }
}

$ZipFile = Get-NewestZip
if (-not $ZipFile) {
    Write-ErrorAndExit "No openpcm-*.zip found in $DownloadsDir"
}

$ZipFilePath = $ZipFile
Write-Host "Using newest zip:`n  $($ZipFilePath.FullName)"

Apply-Zip
Run-TestsIfAvailable
Commit-And-Push

if ($sync) {
    if ($dryRun) {
        Write-Host "Dry run mode enabled; skipping sync package creation."
    } else {
        Create-SyncPackage
    }
} else {
    Write-Host ""
    Write-Host "Run 'python -m http.server 8080' from the repo root to start OpenPCM."
}
