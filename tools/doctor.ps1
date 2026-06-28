param(
    [switch]$RunTests
)

$ErrorActionPreference = "Stop"

$RepoDir = Split-Path -Parent $PSScriptRoot
$hardFailures = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Write-Check {
    param(
        [ValidateSet("PASS", "WARN", "FAIL", "INFO")]
        [string]$Status,
        [string]$Message
    )

    $prefix = "[$Status]"
    switch ($Status) {
        "PASS" { Write-Host "$prefix $Message" -ForegroundColor Green }
        "WARN" { Write-Host "$prefix $Message" -ForegroundColor Yellow }
        "FAIL" { Write-Host "$prefix $Message" -ForegroundColor Red }
        default { Write-Host "$prefix $Message" }
    }
}

function Invoke-Git {
    param([string[]]$Arguments)

    Push-Location $RepoDir
    try {
        $output = & git @Arguments 2>&1
        return [ordered]@{
            ExitCode = $LASTEXITCODE
            Output = ($output -join "`n")
        }
    } finally {
        Pop-Location
    }
}

Write-Host "OpenPCM Windows agent workflow preflight"
Write-Host "Repository: $RepoDir"
Write-Host ""

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    $hardFailures.Add("Git is not available on PATH.")
    Write-Check FAIL "Git is not available on PATH. Install Git for Windows and restart VS Code."
} else {
    Write-Check PASS "Git found: $($git.Source)"

    $insideWorkTree = Invoke-Git @("rev-parse", "--is-inside-work-tree")
    if ($insideWorkTree.ExitCode -ne 0 -or $insideWorkTree.Output.Trim() -ne "true") {
        $hardFailures.Add("Repository directory is not a Git work tree: $RepoDir")
        Write-Check FAIL "Repository directory is not a Git work tree."
    } else {
        Write-Check PASS "Repository is a Git work tree."

        $branch = Invoke-Git @("branch", "--show-current")
        if ($branch.ExitCode -eq 0 -and $branch.Output.Trim()) {
            Write-Check PASS "Current branch: $($branch.Output.Trim())"
        } else {
            $warnings.Add("Could not determine the current branch.")
            Write-Check WARN "Could not determine the current branch."
        }

        $remote = Invoke-Git @("remote", "-v")
        if ($remote.ExitCode -eq 0 -and $remote.Output.Trim()) {
            Write-Check PASS "Git remotes are configured."
            Write-Host $remote.Output
        } else {
            $warnings.Add("No Git remotes are configured.")
            Write-Check WARN "No Git remotes are configured; push will not work until origin is configured."
        }

        $status = Invoke-Git @("status", "--short")
        if ($status.ExitCode -eq 0) {
            if ($status.Output.Trim()) {
                $warnings.Add("Working tree has uncommitted changes.")
                Write-Check WARN "Working tree has uncommitted changes:"
                Write-Host $status.Output
            } else {
                Write-Check PASS "Working tree is clean."
            }
        } else {
            $hardFailures.Add("Could not read Git status.")
            Write-Check FAIL "Could not read Git status."
        }
    }
}

$testRunner = Join-Path $RepoDir "tools\run-tests.js"
if (Test-Path $testRunner) {
    Write-Check PASS "Test runner found: tools/run-tests.js"
} else {
    $hardFailures.Add("Test runner missing: tools/run-tests.js")
    Write-Check FAIL "Test runner missing: tools/run-tests.js"
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    $warnings.Add("Node.js is not available on PATH; automated local tests cannot run from this shell.")
    Write-Check WARN "Node.js is not available on PATH; automated local tests cannot run from this shell."
    Write-Host "       Install Node.js LTS, then restart VS Code/PowerShell so 'node' is on PATH."
} else {
    Write-Check PASS "Node.js found: $($node.Source)"

    if ($RunTests) {
        Write-Host ""
        Write-Host "Running tests with node tools/run-tests.js..."
        Push-Location $RepoDir
        try {
            & node tools/run-tests.js
            if ($LASTEXITCODE -eq 0) {
                Write-Check PASS "Test suite completed successfully."
            } else {
                $hardFailures.Add("Test suite failed with exit code $LASTEXITCODE.")
                Write-Check FAIL "Test suite failed with exit code $LASTEXITCODE."
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-Check INFO "Use '.\tools\doctor.ps1 -RunTests' to run the Node test suite during preflight."
    }
}

Write-Host ""
Write-Host "Summary"
Write-Host "Hard failures: $($hardFailures.Count)"
Write-Host "Warnings: $($warnings.Count)"

if ($hardFailures.Count -gt 0) {
    Write-Host ""
    Write-Host "Hard blockers:" -ForegroundColor Red
    foreach ($failure in $hardFailures) {
        Write-Host "- $failure" -ForegroundColor Red
    }
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Warnings:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "- $warning" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Check PASS "Preflight completed without hard blockers."
exit 0
