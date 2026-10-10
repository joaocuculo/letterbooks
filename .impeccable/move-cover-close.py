from pathlib import Path
p=Path('frontend/src/styles/book-details.css'); s=p.read_text(encoding='utf-8');s=s.replace('''.book-lightbox {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 101;
    width: max-content;
    max-width: calc(100vw - 48px);
    outline: none;
}''','''.book-lightbox {
    position: fixed;
    inset: 0;
    z-index: 101;
    display: grid;
    place-items: center;
    pointer-events: none;
    outline: none;
}''').replace('''.book-lightbox img {
    display: block;
    max-width: 100%;''','''.book-lightbox img {
    display: block;
    pointer-events: auto;
    max-width: calc(100vw - 48px);''').replace('''.book-lightbox-close {
    position: absolute;
    top: 8px;
    right: 8px;''','''.book-lightbox-close {
    position: fixed;
    top: max(16px, env(safe-area-inset-top));
    right: max(16px, env(safe-area-inset-right));
    pointer-events: auto;''');p.write_text(s,encoding='utf-8')
p=Path('docs/book-details.md');s=p.read_text(encoding='utf-8');s+='\nO botão de fechar a capa ampliada fica fixo no canto superior direito da tela, com afastamento de 16px e respeito à área segura do dispositivo.\n';p.write_text(s,encoding='utf-8')
