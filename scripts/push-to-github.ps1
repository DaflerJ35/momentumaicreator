# Usage:
#   .\scripts\push-to-github.ps1 -Remote "https://github.com/USER/REPO.git" -Branch "main" -Message "your commit message"

param(
  [string]$Remote = "",
  [string]$Branch = "main",
  [string]$Message = "chore: repository sync"
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git is not installed or not in PATH"
  exit 1
}

if (-not (Test-Path ".git")) {
  git init | Out-Null
}

# Ensure main branch
git symbolic-ref HEAD refs/heads/$Branch 2>$null | Out-Null

git add -A
git commit -m $Message 2>$null | Out-Null

if ($Remote -ne "") {
  $hasOrigin = git remote | Select-String -Pattern "^origin$" -Quiet
  if ($hasOrigin) {
    git remote set-url origin $Remote | Out-Null
  } else {
    git remote add origin $Remote | Out-Null
  }
}

# Push if origin exists
$hasOriginNow = git remote | Select-String -Pattern "^origin$" -Quiet
if ($hasOriginNow) {
  git push -u origin $Branch
} else {
  Write-Host "No remote named 'origin' configured. Provide -Remote to set it, e.g.:"
  Write-Host "  .\\scripts\\push-to-github.ps1 -Remote https://github.com/USER/REPO.git -Branch main -Message 'initial commit'"
}
