$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$productRoot = 'F:\2026作品集文件\素材\产品图'
$renderRoot = 'F:\2026作品集文件\素材\渲染图'
$outputRoot = Join-Path $projectRoot 'public\images\c4d-gallery'
$manifestPath = Join-Path $projectRoot 'src\data\c4dGallery.json'
$maxEdge = 2560
$jpegQuality = 88L

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $manifestPath) | Out-Null

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' } |
  Select-Object -First 1
$qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($qualityEncoder, $jpegQuality)

function Get-NaturalSortKey([string]$value) {
  return [regex]::Replace($value.ToLowerInvariant(), '\d+', { param($match) $match.Value.PadLeft(12, '0') })
}

function Get-Images([string]$root, [bool]$excludeTextureMaps) {
  if (-not (Test-Path -LiteralPath $root -PathType Container)) {
    throw "素材目录不存在：$root"
  }
  $files = Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $_.Extension -match '^\.(png|jpe?g|bmp|tif|tiff)$' -and
    (-not $excludeTextureMaps -or $_.FullName -notmatch '[\\/]tex[\\/]')
  }
  return @($files | Sort-Object @{ Expression = { Get-NaturalSortKey ($_.FullName.Substring($root.Length)) } })
}

function Save-OptimizedImage($sourceFile, [string]$destination) {
  $source = [System.Drawing.Image]::FromFile($sourceFile.FullName)
  $canvas = $null
  $graphics = $null
  try {
    # Respect common EXIF orientation values before measuring and drawing.
    if ($source.PropertyIdList -contains 0x0112) {
      $orientation = [int]$source.GetPropertyItem(0x0112).Value[0]
      switch ($orientation) {
        2 { $source.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
        3 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        4 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
        5 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
        6 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        7 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
        8 { $source.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
      }
    }

    $scale = [Math]::Min(1.0, $maxEdge / [double][Math]::Max($source.Width, $source.Height))
    $width = [Math]::Max(1, [int][Math]::Round($source.Width * $scale))
    $height = [Math]::Max(1, [int][Math]::Round($source.Height * $scale))
    $canvas = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $canvas.SetResolution(96, 96)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.Clear([System.Drawing.Color]::White)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($source, 0, 0, $width, $height)
    $canvas.Save($destination, $jpegEncoder, $encoderParameters)

    return [pscustomobject]@{
      width = $width
      height = $height
      ratio = [Math]::Round($width / [double]$height, 5)
    }
  }
  finally {
    if ($graphics) { $graphics.Dispose() }
    if ($canvas) { $canvas.Dispose() }
    $source.Dispose()
  }
}

$sources = @()
$sources += Get-Images $productRoot $true | ForEach-Object { [pscustomobject]@{ File = $_; Group = 'product' } }
$sources += Get-Images $renderRoot $false | ForEach-Object { [pscustomobject]@{ File = $_; Group = 'render' } }
if (-not $sources.Count) { throw '两个素材目录里没有找到支持的图片。' }

# Remove stale generated images so the manifest and asset folder stay in sync.
Get-ChildItem -LiteralPath $outputRoot -File -Filter '*.jpg' -ErrorAction SilentlyContinue | Remove-Item -Force
$items = [System.Collections.Generic.List[object]]::new()
$productIndex = 0
$renderIndex = 0
$completed = 0
foreach ($entry in $sources) {
  if ($entry.Group -eq 'product') {
    $productIndex += 1
    $number = $productIndex.ToString('000')
    $prefix = 'product'
    $altPrefix = '产品建模与渲染'
  } else {
    $renderIndex += 1
    $number = $renderIndex.ToString('000')
    $prefix = 'render'
    $altPrefix = '产品视觉渲染'
  }

  $name = "$prefix-$number.jpg"
  $destination = Join-Path $outputRoot $name
  $dimensions = Save-OptimizedImage $entry.File $destination
  $items.Add([pscustomobject]@{
    src = "/images/c4d-gallery/$name"
    alt = "$altPrefix：$($entry.File.BaseName)"
    category = $entry.Group
    width = $dimensions.width
    height = $dimensions.height
    ratio = $dimensions.ratio
  })
  $completed += 1
  if ($completed % 10 -eq 0 -or $completed -eq $sources.Count) {
    Write-Progress -Activity '优化 C4D 作品图片' -Status "$completed / $($sources.Count)" -PercentComplete (($completed / $sources.Count) * 100)
  }
}

$json = $items | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($manifestPath, $json, [System.Text.UTF8Encoding]::new($false))
$totalBytes = (Get-ChildItem -LiteralPath $outputRoot -File | Measure-Object Length -Sum).Sum
Write-Progress -Activity '优化 C4D 作品图片' -Completed
Write-Output "完成：$completed 张图片，产品图 $productIndex 张，渲染图 $renderIndex 张，输出约 $([Math]::Round($totalBytes / 1MB, 1)) MB。"
Write-Output "清单：$manifestPath"
