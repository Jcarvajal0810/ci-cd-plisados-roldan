package co.plisadosroldan.shared.infrastructure;

import java.nio.file.Path;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application settings bound from {@code app.*}.
 *
 * @param mediaRoot directory where image variants are stored (research R8)
 * @param publicBaseUrl absolute public URL used in the sitemap and Open Graph tags
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Path mediaRoot, String publicBaseUrl) {}
