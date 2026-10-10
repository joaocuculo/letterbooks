from pathlib import Path
root=Path('C:/Projetos/letterbooks')
def write(p,s): (root/p).write_text(s,encoding='utf-8')
def edit(p,fn):
 f=root/p; f.write_text(fn(f.read_text(encoding='utf-8')),encoding='utf-8')
write('frontend/src/components/BookCover.tsx', '''import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { BookOpen, X } from 'lucide-react';

export default function BookCover({src, title}: {src?: string; title: string}) {
 const [broken, setBroken] = useState(false);
 return <div className="book-cover">{src && !broken ? <Dialog.Root>
  <Dialog.Trigger className="book-cover-button" aria-label={`Ampliar capa de ${title}`}>
   <img src={src} alt={`Capa de ${title}`} referrerPolicy="no-referrer" onError={() => setBroken(true)} />
  </Dialog.Trigger>
  <Dialog.Portal><Dialog.Backdrop className="book-lightbox-overlay" />
   <Dialog.Popup className="book-lightbox">
    <Dialog.Title className="book-visually-hidden">Capa de {title}</Dialog.Title>
    <Dialog.Close className="book-lightbox-close" aria-label="Fechar imagem"><X size={22} aria-hidden="true" /></Dialog.Close>
    <img src={src} alt={`Capa ampliada de ${title}`} referrerPolicy="no-referrer" />
   </Dialog.Popup>
  </Dialog.Portal>
 </Dialog.Root> : <div className="book-cover-fallback"><BookOpen size={32} aria-hidden="true" /><span>Capa indisponível</span></div>}</div>;
}
''')
write('frontend/src/components/StarRating.tsx', '''import { useState } from 'react';
import { Star } from 'lucide-react';

export function RatingStars({score}: {score: number}) {
 return <span className="book-stars" aria-label={`${score} de 5 estrelas`} role="img">{[1,2,3,4,5].map(value => <Star key={value} size={15} fill={value <= score ? 'currentColor' : 'none'} aria-hidden="true" />)}</span>;
}
export default function StarRating({value, onChange, disabled, invalid}: {value: string; onChange: (value: string) => void; disabled: boolean; invalid: boolean}) {
 const [preview, setPreview] = useState<number | null>(null);
 const active = preview ?? Number(value || 0);
 return <fieldset className="book-star-field" disabled={disabled} aria-describedby={invalid ? 'rating-score-error' : undefined} aria-invalid={invalid}>
  <legend>Sua nota</legend><div className="book-star-options" onMouseLeave={() => setPreview(null)}>
   {[1,2,3,4,5].map(star => <label key={star} className="book-star-option" onMouseEnter={() => !disabled && setPreview(star)}>
    <input className="book-visually-hidden" type="radio" name="rating-score" value={star} checked={value === String(star)} onChange={() => onChange(String(star))} onFocus={() => setPreview(star)} onBlur={() => setPreview(null)} aria-label={`${star} de 5 estrelas`} autoFocus={star === (Number(value) || 1)} />
    <Star size={27} fill={star <= active ? 'currentColor' : 'none'} aria-hidden="true" />
   </label>)}
   <label className="book-zero-rating"><input type="radio" name="rating-score" value="0" checked={value === '0'} onChange={() => onChange('0')} /> Sem estrelas</label>
  </div>
 </fieldset>;
}
''')
edit('frontend/src/components/RatingForm.tsx',lambda s: s.replace("import type { RatingResponse", "import StarRating from './StarRating';\nimport type { RatingResponse").replace(s[s.index('                <label htmlFor="rating-score">'):s.index('                {validationMessage &&')],'''                <StarRating value={score} onChange={(value) => {setScore(value); setValidationMessage(null);}} disabled={isSaving} invalid={Boolean(validationMessage)} />
'''))
edit('frontend/src/components/BookRelationshipControls.tsx',lambda s: s.replace('Heart, Trash2, PenLine','Heart, Trash2').replace('    onRate: () => void;\n    hasRating: boolean;\n    ratingOpen: boolean;\n','').replace('    onRate,\n    hasRating,\n    ratingOpen,\n','').replace(s[s.index('            <button\n                type="button"\n                className="book-primary book-rating-trigger"'):s.index('            {userBook &&')],''))
edit('frontend/src/components/RatingsList.tsx',lambda s: s.replace("import { Star } from 'lucide-react';", "import { Ellipsis, Pencil, Trash2 } from 'lucide-react';\nimport { Menu } from '@base-ui/react/menu';\nimport { RatingStars } from './StarRating';").replace('    own = false,','    own = false,\n    onEdit,\n    onDelete,').replace('    own?: boolean;','    own?: boolean;\n    onEdit?: () => void;\n    onDelete?: () => void;').replace(s[s.index('                <span\n                    className="book-rating-score"'):s.index('            </div>\n            {rating.comment')],'''                <div className="book-rating-score"><RatingStars score={rating.score} /></div>
                {own && onEdit && onDelete && <Menu.Root><Menu.Trigger className="book-icon-button" aria-label="Opções da sua avaliação"><Ellipsis size={20} aria-hidden="true" /></Menu.Trigger>
                 <Menu.Portal><Menu.Positioner sideOffset={6} align="end"><Menu.Popup className="book-rating-menu">
                  <Menu.Item onClick={onEdit}><Pencil size={15} aria-hidden="true" />Editar avaliação</Menu.Item>
                  <Menu.Item onClick={onDelete} className="book-danger"><Trash2 size={15} aria-hidden="true" />Excluir avaliação</Menu.Item>
                 </Menu.Popup></Menu.Positioner></Menu.Portal>
                </Menu.Root>}
'''))
edit('frontend/src/services/ratingService.ts',lambda s:s+'\nexport async function remove(ratingId: number): Promise<void> {\n await api.delete(`/ratings/${ratingId}`);\n}\n')
write('frontend/src/services/bookshelfService.ts','''import { api } from './api';
export interface BookshelfMembership {id: number; name: string;}
export async function findMineByGoogleBooksId(googleBooksId: string, signal?: AbortSignal): Promise<BookshelfMembership[]> {
 const response = await api.get<BookshelfMembership[]>(`/bookshelves/book/google/${encodeURIComponent(googleBooksId)}/me`, {signal});
 return response.data;
}
''')
base='backend/src/main/java/com/joaocuculo/letterbooks/'
write(base+'dto/response/BookshelfMembershipDTO.java','''package com.joaocuculo.letterbooks.dto.response;

public record BookshelfMembershipDTO(Long id, String name) {
}
''')
edit(base+'repositories/BookshelfRepository.java',lambda s:s.replace('import com.joaocuculo.letterbooks.entities.Bookshelf;', '''import com.joaocuculo.letterbooks.entities.Bookshelf;
import com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;''').replace('\n}', '''
    @Query("""
            select distinct new com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO(s.id, s.name)
            from Bookshelf s join s.items item
            where s.user.id = :userId and item.id.book.googleBooksId = :googleBooksId
            order by s.name
            """)
    List<BookshelfMembershipDTO> findMembershipsByUserIdAndGoogleBooksId(
            @Param("userId") Long userId, @Param("googleBooksId") String googleBooksId);
}
'''))
edit(base+'services/BookshelfService.java',lambda s:s.replace('import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;', 'import com.joaocuculo.letterbooks.dto.response.BookshelfResponseDTO;\nimport com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO;').replace('    public BookshelfResponseDTO findById', '''    public List<BookshelfMembershipDTO> findMineByGoogleBooksId(Long userId, String googleBooksId) {
        return bookshelfRepository.findMembershipsByUserIdAndGoogleBooksId(userId, googleBooksId);
    }

    public BookshelfResponseDTO findById'''))
edit(base+'controllers/BookshelfController.java',lambda s:s.replace('import java.net.URI;', 'import java.net.URI;\nimport java.util.List;\nimport com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO;').replace('    @GetMapping(value = "/{id}")', '''    @GetMapping(value = "/book/google/{googleBooksId}/me")
    public ResponseEntity<List<BookshelfMembershipDTO>> findMineByGoogleBooksId(
            @PathVariable String googleBooksId, @AuthenticationPrincipal JWTUserData user) {
        return ResponseEntity.ok().body(bookshelfService.findMineByGoogleBooksId(user.userId(), googleBooksId));
    }

    @GetMapping(value = "/{id}")'''))
