-- Exploratory seed content (data-model.md "Seed data"). The owner edits all of it in the admin.

INSERT INTO business_profile (id, business_name, slogan, about_text, whatsapp_number,
                              location_text, schedule_text, updated_at)
VALUES (1,
        'Plisados Roldán',
        'Creando ando, soñando alto',
        'Plisados Roldán es una microempresa de procesos textiles ubicada en Itagüí, Antioquia, en el corazón de la industria de la moda colombiana. Nacimos de la pasión por transformar las telas y darles textura, movimiento y carácter, y hoy acompañamos a diseñadores, marcas y confeccionistas que buscan acabados con un sello diferente.

Nos especializamos en plisado, trillado y craquelado, técnicas que trabajamos en gran parte de forma artesanal, con la precisión y el cuidado que solo dan la experiencia y el trabajo hecho a mano. A estos procesos sumamos el corte y grabado láser, que nos permite ofrecer detalles exactos y diseños personalizados sobre una amplia variedad de materiales. Con nuestra línea Plissee, además, confeccionamos faldas plisadas a la medida, pensadas para cada ocasión y para cada mujer que las lleva.

Cada pieza que sale de nuestro taller refleja nuestra forma de trabajar: atención al detalle, compromiso con los tiempos de nuestros clientes y un profundo respeto por el oficio textil. Nos enorgullece que nuestros acabados hayan llegado a pasarelas y a las colecciones de marcas que confían en nosotros para dar vida a sus ideas.

En Plisados Roldán creemos que la moda se construye entre aliados. Por eso trabajamos de cerca con cada cliente, escuchando su visión y proponiendo soluciones que eleven sus diseños. Seguimos creciendo con la misma convicción que nos inspira desde el primer día: creando ando, soñando alto.',
        '573116254705',
        'Itagüí, Antioquia, Colombia',
        'Lunes a viernes, 8:00 a. m. – 5:00 p. m.',
        now());

INSERT INTO offering (slug, name, summary, description, display_order, published)
VALUES
    ('plisado', 'Plisado',
     'Pliegues precisos que dan movimiento y estructura a tus telas.',
     'Realizamos plisado sobre una amplia variedad de telas, en gran parte de forma artesanal. Trabajamos con diseñadores, marcas y confeccionistas para lograr el pliegue, el tamaño y el acabado que cada colección necesita.',
     1, true),
    ('trillado', 'Trillado',
     'Textura arrugada permanente con carácter artesanal.',
     'El trillado crea una textura irregular y permanente que aporta volumen y personalidad a la prenda. Es un proceso hecho a mano que adaptamos al tipo de tela y al efecto que buscas.',
     2, true),
    ('craquelado', 'Craquelado',
     'Un acabado con efecto quebrado que hace única cada pieza.',
     'El craquelado da a la tela un efecto de superficie quebrada, ideal para piezas con un sello diferente. Te asesoramos sobre las telas que mejor responden a este proceso.',
     3, true),
    ('corte-laser', 'Corte láser',
     'Cortes exactos y diseños personalizados sobre diversos materiales.',
     'Con corte láser logramos bordes limpios y formas complejas con total precisión, sobre telas y otros materiales. Ideal para detalles, aplicaciones y piezas a la medida.',
     4, true),
    ('grabado-laser', 'Grabado láser',
     'Grabados detallados para personalizar telas y materiales.',
     'El grabado láser permite marcar diseños, logos y texturas sobre una amplia variedad de materiales, con detalle fino y resultados consistentes en cada pieza.',
     5, true),
    ('linea-plissee', 'Línea Plissee',
     'Faldas plisadas a la medida, pensadas para cada ocasión.',
     'Con nuestra línea Plissee confeccionamos faldas plisadas a la medida, pensadas para cada ocasión y para cada mujer que las lleva. Escríbenos y diseñamos la tuya.',
     6, true);
