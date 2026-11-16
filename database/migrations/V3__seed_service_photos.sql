-- Seed photos for the seed services (cropped from the owner's Instagram screenshots).
-- The image files (3 sizes each) ship in backend/seed-media and are copied into the media
-- volume by the media-seed service. Rows that already exist are left untouched.

INSERT INTO image (storage_key, original_filename, width, height, alt_text)
SELECT v.storage_key::uuid, v.original_filename, v.width, v.height, v.alt_text
FROM (VALUES
    ('f810feba-8e93-40e9-8634-54466b1e2278', 'proc-rotonda.jpg', 407, 410, 'Plisado rotonda en tela verde menta, abierto en abanico'),
    ('3a3ab3b3-b7f3-453f-b226-de63ce6085e3', 'proc-acordeon.jpg', 366, 358, 'Plisado acordeón sobre tela estampada'),
    ('32045cc1-8660-4b92-a662-74c126056aa7', 'plisado-blanco.jpg', 291, 314, 'Tela blanca con plisado fino'),
    ('8b0b06d2-da47-4e3e-bb53-bba4a6d57713', 'falda-rosa.jpg', 295, 257, 'Falda rosa con plisado vertical'),
    ('b368e59a-508f-4e5b-93ea-376295dad6eb', 'plisado-metalico.jpg', 291, 283, 'Tela metalizada con plisado fino'),
    ('03624b1b-7d07-45fe-ba7e-151e552b73f7', 'plisado-rosa-verde.jpg', 290, 391, 'Telas plisadas en rosa y verde'),
    ('7ea8b87a-6d83-403c-bc3d-aef56f2b1a9c', 'proc-trillado.jpg', 412, 414, 'Trillado en tela gris con pliegues diagonales'),
    ('c13af2cd-5f04-4baa-9713-9687483f6703', 'proc-trillado-bolero.jpg', 436, 426, 'Trillado bolero en tela gris clara'),
    ('c9a3588d-a469-4880-a011-b27968b0cd92', 'trillado-colores.jpg', 192, 349, 'Telas trilladas en coral, rosa y azul rey'),
    ('1a191f85-7be8-4777-bc0c-39ddfd447f8f', 'proc-craquelado.jpg', 436, 426, 'Craquelado en tela gris con textura ondulada'),
    ('abfc2186-774b-465a-813f-4b19bbed14dc', 'proc-nido-acordeon.jpg', 436, 426, 'Combinado nido de abeja y acordeón en fucsia y azul'),
    ('a33397d8-1f53-47e7-9960-5c36bd365489', 'proc-corte-laser.jpg', 334, 334, 'Máquina de corte láser trabajando sobre tela blanca'),
    ('91427468-aea3-4f7f-bcf9-81a47fb58fce', 'laser-taller.jpg', 288, 276, 'Corte láser en el taller sobre tela clara'),
    ('316e4ce7-c45d-4a87-a31a-9daffded9968', 'plisado-perforado.jpg', 290, 314, 'Tela oscura plisada con perforaciones láser'),
    ('e460b8ba-d7b5-408d-89c7-edb34fcbde32', 'collage-texturas.jpg', 291, 390, 'Muestrario de texturas y acabados en varios colores'),
    ('fb8e1779-f5eb-47c5-b25c-8c804ce6a1da', 'falda-rosa-puesta.jpg', 289, 388, 'Falda plisada rosa Plissee a media pierna'),
    ('32c5257b-2b0b-4cd0-a031-7e8bfe1fd279', 'falda-verde-larga.jpg', 295, 325, 'Falda plisada larga verde'),
    ('b745cd03-8343-4291-a86a-e0a7014ee545', 'falda-azul.jpg', 288, 318, 'Falda plisada azul satinada'),
    ('7f73dd3b-647d-4edf-ab8a-471616a86e58', 'falda-magenta.jpg', 294, 324, 'Falda plisada magenta en maniquí'),
    ('7c5a1fc6-35e8-49a9-8bf6-a88a46d98d08', 'faldas-florales.jpg', 289, 387, 'Faldas plisadas con estampado floral'),
    ('f7752dbd-1408-4456-bb77-a0dfc41a0482', 'faldas-animal-print.jpg', 288, 387, 'Faldas plisadas en animal print y negro metalizado')
) AS v (storage_key, original_filename, width, height, alt_text)
WHERE NOT EXISTS (SELECT 1 FROM image i WHERE i.storage_key = v.storage_key::uuid);

INSERT INTO offering_image (offering_id, image_id, position)
SELECT o.id, i.id, v.position
FROM (VALUES
    ('plisado', 'f810feba-8e93-40e9-8634-54466b1e2278', 1),
    ('plisado', '3a3ab3b3-b7f3-453f-b226-de63ce6085e3', 2),
    ('plisado', '32045cc1-8660-4b92-a662-74c126056aa7', 3),
    ('plisado', '8b0b06d2-da47-4e3e-bb53-bba4a6d57713', 4),
    ('plisado', 'b368e59a-508f-4e5b-93ea-376295dad6eb', 5),
    ('plisado', '03624b1b-7d07-45fe-ba7e-151e552b73f7', 6),
    ('trillado', '7ea8b87a-6d83-403c-bc3d-aef56f2b1a9c', 1),
    ('trillado', 'c13af2cd-5f04-4baa-9713-9687483f6703', 2),
    ('trillado', 'c9a3588d-a469-4880-a011-b27968b0cd92', 3),
    ('craquelado', '1a191f85-7be8-4777-bc0c-39ddfd447f8f', 1),
    ('craquelado', 'abfc2186-774b-465a-813f-4b19bbed14dc', 2),
    ('corte-laser', 'a33397d8-1f53-47e7-9960-5c36bd365489', 1),
    ('corte-laser', '91427468-aea3-4f7f-bcf9-81a47fb58fce', 2),
    ('grabado-laser', '316e4ce7-c45d-4a87-a31a-9daffded9968', 1),
    ('grabado-laser', 'e460b8ba-d7b5-408d-89c7-edb34fcbde32', 2),
    ('linea-plissee', 'fb8e1779-f5eb-47c5-b25c-8c804ce6a1da', 1),
    ('linea-plissee', '32c5257b-2b0b-4cd0-a031-7e8bfe1fd279', 2),
    ('linea-plissee', 'b745cd03-8343-4291-a86a-e0a7014ee545', 3),
    ('linea-plissee', '7f73dd3b-647d-4edf-ab8a-471616a86e58', 4),
    ('linea-plissee', '7c5a1fc6-35e8-49a9-8bf6-a88a46d98d08', 5),
    ('linea-plissee', 'f7752dbd-1408-4456-bb77-a0dfc41a0482', 6)
) AS v (slug, storage_key, position)
JOIN offering o ON o.slug = v.slug
JOIN image i ON i.storage_key = v.storage_key::uuid
WHERE NOT EXISTS (SELECT 1 FROM offering_image x WHERE x.image_id = i.id)
  AND NOT EXISTS (SELECT 1 FROM offering_image x WHERE x.offering_id = o.id AND x.position = v.position);
