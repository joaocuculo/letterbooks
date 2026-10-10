from pathlib import Path
p=Path('frontend/src/pages/BookDetailsPage.tsx');s=p.read_text(encoding='utf-8')
s=s.replace('ArrowLeft, BookOpen, RefreshCw','ArrowLeft, RefreshCw').replace("import axios from 'axios';","import axios from 'axios';\nimport { Dialog } from '@base-ui/react/dialog';\nimport BookCover from '../components/BookCover';\nimport { findMineByGoogleBooksId, type BookshelfMembership } from '../services/bookshelfService';\nimport { userBookStatusLabels } from '../utils/userBookStatus';")
s=s.replace('    findMyRating,','    findMyRating,\n    remove as removeRating,')
a=s.index('const models ='); b=s.index('function Retry',a); s=s[:a]+s[b:]
s=s.replace("    const [model, setModel] = useState<Model>('library');",'''    const [shelves, setShelves] = useState<BookshelfMembership[]>([]);
    const [shelvesError, setShelvesError] = useState('');
    const [shelvesBusy, setShelvesBusy] = useState(isAuthenticated);
    const [shelvesRetry, setShelvesRetry] = useState(0);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingRating, setDeletingRating] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const ratingTitle = useRef<HTMLHeadingElement>(null);''')
s=s.replace('    const [coverBroken, setCoverBroken] = useState(false);\n','')
s=s.replace('useRemoveUserBook({ onRemoved: () => setUserBook(null) });','useRemoveUserBook({ onRemoved: () => {setUserBook(null); setShelvesRetry(value => value + 1);} });')
a=s.index('    useEffect(() => {\n        if (!sidebar.current)'); s=s[:a]+'''    useEffect(() => {
        if (!googleBooksId || !isAuthenticated) return;
        const controller = new AbortController();
        async function load() {
            setShelvesBusy(true); setShelvesError('');
            try {
                const result = await findMineByGoogleBooksId(googleBooksId!, controller.signal);
                if (!controller.signal.aborted) setShelves(result);
            } catch (error) {
                if (!controller.signal.aborted && !axios.isCancel(error)) setShelvesError(getApiErrorMessage(error, 'Não foi possível carregar suas estantes.'));
            } finally { if (!controller.signal.aborted) setShelvesBusy(false); }
        }
        void load(); return () => controller.abort();
    }, [googleBooksId, isAuthenticated, shelvesRetry]);

    async function deleteRating() {
        if (!myRating) return;
        setDeletingRating(true); setDeleteError('');
        try {
            await removeRating(myRating.id);
            setRatingsPage(previous => {
                if (!previous) return previous;
                const totalElements = Math.max(0, previous.page.totalElements - 1);
                return {content: previous.content.filter(rating => rating.id !== myRating.id), page: {...previous.page, totalElements, totalPages: Math.ceil(totalElements / previous.page.size)}};
            });
            setMyRating(null); setDeleteOpen(false); setRatingSuccess('Sua avaliação foi excluída.');
        } catch (error) {setDeleteError(getApiErrorMessage(error, 'Não foi possível excluir sua avaliação.'));}
        finally {setDeletingRating(false);}
    }

'''+s[a:]
s=s.replace('}, [book, model]);','}, [book]);')
s=s.replace("document\n                .querySelector<HTMLButtonElement>('.book-rating-trigger')\n                ?.focus()",'ratingTitle.current?.focus()').replace("document\n                    .querySelector<HTMLButtonElement>('.book-rating-trigger')\n                    ?.focus()",'ratingTitle.current?.focus()')
a=s.index('                    <div\n                        className="book-models"');b=s.index('                </div>\n                {!googleBooksId',a);s=s[:a]+s[b:]
s=s.replace('className={`book-layout book-layout-${model}`}','className="book-layout book-layout-library"')
a=s.index('                            <div className="book-cover">');b=s.index('                            <div className="book-actions">',a);s=s[:a]+'''                            <BookCover src={cover} title={book.title} />
'''+s[b:]
s=s.replace('                                        onRate={openRating}\n                                        hasRating={Boolean(myRating)}\n                                        ratingOpen={ratingOpen}\n','')
s=s.replace('                            </dl>\n                        </section>', '''                            </dl>
                            {isAuthenticated && (shelvesBusy ? <p className="book-muted" role="status">Carregando suas estantes...</p> : shelvesError ? <Retry error={shelvesError} onRetry={() => setShelvesRetry(value => value + 1)} /> : ((userBook?.status || userBook?.isFavorite || shelves.length > 0) && <section className="book-shelves" aria-label="Presença nas suas estantes">
                              <h3>Na sua biblioteca</h3>
                              {(userBook?.status || userBook?.isFavorite) && <div><p className="book-muted">Agrupamentos de leitura</p><div className="book-shelf-names">{userBook?.status && <span>{userBookStatusLabels[userBook.status]}</span>}{userBook?.isFavorite && <span>Favoritos</span>}</div></div>}
                              {shelves.length > 0 && <div><p className="book-muted">Estantes personalizadas</p><div className="book-shelf-names">{shelves.map(shelf => <span key={shelf.id}>{shelf.name}</span>)}</div></div>}
                            </section>))}
                        </section>''')
