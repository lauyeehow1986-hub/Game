# fetch-makehuman-assets.ps1 — download + extract the MakeHuman System Assets
# (CC0) pack so the photoreal cast generator (make-cast-photoreal.py) can apply
# real baked skin textures, fitted clothing, hair and eyes. ~268 MB, one-off per
# machine; the assets are NOT committed (tooling only) — the generated GLBs are.
#
#   powershell -ExecutionPolicy Bypass -File scripts/fetch-makehuman-assets.ps1
$ErrorActionPreference = "Stop"
$url  = "http://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip"
$dest = "C:\Users\lauye\Documents\makehuman_assets"
$zip  = Join-Path $dest "system_assets_cc0.zip"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
if (-not (Test-Path $zip)) {
  Write-Host "[fetch-mh] downloading $url"
  Start-BitsTransfer -Source $url -Destination $zip -DisplayName "MakeHuman system assets"
}
Write-Host "[fetch-mh] downloaded $([math]::Round((Get-Item $zip).Length/1MB,1)) MB; extracting…"
$extract = Join-Path $dest "data"
if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
Expand-Archive -Path $zip -DestinationPath $dest -Force
Write-Host "[fetch-mh] done; top-level dirs:"
Get-ChildItem $dest -Directory | Select-Object -ExpandProperty Name
