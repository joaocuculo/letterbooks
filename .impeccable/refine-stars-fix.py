from pathlib import Path
p=Path('frontend/src/components/StarRating.tsx');s=p.read_text(encoding='utf-8');s=s.replace('onFocus={() => setPreview(star)}','onFocus={() => setPreview(null)}').replace('autoFocus={star === (Number(value) || 1)}', "autoFocus={star === (value === '' ? 1 : Number(value))}")
s=s.replace('onChange={() => onChange(\'0\')}', "onChange={() => onChange('0')}\n                        autoFocus={value === '0'}\n                        onFocus={() => setPreview(null)}")
p.write_text(s,encoding='utf-8')
p=Path('frontend/src/styles/book-details.css');s=p.read_text(encoding='utf-8');s+='''
.book-star-field input[type='radio'] {width:16px; height:16px; min-height:0; padding:0; margin:0; appearance:auto; border:0; border-radius:0; flex-shrink:0;}
.book-star-field .book-visually-hidden {width:1px; height:1px;}
.book-zero-rating {white-space:nowrap;}
''';p.write_text(s,encoding='utf-8')
