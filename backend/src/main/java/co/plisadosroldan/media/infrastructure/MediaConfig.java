package co.plisadosroldan.media.infrastructure;

import co.plisadosroldan.media.domain.ImageStorage;
import co.plisadosroldan.shared.infrastructure.AppProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class MediaConfig {

  @Bean
  ImageStorage imageStorage(AppProperties properties) {
    return new FileSystemImageStorage(properties.mediaRoot());
  }
}
