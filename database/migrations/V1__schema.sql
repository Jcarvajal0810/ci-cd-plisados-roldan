-- Schema for the Plisados Roldán informational website.
-- Every rule marked [DB] in specs/001-business-info-site/data-model.md is enforced here.

CREATE TABLE image (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    storage_key       uuid         NOT NULL UNIQUE,
    original_filename varchar(255) NOT NULL,
    width             integer      NOT NULL CHECK (width > 0),
    height            integer      NOT NULL CHECK (height > 0),
    alt_text          varchar(150),
    created_at        timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE offering (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug                varchar(100) NOT NULL UNIQUE,
    name                varchar(80)  NOT NULL CHECK (btrim(name) <> ''),
    summary             varchar(200) NOT NULL CHECK (btrim(summary) <> ''),
    description         text         NOT NULL CHECK (btrim(description) <> '' AND length(description) <= 5000),
    reference_price_cop bigint       CHECK (reference_price_cop > 0),
    display_order       integer      NOT NULL CHECK (display_order >= 1),
    published           boolean      NOT NULL DEFAULT false,
    created_at          timestamptz  NOT NULL DEFAULT now(),
    updated_at          timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE offering_image (
    offering_id bigint  NOT NULL REFERENCES offering (id) ON DELETE CASCADE,
    image_id    bigint  NOT NULL UNIQUE REFERENCES image (id) ON DELETE CASCADE,
    position    integer NOT NULL CHECK (position >= 1),
    PRIMARY KEY (offering_id, image_id),
    CONSTRAINT offering_image_position_uq UNIQUE (offering_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE success_case (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug          varchar(100) NOT NULL UNIQUE,
    title         varchar(120) NOT NULL CHECK (btrim(title) <> ''),
    client_name   varchar(120) NOT NULL CHECK (btrim(client_name) <> ''),
    description   text         NOT NULL CHECK (btrim(description) <> '' AND length(description) <= 5000),
    event_label   varchar(120),
    event_date    date,
    display_order integer      NOT NULL CHECK (display_order >= 1),
    featured      boolean      NOT NULL DEFAULT false,
    published     boolean      NOT NULL DEFAULT false,
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE success_case_image (
    success_case_id bigint  NOT NULL REFERENCES success_case (id) ON DELETE CASCADE,
    image_id        bigint  NOT NULL UNIQUE REFERENCES image (id) ON DELETE CASCADE,
    position        integer NOT NULL CHECK (position >= 1),
    PRIMARY KEY (success_case_id, image_id),
    CONSTRAINT success_case_image_position_uq UNIQUE (success_case_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE success_case_offering (
    success_case_id bigint NOT NULL REFERENCES success_case (id) ON DELETE CASCADE,
    offering_id     bigint NOT NULL REFERENCES offering (id) ON DELETE CASCADE,
    PRIMARY KEY (success_case_id, offering_id)
);

CREATE TABLE testimonial (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_name    varchar(120) NOT NULL CHECK (btrim(client_name) <> ''),
    company        varchar(120),
    quote          varchar(600) NOT NULL CHECK (btrim(quote) <> ''),
    photo_image_id bigint UNIQUE REFERENCES image (id) ON DELETE SET NULL,
    display_order  integer      NOT NULL CHECK (display_order >= 1),
    featured       boolean      NOT NULL DEFAULT false,
    published      boolean      NOT NULL DEFAULT false,
    created_at     timestamptz  NOT NULL DEFAULT now(),
    updated_at     timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE business_profile (
    id              smallint PRIMARY KEY CHECK (id = 1),
    business_name   varchar(80)  NOT NULL CHECK (btrim(business_name) <> ''),
    slogan          varchar(120) NOT NULL,
    about_text      text         NOT NULL CHECK (length(about_text) <= 8000),
    whatsapp_number varchar(15)  NOT NULL CHECK (whatsapp_number ~ '^[0-9]{10,15}$'),
    location_text   varchar(200) NOT NULL,
    schedule_text   varchar(300) NOT NULL,
    updated_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE TABLE admin_user (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         varchar(254) NOT NULL,
    password_hash varchar(100) NOT NULL,
    created_at    timestamptz  NOT NULL DEFAULT now(),
    last_login_at timestamptz
);

CREATE UNIQUE INDEX admin_user_email_lower_uq ON admin_user (lower(email));