s=s.replace('<h2>Sua avaliação</h2>','<h2 ref={ratingTitle} tabIndex={-1}>Sua avaliação</h2>')
a=s.index('                                        <RatingEntry rating={myRating} own />'); b=s.index('                                    </>',a);s=s[:a]+'''                                        <RatingEntry rating={myRating} own onEdit={openRating} onDelete={() => {setDeleteError(''); setDeleteOpen(true);}} />
'''+s[b:]
s=s.replace('            </main>','''            </main>
            <Dialog.Root open={deleteOpen} onOpenChange={open => {if (!deletingRating) setDeleteOpen(open);}}>
             <Dialog.Portal><Dialog.Backdrop className="book-dialog-overlay" /><Dialog.Popup className="landing book-delete-dialog" finalFocus={ratingTitle} aria-busy={deletingRating}>
              <Dialog.Title>Excluir avaliação?</Dialog.Title>
              <Dialog.Description>Sua nota e seu comentário serão removidos. O livro continuará na sua biblioteca.</Dialog.Description>
              {deleteError && <p className="book-error" role="alert">{deleteError}</p>}
              <div className="book-form-actions"><Dialog.Close className="book-secondary" disabled={deletingRating}>Cancelar</Dialog.Close><button type="button" className="book-delete-confirm" disabled={deletingRating} onClick={() => void deleteRating()}>{deletingRating ? 'Excluindo...' : 'Excluir avaliação'}</button></div>
             </Dialog.Popup></Dialog.Portal>
            </Dialog.Root>''')
