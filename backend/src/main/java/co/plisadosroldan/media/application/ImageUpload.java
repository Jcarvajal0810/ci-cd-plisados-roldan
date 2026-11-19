package co.plisadosroldan.media.application;

/**
 * An uploaded file as received from the owner.
 *
 * @param size declared size in bytes (checked before decoding)
 * @param altText optional alternative text
 */
public record ImageUpload(byte[] bytes, String originalFilename, long size, String altText) {}
