package co.plisadosroldan.auth.domain;

/** The site owner's admin account. {@code passwordHash} is a BCrypt hash, never plain text. */
public record AdminUser(long id, String email, String passwordHash) {}
