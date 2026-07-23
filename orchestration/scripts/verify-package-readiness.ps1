<#
.SYNOPSIS
Verifies that CodeFlow utility packages are ready for publishing.

.DESCRIPTION
Checks all prerequisites for publishing the CodeFlow utility packages, including:
- Required files (README, LICENSE, pyproject.toml/package.json)
- CI/CD workflows
- Package structure
- GitHub secrets (if configured)

.PARAMETER PackageType
Type of package to verify (python, typescript, both). Default: both

.EXAMPLE
.\verify-package-readiness.ps1 -PackageType python
#>

[CmdletBinding()]
param(
    [ValidateSet("python", "typescript", "both")]
    [string]$PackageType = "both"
)

$ErrorActionPreference = 'Stop'

$script:AllChecksPassed = $true
$script:Issues = @()

function Write-CheckResult {
    param(
        [string]$CheckName,
        [bool]$Passed,
        [string]$Message = ""
    )

    if ($Passed) {
        Write-Host "✅ $CheckName" -ForegroundColor Green
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ $CheckName" -ForegroundColor Red
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Yellow
        }
        $script:AllChecksPassed = $false
        $script:Issues += "${CheckName}: ${Message}"
    }
}

function Write-WarningResult {
    param(
        [string]$CheckName,
        [string]$Message = ""
    )

    Write-Host "⚠️ $CheckName" -ForegroundColor Yellow
    if ($Message) {
        Write-Host "   $Message" -ForegroundColor Gray
    }
}

function Test-PythonPackage {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Python Package: codeflow-utils-python" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    $packagePath = "packages/codeflow-utils-python"

    if (-not (Test-Path $packagePath)) {
        Write-CheckResult "Package directory exists" $false "Directory not found: $packagePath"
        return
    }

    Write-CheckResult "Package directory exists" $true

    # Required files
    $requiredFiles = @(
        @{Path = "README.md"; Name = "README.md"},
        @{Path = "LICENSE"; Name = "LICENSE file"},
        @{Path = "pyproject.toml"; Name = "pyproject.toml"},
        @{Path = "codeflow_utils/__init__.py"; Name = "Package __init__.py"}
    )

    foreach ($file in $requiredFiles) {
        $fullPath = Join-Path $packagePath $file.Path
        $exists = Test-Path $fullPath
        Write-CheckResult $file.Name $exists $(if (-not $exists) { "File missing: $($file.Path)" } else { "" })
    }

    # Check pyproject.toml content
    $pyprojectPath = Join-Path $packagePath "pyproject.toml"
    if (Test-Path $pyprojectPath) {
        $content = Get-Content $pyprojectPath -Raw

        $checks = @(
            @{Pattern = 'name\s*=\s*"codeflow-utils-python"'; Name = "Package name correct"},
            @{Pattern = 'version\s*='; Name = "Version specified"},
            @{Pattern = 'description\s*='; Name = "Description specified"},
            @{Pattern = 'readme\s*='; Name = "Readme reference"},
            @{Pattern = 'license\s*='; Name = "License specified"},
            @{Pattern = 'requires-python\s*='; Name = "Python version requirement"}
        )

        foreach ($check in $checks) {
            $matches = $content -match $check.Pattern
            Write-CheckResult $check.Name $matches $(if (-not $matches) { "Missing in pyproject.toml" } else { "" })
        }
    }

    # Check package structure
    $initPath = Join-Path $packagePath "codeflow_utils/__init__.py"
    if (Test-Path $initPath) {
        $initContent = Get-Content $initPath -Raw
        $hasExports = $initContent -match '__all__|from\s+\w+\s+import'
        Write-CheckResult "Package exports defined" $hasExports $(if (-not $hasExports) { "No exports found in __init__.py" } else { "" })
    }

    # Check tests
    $testsPath = Join-Path $packagePath "tests"
    if (Test-Path $testsPath) {
        $testFiles = Get-ChildItem $testsPath -Recurse -Filter "test_*.py" -ErrorAction SilentlyContinue
        $testCount = ($testFiles | Measure-Object).Count
        Write-CheckResult "Test files exist" ($testCount -gt 0) $(if ($testCount -eq 0) { "No test files found" } else { "$testCount test files found" })
    } else {
        Write-CheckResult "Test directory exists" $false "tests/ directory not found"
    }

    # Check CI/CD workflows
    $workflowPath = Join-Path $packagePath ".github/workflows"
    if (Test-Path $workflowPath) {
        $workflows = Get-ChildItem $workflowPath -Filter "*.yml" -ErrorAction SilentlyContinue
        $workflowCount = ($workflows | Measure-Object).Count

        $hasPublish = $workflows | Where-Object { $_.Name -like "*publish*" }
        $hasCI = $workflows | Where-Object { $_.Name -like "*ci*" -or $_.Name -like "*test*" }

        Write-CheckResult "CI/CD workflows exist" ($workflowCount -gt 0) "$workflowCount workflow(s) found"
        Write-CheckResult "Publish workflow exists" ($null -ne $hasPublish) $(if (-not $hasPublish) { "No publish workflow found" } else { "" })
        Write-CheckResult "CI workflow exists" ($null -ne $hasCI) $(if (-not $hasCI) { "No CI workflow found" } else { "" })
    } else {
        Write-CheckResult "CI/CD workflows directory exists" $false ".github/workflows/ directory not found"
    }

    # Check for .gitignore
    $gitignorePath = Join-Path $packagePath ".gitignore"
    if (Test-Path $gitignorePath) {
        Write-CheckResult ".gitignore exists" $true
    } else {
        Write-WarningResult ".gitignore exists" "Recommended but not required"
    }
}

