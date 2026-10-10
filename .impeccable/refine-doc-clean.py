from pathlib import Path
for name in ['DESIGN.md','backend/src/main/java/com/joaocuculo/letterbooks/repositories/BookshelfRepository.java','docs/book-details.md']:
 p=Path(name); s=p.read_text(encoding='utf-8').rstrip()+'\n';s=s.replace('fonte de 16px do radio em telas menores','dimensões indevidas herdadas pelo radio da nota zero').replace('A ação de avaliar informa `aria-expanded` e controla o formulário. ','');p.write_text(s,encoding='utf-8')
