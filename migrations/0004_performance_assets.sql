UPDATE site_content
SET value = replace(
  value,
  'assets/qsl-laterano.webp',
  'assets/qsl-laterano-1400.webp'
)
WHERE key = 'main';