function Test-TypeScriptPackage {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "TypeScript Package: @codeflow/utils" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    $packagePath = "packages/@codeflow/utils"

    if (-not (Test-Path $packagePath)) {
        Write-CheckResult "Package directory exists" $false "Directory not found: $packagePath"
        return
    }

    Write-CheckResult "Package directory exists" $true

    # Required files
    $requiredFiles = @(
        @{Path = "README.md"; Name = "README.md"},
        @{Path = "LICENSE"; Name = "LICENSE file"},
        @{Path = "package.json"; Name = "package.json"},
        @{Path = "tsconfig.json"; Name = "tsconfig.json"},
        @{Path = "src/index.ts"; Name = "Source index.ts"}
    )

    foreach ($file in $requiredFiles) {
        $fullPath = Join-Path $packagePath $file.Path
        $exists = Test-Path $fullPath
        Write-CheckResult $file.Name $exists $(if (-not $exists) { "File missing: $($file.Path)" } else { "" })
    }

    # Check package.json content
    $packageJsonPath = Join-Path $packagePath "package.json"
    if (Test-Path $packageJsonPath) {
        try {
            $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json

            Write-CheckResult "Package name correct" ($packageJson.name -eq "@codeflow/utils") $(if ($packageJson.name -ne "@codeflow/utils") { "Expected '@codeflow/utils', found '$($packageJson.name)'" } else { "" })
            Write-CheckResult "Version specified" ($null -ne $packageJson.version) $(if (-not $packageJson.version) { "No version in package.json" } else { "" })
            Write-CheckResult "Description specified" ($null -ne $packageJson.description) $(if (-not $packageJson.description) { "No description in package.json" } else { "" })
            Write-CheckResult "Main entry point" ($null -ne $packageJson.main) $(if (-not $packageJson.main) { "No 'main' field in package.json" } else { "" })
            Write-CheckResult "TypeScript types" ($null -ne $packageJson.types) $(if (-not $packageJson.types) { "No 'types' field in package.json" } else { "" })
            Write-CheckResult "Build script" ($null -ne $packageJson.scripts.build) $(if (-not $packageJson.scripts.build) { "No 'build' script in package.json" } else { "" })
        } catch {
            Write-CheckResult "package.json valid JSON" $false "Invalid JSON: $_"
        }
    }

    # Check source structure
    $srcPath = Join-Path $packagePath "src"
    if (Test-Path $srcPath) {
        $srcFiles = Get-ChildItem $srcPath -Filter "*.ts" -ErrorAction SilentlyContinue
        $srcCount = ($srcFiles | Measure-Object).Count
        Write-CheckResult "Source files exist" ($srcCount -gt 0) $(if ($srcCount -eq 0) { "No source files found" } else { "$srcCount source file(s) found" })
    } else {
        Write-CheckResult "Source directory exists" $false "src/ directory not found"
    }

    # Check tests
    $testsPath = Join-Path $packagePath "tests"
    if (Test-Path $testsPath) {
        $testFiles = Get-ChildItem $testsPath -Recurse -Filter "*.test.ts" -ErrorAction SilentlyContinue
        $testCount = ($testFiles | Measure-Object).Count
        if ($testCount -gt 0) {
            Write-CheckResult "Test files exist" $true "$testCount test files found"
        } else {
            Write-WarningResult "Test files exist" "No TypeScript test files found; recommended before publishing but not required"
        }
    } else {
        Write-WarningResult "Test directory exists" "tests/ directory not found; recommended before publishing but not required"
    }

    # Check CI/CD workflows
    $workflowPath = Join-Path $packagePath ".github/workflows"
    if (Test-Path $workflowPath) {
        $workflows = Get-ChildItem $workflowPath -Filter "*.yml" -ErrorAction SilentlyContinue
        $workflowCount = ($workflows | Measure-Object).Count

        $hasPublish = $workflows | Where-Object { $_.Name -like "*publish*" }
        $hasCI = $workflows | Where-Object { $_.Name -like "*ci*" -or $_.Name -like "*test*" }

        Write-CheckResult "CI/CD workflows exist" ($workflowCount -gt 0) "$workflowCount workflow(s) found"
        Write-CheckResult "Publish workflow exists" ($null -ne $hasPublish) $(if (-not $hasPublish) { "No publish workflow found" } else { "" })
        Write-CheckResult "CI workflow exists" ($null -ne $hasCI) $(if (-not $hasCI) { "No CI workflow found" } else { "" })
    } else {
        Write-CheckResult "CI/CD workflows directory exists" $false ".github/workflows/ directory not found"
    }
}