p.write_text(s,encoding='utf-8')
p=Path('frontend/src/styles/book-details.css');s=p.read_text(encoding='utf-8');s+='''
/* Biblioteca consolidada: avaliações e ações pessoais. */
.book-cover-button {display:block; width:100%; background:transparent; border:0; padding:0; cursor:zoom-in; border-radius:5px;}
.book-relationship-row {padding:16px; background:#f5f6f5; border-radius:14px;}
.book-relationship-row .book-secondary {order:2; border-color:#d5d8d7; background:white;}
.book-status-field {width:100%;}
.book-relationship > .book-text-button {color:#606565; font-size:11px !important;}
.book-rating-entry {background:#f3f4f3; border:0; padding:20px; border-radius:14px; margin-bottom:14px;}
.book-reader-avatar {background:#e5e8e6;}
.book-rating-heading {flex-wrap:wrap;}
.book-stars {display:inline-flex; gap:3px; color:#202323;}
.book-icon-button {display:grid; place-items:center; width:44px; height:44px; border:0; border-radius:9px; background:transparent; cursor:pointer; flex-shrink:0;}
.book-icon-button:hover {background:#e3e6e4;}
.book-rating-menu {min-width:180px; padding:6px; border-radius:12px; background:white; box-shadow:0 8px 24px #0002; z-index:80; font:13px Manrope,sans-serif;}
.book-rating-menu [role=menuitem] {display:flex; align-items:center; gap:10px; min-height:44px; padding:8px 12px; border-radius:8px; cursor:pointer; outline:none;}
.book-rating-menu [data-highlighted] {background:#f1f3f1;}
.book-danger {color:#b42318;}
.book-star-field {border:0; padding:0; margin:0; min-width:0;}
.book-star-field legend {font-weight:650; margin-bottom:8px;}
.book-star-options {display:flex; align-items:center; flex-wrap:wrap; gap:2px;}
.book-star-option {width:44px; height:44px; display:grid; place-items:center; cursor:pointer; position:relative; border-radius:8px; color:#202323;}
.book-star-option:hover {background:#ecefed;}
.book-star-option:has(input:focus-visible) {outline:2px solid #202323; outline-offset:2px;}
.book-star-field:disabled .book-star-option {opacity:.6; cursor:default;}
.book-zero-rating {display:flex; align-items:center; min-height:44px; gap:6px; font-size:12px; margin-left:8px; cursor:pointer;}
.book-zero-rating input {accent-color:#202323;}
.book-visually-hidden {position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0;}
.book-shelves {background:#f3f4f3; padding:20px; border-radius:14px; margin-top:28px;}
.book-shelves h3 {font-size:15px; margin:0 0 14px; font-weight:750;}
.book-shelves > div + div {margin-top:16px;}
.book-shelves .book-muted {font-size:12px; margin-bottom:8px;}
.book-shelf-names {display:flex; flex-wrap:wrap; gap:8px;}
.book-shelf-names span {background:white; border-radius:7px; padding:6px 10px; font-size:12px; overflow-wrap:anywhere; max-width:100%;}
.book-lightbox-overlay,.book-dialog-overlay {position:fixed; inset:0; z-index:100; background:#000d;}
.book-lightbox {position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); z-index:101; width:max-content; max-width:calc(100vw - 48px); outline:none;}
.book-lightbox img {display:block; max-width:100%; width:auto; height:auto; max-height:calc(100dvh - 80px); object-fit:contain; box-shadow:0 16px 48px #0007;}
.book-lightbox-close {position:absolute; top:8px; right:8px; display:grid; place-items:center; width:44px; height:44px; color:white; background:#000b; border:0; border-radius:50%; cursor:pointer;}
.book-dialog-overlay {background:#0008;}
.book-delete-dialog {position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); z-index:101; width:min(420px,calc(100vw - 32px)); padding:24px; border-radius:16px; background:white;}
.book-delete-dialog h2 {font-size:20px; margin-bottom:12px;}
.book-delete-dialog p {line-height:1.7; margin-bottom:20px;}
.book-delete-confirm {border:0; border-radius:10px; background:#b42318; color:white; font-size:13px; min-height:44px; padding:10px 16px; cursor:pointer;}
.book-delete-confirm:hover:not(:disabled) {background:#8e1b12;}
.book-delete-dialog button:disabled {opacity:.6; cursor:default;}
.book-cover-button:focus-visible,.book-lightbox-close:focus-visible,.book-icon-button:focus-visible,.book-delete-dialog button:focus-visible {outline:2px solid currentColor; outline-offset:4px;}
@media(max-width:479px) {.book-rating-score {margin-left:0;} .book-rating-heading > div:nth-child(2) {flex:1;} .book-stars {gap:2px;} .book-rating-entry {padding:16px;} .book-zero-rating {margin-left:0;} }
''';p.write_text(s,encoding='utf-8')
