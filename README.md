# Hablemos coreano

Una app para aprender idiomas conversando con una IA, empezando por el coreano. Es [`index.html`](index.html) más dos archivos que comparte con el lector ([`comun.js`](comun.js) y [`comun.css`](comun.css)): se abre en el navegador, en el computador o en el celular, sin instalar nada.

**Abrirla en línea:** https://rilianx.github.io/idiomas/ (con GitHub Pages activado; así el micrófono funciona en cualquier dispositivo).

> **App hermana: 📚 Leamos** ([`lector.html`](lector.html), en línea en https://rilianx.github.io/idiomas/lector.html): un lector de libros para aprender leyendo. Ver [más abajo](#leamos-lector-de-libros).

## Qué hace

- **Conversar con audio.** Conversas con 지수 (Jisu), una IA que habla a tu nivel. Puedes escribir o hablar: como en WhatsApp, **mantén presionado 🎤** mientras hablas; al soltar, se envía (si 지수 todavía está respondiendo, queda en el cuadro); si deslizas el dedo fuera del botón antes de soltar, se cancela. Si la transcripción falla, un aviso sobre el cuadro explica qué pasó (clave, modelo no disponible, sin saldo, sin conexión…) y, cuando se puede, permite reintentar con la misma grabación. 지수 escribe en tiempo real (su respuesta aparece a medida que se genera) y la voz lee cada oración apenas se completa 🔊 (también se puede oír despacio 🐢). Las respuestas de 지수 son cortas y su largo sigue al tuyo: la app mide cuántas palabras usas en tus últimos mensajes y le da un tope en cada respuesta (si contestas «네», ella responde con una oración breve).
- **Leer y oír.** Cada mensaje se puede leer y escuchar. La traducción al español se muestra al tocar «Traducción». El modo escucha 👂 deja el coreano borroso hasta que lo tocas.
- **Sin traducción por defecto.** Las frases de 지수 y las respuestas sugeridas aparecen solo en coreano.
  - **Pasar el mouse** sobre una palabra (o **tocarla** en el celular) muestra su significado arriba de ella.
  - **Clic** (o **doble toque** en el celular) abre la ficha: significado, romanización, forma de diccionario y qué forma es (por ejemplo, «먹었어요 → 먹다 · -었어요: pasado cortés»). Con «Explicar», el modelo caro da una explicación detallada.
  - La traducción de las respuestas sugeridas (y de las de «Puedes responder» en «Explicar frase») está oculta tras ›; la de un mensaje de 지수, tras «Traducción». En ⚙ Ajustes se puede volver a mostrar el significado encima de las palabras nuevas.
- **Palabras que se llenan.** Cuando respondes a 지수 sin haber mirado el significado de una palabra de su mensaje (ni con el mouse, ni con un toque, ni con «Traducción» o «Explicar frase»), la palabra queda como «ya sé» automáticamente (bajo el mensaje se avisa cuáles) y se llena de a poco: +10 % cada vez, hasta 50 %. Cada vez que la usas tú (escribiendo o hablando) en una frase correcta sube +20 %, hasta 100 %; si 지수 te corrigió la frase, sus palabras no suman. Tampoco suman las palabras que miraste mientras preparabas la respuesta (al pasar el mouse, tocarlas, abrir su ficha, buscarlas en el diccionario o los niveles, ver la traducción o la explicación del mensaje) ni la que preguntas con «…뭐예요?». Marcarla a mano con «Ya la sé» la deja en al menos 50 %. Elegir una respuesta sugerida (tocándola, o con ✏ sin cambiarla) no suma a sus palabras; escribirla o decirla tú, sí. Se ve en la planilla de vocabulario de cada nivel (🎓), en el diccionario y en la ficha de cada palabra.
- **Respuestas sugeridas (conversar sin hablar ni escribir).** Con cada respuesta de 지수, el modelo barato (en un pedido aparte, como «ayudante del estudiante», con la conversación y tu perfil) propone 3 o 4 cosas que podrías decir, con su traducción, que llevan la conversación por caminos distintos (responder, contar algo tuyo, preguntarle a 지수, mostrar un interés, cambiar de tema…), sobre el cuadro de texto. Al tocar una se dice en voz alta y se envía, así que se puede llevar el diálogo eligiendo, como en un juego; con ✏ queda escrita para cambiarla antes de enviar. Se pueden ocultar en ⚙ Ajustes.
- **Palabras nuevas.** Aparecen subrayadas, con su significado encima, hasta que las hayas visto unas veces o marques «Ya la sé».
- **«¿Qué es…?»** Si escribes o dices «사과가 뭐예요?», «먹다는 무슨 뜻이에요?», «¿qué significa 사랑?» o «¿cómo se dice manzana?», la traducción aparece sola en una tarjeta.
- **Diccionario propio** 📖. Cada palabra que aparece, que tocas o que preguntas se guarda. Ahí se puede:
  - ver la definición, la conjugación y las formas que ya viste de cada verbo;
  - buscar en coreano, en español o por una forma conjugada;
  - filtrar (verbos, sustantivos, por aprender, ya sé);
  - exportar e importar el diccionario.
- **Verbos a partir de sus conjugaciones.** La IA de la conversación da la forma de diccionario de cada palabra. Además, la app reconoce sola las formas comunes (presente, pasado, formal, -고, -지만, -세요, -고 싶어요, contracciones como 봐요 y 마셔요, e irregulares como 추워요 → 춥다, 들어요 → 듣다 y 몰라요 → 모르다), y recuerda cada forma que ya vio.
- **Niveles** 🎓. Cada nivel tiene un conjunto de palabras, formas gramaticales (con explicación y ejemplos para escuchar) y temas para practicar. 지수 conversa con el vocabulario y la gramática de tu nivel y de los anteriores, y como mucho agrega una o dos palabras nuevas por mensaje. Los niveles:
  1. Saludos y presentarse
  2. Cosas y lugares
  3. Acciones de cada día (presente)
  4. El pasado y el tiempo
  5. Planes y deseos
  6. Cortesía y conectores
  7. Libre
- **Perfil dinámico** 👤. Mientras conversas, el modelo barato anota lo nuevo que cuentas de ti (nombre, país, trabajo, familia, gustos e intereses), sin llamadas extra; bajo tu mensaje aparece qué se anotó. 지수 recuerda el perfil en todas las conversaciones: no vuelve a preguntar lo que ya sabe, te pregunta por tu vida e intereses, y las respuestas sugeridas proponen temas relacionados. El perfil se ve y se edita en ⚙ Ajustes (borrar, agregar, dejar de aprender).
- **Vocabulario y gramática extendidos.** Cuando en la conversación aparecen palabras o formas gramaticales que no estaban en la lista del nivel (ni de los anteriores), se agregan solas a la parte «extendida» de ese nivel en 🎓: las palabras, con el mismo llenado de avance; las formas gramaticales, con qué expresan, un ejemplo para escuchar y cuántas veces aparecieron (las detecta el modelo barato en la misma respuesta, y también el modelo caro al «Explicar frase»: compara con la gramática ya vista y agrega lo nuevo). 지수 recibe lo extendido y lo reutiliza de vez en cuando para practicarlo. Se puede borrar en ⚙ Ajustes.
- **Decirlo en español.** Si escribes o dices algo en español (entero o mezclado, como «저는 manzana 좋아해요»), bajo tu mensaje aparece cómo se dice en coreano («저는 사과를 좋아해요.»), con 🔊 para oírlo, ✏ para ponerlo en el cuadro, y cada palabra en español con su equivalente (manzana → 사과), que queda en el diccionario. Al hablar también puedes mezclar. **Con el reconocimiento de OpenAI** no hay que elegir idioma: por defecto se transcribe en **una pasada**, sin indicar idioma, explicándole al modelo (en español y en coreano, con ejemplos mezclados) que escriba cada palabra con el alfabeto de su idioma: el coreano en hangul y el español en letras latinas («저는 película를 좋아해요»). Si alguna frase falla, en ⚙ Ajustes se puede elegir **dos pasadas**: el mismo audio se transcribe a la vez esperando coreano y esperando español, el mensaje se envía con la versión coreana y 지수 recibe las dos, y mientras responde el modelo barato las fusiona por significado («película» puede quedar en la coreana como 브로콜리, brócoli, y solo se nota porque en la española dice «película»). Bajo cada mensaje dictado, «ver transcripciones» muestra qué se usó, qué se entendió y cuánto tardó. **Con el reconocimiento del navegador** (que no entrega el audio ni mezcla idiomas), el botón junto a 🎤 elige 한 (coreano; se intenta rescatar el español con una revisión) o ES.
- **Perfil de 지수** 📝. 지수 también tiene su vida: cuando cuenta algo nuevo de sí misma (gustos, familia, mascotas, trabajo, rutina, opiniones), el análisis de su mensaje lo anota (sin llamadas extra) y bajo el mensaje aparece «📝 지수 recordará: …». En cada mensaje recibe lo que ya contó, para ser coherente en todas las conversaciones y retomarlo; las respuestas sugeridas también lo usan, para no preguntarle lo que ya contó. Se ve y se edita en ⚙ Ajustes → Perfil de 지수.
- **Correcciones.** Si lo que escribes tiene errores, el modelo de la conversación muestra debajo la versión correcta («Mejor: …») con una explicación breve y el tipo de error.
  - **«🎓 Explicar error»**: el modelo caro explica qué estaba mal y por qué, da la regla y ejemplos para escuchar. Solo se usa si aprietas el botón.
  - **✍ Mis errores** (en 📖): los errores que pediste explicar quedan guardados (solo esos) y agrupados por tipo (p. ej. «Partícula de objeto 을/를 · 3 veces»), para repasarla, explicarla o marcarla como aprendida.
  - Los tipos de error guardados que se repiten (2 o más veces, sin marcar como aprendidos), 지수 los hace practicar en la conversación con preguntas que te llevan a usar esas formas.

## Dos modelos: uno barato y uno caro

| Para qué | Modelo por defecto | Cuándo se usa |
|---|---|---|
| Conversar, analizar cada palabra y responder «…뭐예요?» | **Claude Haiku 5.5** (o GPT-5.4 mini, o Sonnet 5.5) | En cada mensaje: es rápido |
| Explicaciones | **Claude Opus 5.5** (o Sonnet 5.5, Fable 5.1, GPT-5.4 mini) | **Solo cuando lo pides**: «🎓 Explicar frase» bajo una respuesta, o «Explicar» en una palabra |

Las explicaciones ven los últimos 3 mensajes de la conversación y el nivel, y explican en contexto, no solo traducen. «Explicar frase» da: a qué responde la frase y qué se espera que contestes; una explicación detallada (formas, por qué se usan aquí, registro, matices, datos culturales); respuestas posibles (al tocarlas quedan escritas para enviarlas); la gramática con otro ejemplo; y, plegado, palabra por palabra. Las palabras quedan en el diccionario. «Explicar error» también usa el contexto: qué querías decir y si hay una respuesta más natural para esa conversación. Si quieres que el modelo caro defina solo las palabras nuevas (más lento), se activa en ⚙ Ajustes.

**Gasto y memoria.** En ⚙ Ajustes:
- **Gasto (estimado):** hoy, este mes y en total, separado en conversación y explicaciones, con los tokens que informa la API en cada respuesta y los precios publicados (para GPT-5.4 mini se cuentan solo los pedidos, sin precio). Como referencia, un mensaje con Haiku 5.5 cuesta del orden de una décima de centavo de dólar y una explicación con Opus 5.5, unos 5 a 8 centavos.
- **Mensajes que 지수 recuerda:** 6, 10, 16 (por defecto), 24 o 40 mensajes de la conversación en cada pedido. Más mensajes, más memoria y un poco más de costo; lo que cuentas de ti queda igual en el perfil.

## Cómo usarla

1. Abre `index.html` en el navegador (Chrome o Safari para hablar con el micrófono).
2. En ⚙ Ajustes pega **tu propia clave** de la API de Anthropic (y la de OpenAI si eliges GPT). Se guarda solo en tu navegador y se envía directamente a `api.anthropic.com` o `api.openai.com`.
3. 지수 empieza la conversación sola (al abrir la app, al cerrar Ajustes después de poner la clave o al borrar la conversación). Para cambiar de nivel o de tema, elige uno en 🎓.

La voz de 지수 usa la síntesis de voz del navegador, con una voz coreana (en el celular suele venir; en el computador puede que haya que instalarla). Para reconocer lo que dices hay dos opciones en ⚙ Ajustes → Reconocimiento de voz: **el del navegador** (gratis; Chrome o Safari; muestra el texto mientras hablas, pero tiende a «corregir» lo que dices) u **OpenAI** (GPT-Transcribe, el más nuevo y recomendado; o `gpt-4o-transcribe`, `gpt-4o-mini-transcribe` y `whisper-1`, que OpenAI retira en febrero de 2027; con tu clave de OpenAI: graba mientras mantienes 🎤 y transcribe al soltar, más fiel a lo que dijiste, errores incluidos; del orden de medio centavo de dólar por minuto; funciona en cualquier navegador).

## Cómo está hecho

- **Sin bibliotecas ni compilación.** La conversación, el diccionario y los ajustes se guardan en `localStorage`.
- **Código común con el lector.** [`comun.js`](comun.js) tiene lo que usan las dos apps: la clave, la conexión con Claude y OpenAI (con streaming, salida estructurada, respaldo y registro del gasto), los precios, el hangul y su romanización, los esquemas, la voz del navegador, el significado sobre la palabra y la ficha del diccionario. [`comun.css`](comun.css) tiene los colores (claro y oscuro), los botones, la ficha y los paneles. Son scripts y hojas de estilo comunes (no módulos ES), así que todo sigue funcionando al abrir el archivo directamente.
- **Dos pedidos por mensaje, para que 지수 responda rápido.** Primero, uno corto que trae solo lo que dice 지수 (coreano y traducción), sin razonamiento previo: aparece y se oye de inmediato. Después, en segundo plano, otro analiza cada palabra (forma de diccionario, significado, forma gramatical), corrige el mensaje del estudiante, anota su perfil y la gramática nueva; y un tercero propone las respuestas sugeridas. Todos usan salida estructurada (JSON fijo).
- **Caché.** Las instrucciones fijas de cada nivel van primero, para que el proveedor las guarde en caché.
- **Esfuerzo y respaldo.** La conversación usa esfuerzo bajo, para que sea rápida y barata; las definiciones, esfuerzo medio. En Opus, Sonnet y Fable, si el modelo declina una respuesta, el servidor la reintenta en otro modelo.
- **Sin IA para lo básico.** El reconocimiento de verbos sin IA descompone el hangul en jamos, quita terminaciones y deshace contracciones e irregulares, y valida cada candidato contra el diccionario y el vocabulario de los niveles.

## Leamos: lector de libros

[`lector.html`](lector.html), sin bibliotecas ni compilación, con el mismo [`comun.js`](comun.js) y [`comun.css`](comun.css) que «Hablemos». Usa **la misma clave** de la API que «Hablemos» y, en coreano, **el mismo diccionario**: lo que aprendes leyendo se ve en la conversación y al revés. Se llega con 📚 desde «Hablemos» y con 💬 desde el lector.

- **Abrir libros.** EPUB (se descomprime en el navegador), archivos `.txt`, texto pegado o **🔎 Buscar en Gutenberg**: busca por título o autor (o muestra los más leídos) entre los libros de dominio público de Project Gutenberg, por idioma, y los agrega con un toque (sin la licencia de Gutenberg del principio y el final). Como Gutenberg no autoriza a otras páginas a descargar sus libros (CORS), se prueban a la vez el camino directo y dos intermediarios públicos gratuitos (codetabs y allorigins), y gana el primero que responde. Primero se baja el texto plano (una sola dirección, sin redireccionamiento; los capítulos se detectan solos y se descarta el índice del principio) y, si no se puede, el EPUB. Como esos a veces fallan, conviene crear **tu propio intermediario**: un Cloudflare Worker gratis con el código de [`gutenberg-proxy.js`](gutenberg-proxy.js) (solo deja pasar gutenberg.org y gutendex.com); los pasos están en ⚙ Ajustes → Gutenberg. Si nada funciona, el aviso dice qué falló en cada camino y da el enlace para bajar el EPUB y abrirlo con 📂. En inglés, francés o alemán hay miles; en coreano, casi ninguno. Detecta el idioma (coreano, inglés, japonés, chino, francés, alemán, italiano, portugués; se puede cambiar), los capítulos y el índice. Trae dos cuentos de ejemplo, en coreano y en inglés. Los libros se guardan en IndexedDB.
- **Leer en voz alta marcando la oración actual.** ▶ lee con la voz del sistema en el idioma del libro, oración por oración, resaltando la oración (y, si el navegador lo informa, la palabra que se está diciendo) y bajando la página sola. Sin voz, ⏭ y ⏮ (o las flechas del teclado) mueven la marca a mano. Velocidad ajustable; la pantalla no se apaga mientras lee.
- **Tocar una palabra: su significado ahí.** Como en el chat: aparece arriba de la palabra, con la forma de diccionario y qué forma es («pasado de go», «-았다: pasado»). El modelo barato traduce por adelantado los párrafos que vienen (cada palabra con su significado en contexto, su forma y su nivel MCER, y la traducción de cada oración), y lo guarda.
- **Tocar dos veces: la explicación detallada.** El modelo caro explica la palabra en esa oración (con las anteriores como contexto): significado, matices, conjugación, ejemplos, pronunciación o hanja. Desde la ficha, «▶ Leer desde aquí».
- **Seleccionar un trozo: explicación detallada** de la frase: traducción, literal, explicación en prosa, gramática y palabra por palabra.
- **文 Traducción** muestra la traducción de la oración actual.
- **Las palabras suben y bajan, como en Anki.** Las palabras de tu nivel o superior que todavía no conoces aparecen **subrayadas**; las que estás aprendiendo, con línea punteada. Al pasar a la siguiente oración, las palabras de la que dejaste que **no** miraste cuentan como «bien»: si les tocaba repaso, su intervalo crece (1 día, luego ×2,5 …). **Pedir la traducción** de una palabra es «otra vez»: el intervalo vuelve a cero y la facilidad baja. El dominio (0–100 %) sale del intervalo (1 día ≈ 17 %, una semana ≈ 50 %, dos meses = 100 %); bajo 30 % la palabra se subraya, hasta 70 % con línea punteada. Con la traducción de la oración visible o tras pedir la explicación de un trozo, esa oración no suma. En 📖 Mis palabras se ven todas, con su dominio, y «Ya la sé» las saca del subrayado.
- **Estimar el nivel del libro.** Al abrir un libro, el modelo caro lee tres fragmentos y estima su nivel MCER (y TOPIK en coreano), con cómo son el vocabulario y la gramática y si conviene simplificarlo para tu nivel.
- **Simplificar a tu nivel.** Reescribe cada párrafo con vocabulario y gramática del nivel elegido (A1 a C2), sin cambiar la historia, prefiriendo las palabras que ya conoces. Los párrafos quedan alineados con el original (¶ muestra el original del párrafo actual). Se puede simplificar todo el libro de una vez (se muestra el costo estimado con cada modelo; con Haiku, unos centavos por libro) o «mientras leo»: se simplifican solos el capítulo actual y el siguiente. En la cabecera se cambia entre el original y las versiones simplificadas.
- **Gasto.** En ⚙ Ajustes, separado en lectura, explicaciones y simplificación.

## Ideas para seguir

- Otros idiomas: los niveles y las instrucciones son datos, y el reconocimiento de formas es lo único propio del coreano.
- Tarjetas de repaso (repetición espaciada) con las palabras «por aprender».
- Una voz más natural (TTS de un proveedor) y pronunciación evaluada.
- Un servidor intermediario para no tener que poner una clave.