function Test-GitHubSecrets {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "GitHub Secrets (Manual Check Required)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "⚠️  GitHub secrets cannot be verified automatically." -ForegroundColor Yellow
    Write-Host "   Please verify manually in GitHub repository settings:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   For Python package:" -ForegroundColor Cyan
    Write-Host "   - Secret name: PYPI_API_TOKEN" -ForegroundColor Gray
    Write-Host "   - Location: Settings > Secrets and variables > Actions" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   For TypeScript package:" -ForegroundColor Cyan
    Write-Host "   - Secret name: NPM_TOKEN" -ForegroundColor Gray
    Write-Host "   - Location: Settings > Secrets and variables > Actions" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Use: .\scripts\setup-package-publishing.ps1 for setup instructions" -ForegroundColor Gray
    Write-Host ""
}

# Main execution
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Package Readiness Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Split-Path -Parent $PSScriptRoot
Push-Location $rootPath

try {
    if ($PackageType -in @("python", "both")) {
        Test-PythonPackage
    }

    if ($PackageType -in @("typescript", "both")) {
        Test-TypeScriptPackage
    }

    Test-GitHubSecrets

    Write-Host ""
    Write-Host "========================================" -ForegroundColor $(if ($script:AllChecksPassed) { "Green" } else { "Yellow" })
    Write-Host "Verification Summary" -ForegroundColor $(if ($script:AllChecksPassed) { "Green" } else { "Yellow" })
    Write-Host "========================================" -ForegroundColor $(if ($script:AllChecksPassed) { "Green" } else { "Yellow" })
    Write-Host ""

    if ($script:AllChecksPassed) {
        Write-Host "✅ All automated checks passed!" -ForegroundColor Green
        Write-Host "   Packages appear ready for publishing." -ForegroundColor Gray
        Write-Host ""
        Write-Host "   Next steps:" -ForegroundColor Yellow
        Write-Host "   1. Verify GitHub secrets are configured" -ForegroundColor White
        Write-Host "   2. Create GitHub release to trigger publishing" -ForegroundColor White
        Write-Host "   3. Verify packages are published successfully" -ForegroundColor White
    } else {
        Write-Host "❌ Some checks failed. Please address the following issues:" -ForegroundColor Red
        Write-Host ""
        foreach ($issue in $script:Issues) {
            Write-Host "   - $issue" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "   See: docs/PACKAGE_PUBLISHING_GUIDE.md for help" -ForegroundColor Gray
    }

    exit $(if ($script:AllChecksPassed) { 0 } else { 1 })
} finally {
    Pop-Location
}
