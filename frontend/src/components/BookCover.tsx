import { useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { BookOpen, X } from 'lucide-react';

export default function BookCover({
    src,
    title,
}: {
    src?: string;
    title: string;
}) {
    const [broken, setBroken] = useState(false);
    return (
        <div className="book-cover">
            {src && !broken ? (
                <Dialog.Root>
                    <Dialog.Trigger
                        className="book-cover-button"
                        aria-label={`Ampliar capa de ${title}`}
                    >
                        <img
                            src={src}
                            alt={`Capa de ${title}`}
                            referrerPolicy="no-referrer"
                            onError={() => setBroken(true)}
                        />
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Backdrop className="book-lightbox-overlay" />
                        <Dialog.Popup className="book-lightbox">
                            <Dialog.Title className="book-visually-hidden">
                                Capa de {title}
                            </Dialog.Title>
                            <Dialog.Close
                                className="book-lightbox-close"
                                aria-label="Fechar imagem"
                            >
                                <X size={22} aria-hidden="true" />
                            </Dialog.Close>
                            <img
                                src={src}
                                alt={`Capa ampliada de ${title}`}
                                referrerPolicy="no-referrer"
                            />
                        </Dialog.Popup>
                    </Dialog.Portal>
                </Dialog.Root>
            ) : (
                <div className="book-cover-fallback">
                    <BookOpen size={32} aria-hidden="true" />
                    <span>Capa indisponível</span>
                </div>
            )}
        </div>
    );
}
