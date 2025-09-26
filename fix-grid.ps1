# Fix Grid sizing props in all components
$files = @(
    'src\components\AnalyticsDashboard.tsx',
    'src\components\DocumentManager.tsx', 
    'src\components\UserProfile.tsx'
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Fix patterns with xs, sm, md
    $content = $content -replace '<Grid xs=(\d+) sm=(\d+) md=(\d+)', '<Grid size={{ xs: $1, sm: $2, md: $3 }}'
    
    # Fix patterns with xs, md
    $content = $content -replace '<Grid xs=(\d+) md=(\d+)', '<Grid size={{ xs: $1, md: $2 }}'
    
    # Fix patterns with xs, sm
    $content = $content -replace '<Grid xs=(\d+) sm=(\d+)', '<Grid size={{ xs: $1, sm: $2 }}'
    
    # Fix patterns with just xs
    $content = $content -replace '<Grid xs=(\d+)(?!\s*[sm])', '<Grid size={{ xs: $1 }}'
    
    Set-Content $file $content
    Write-Host "Fixed $file"
}