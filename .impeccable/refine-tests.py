from pathlib import Path
p=Path('backend/src/test/java/com/joaocuculo/letterbooks/BookSpecificationsTests.java');s=p.read_text(encoding='utf-8');s=s.replace('    @Test\n    void authorFilterUsesAuthorNamesMapping()', '''    @Test
    void bookshelfMembershipQueryUsesCompositeItemMapping() throws NoSuchMethodException {
        var method = com.joaocuculo.letterbooks.repositories.BookshelfRepository.class.getMethod(
                "findMembershipsByUserIdAndGoogleBooksId", Long.class, String.class);
        var annotation = method.getAnnotation(org.springframework.data.jpa.repository.Query.class);
        try (var session = sessionFactory.openSession()) {
            var query = session.createQuery(annotation.value(),
                    com.joaocuculo.letterbooks.dto.response.BookshelfMembershipDTO.class);
            query.setParameter("userId", 42L);
            query.setParameter("googleBooksId", "duna");
            assertEquals(42L, query.getParameterValue("userId"));
            assertEquals("duna", query.getParameterValue("googleBooksId"));
        }
    }

    @Test
    void authorFilterUsesAuthorNamesMapping()''');p.write_text(s,encoding='utf-8')
p=Path('.impeccable/review/book-details-check.html');s=p.read_text(encoding='utf-8');s=s.replace(" else if(config.url.startsWith('/ratings'))", " else if(config.url.startsWith('/bookshelves/'))data=mode==='new'?[]:[{id:3,name:'Clássicos'},{id:4,name:'Para reler'}];\n else if(config.url.startsWith('/ratings')&&config.method==='delete'){if(mode==='save-error')reject('Não foi possível excluir sua avaliação.');mine=null;ratings=ratings.filter(r=>r.id!==90);status=204;}\n else if(config.url.startsWith('/ratings'))");p.write_text(s,encoding='utf-8');Path('frontend/book-details-check.html').write_text(s,encoding='utf-8')
