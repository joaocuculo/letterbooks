package com.joaocuculo.letterbooks;

import com.joaocuculo.letterbooks.repositories.BookshelfItemRepository;
import jakarta.persistence.Entity;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.data.jpa.repository.Query;

class BookshelfQueryTests {
    @Test void groupedCountsLimitedPreviewsAndPaginationQueriesCompileWithoutDatabaseAccess() throws Exception {
        var registry=new StandardServiceRegistryBuilder()
            .applySetting("hibernate.dialect","org.hibernate.dialect.PostgreSQLDialect")
            .applySetting("hibernate.boot.allow_jdbc_metadata_access",false)
            .applySetting("hibernate.connection.provider_class","org.hibernate.engine.jdbc.connections.internal.UserSuppliedConnectionProviderImpl")
            .applySetting("hibernate.hbm2ddl.auto","none").build();
        try {
            var metadata=new MetadataSources(registry);
            var scanner=new ClassPathScanningCandidateComponentProvider(false);scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));
            for(var definition:scanner.findCandidateComponents("com.joaocuculo.letterbooks.entities"))metadata.addAnnotatedClass(Class.forName(definition.getBeanClassName()));
            try(var factory=metadata.buildMetadata().buildSessionFactory();var session=factory.openSession()) {
                for(var method:BookshelfItemRepository.class.getDeclaredMethods()) {
                    var query=method.getAnnotation(Query.class);
                    if(query!=null){
                        if(method.isAnnotationPresent(org.springframework.data.jpa.repository.Modifying.class)) session.createMutationQuery(query.value());
                        else session.createQuery(query.value(),Object.class);
                        if(!query.countQuery().isEmpty())session.createQuery(query.countQuery(),Long.class);
                    }
                }
            }
        } finally {StandardServiceRegistryBuilder.destroy(registry);}
    }
}
