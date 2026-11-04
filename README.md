# Hablemos coreano

Una app para aprender idiomas conversando con una IA, empezando por el coreano. Es un solo archivo, [`index.html`](index.html): se abre en el navegador, en el computador o en el celular, sin instalar nada.

**Abrirla en línea:** https://rilianx.github.io/Avonlea/idiomas/ (con GitHub Pages activado; así el micrófono funciona en cualquier dispositivo).

## Qué hace

- **Conversar con audio.** Conversas con 지수 (Jisu), una IA que habla a tu nivel. Puedes escribir o hablar 🎤, y cada respuesta se lee en voz alta 🔊 (también despacio 🐢).
- **Leer y oír.** Cada mensaje se puede leer y escuchar. La traducción al español se muestra al tocar «Traducción». El modo escucha 👂 deja el coreano borroso hasta que lo tocas.
- **Sin traducción por defecto.** Las frases de 지수 y las respuestas sugeridas aparecen solo en coreano.
  - **Pasar el mouse** sobre una palabra (o **tocarla** en el celular) muestra su significado arriba de ella.
  - **Clic** (o **doble toque** en el celular) abre la ficha: significado, romanización, forma de diccionario y qué forma es (por ejemplo, «먹었어요 → 먹다 · -었어요: pasado cortés»). Con «Explicar», el modelo caro da una explicación detallada.
  - La traducción de las respuestas sugeridas (y de las de «Puedes responder» en «Explicar frase») está oculta tras ›; la de un mensaje de 지수, tras «Traducción». En ⚙ Ajustes se puede volver a mostrar el significado encima de las palabras nuevas.
- **Palabras que se llenan.** Cuando respondes a 지수 sin haber mirado el significado de una palabra de su mensaje (ni con el mouse, ni con un toque, ni con «Traducción» o «Explicar frase»), la palabra queda como «ya sé» automáticamente (bajo el mensaje se avisa cuáles) y se llena de a poco: +10 % cada vez, hasta 50 %. Cada vez que la usas tú (escribiendo o hablando) en una frase correcta sube +20 %, hasta 100 %; si 지수 te corrigió la frase, sus palabras no suman. Marcarla a mano con «Ya la sé» la deja en al menos 50 %. Elegir una respuesta sugerida (tocándola, o con ✏ sin cambiarla) no suma a sus palabras; escribirla o decirla tú, sí. Se ve en la planilla de vocabulario de cada nivel (🎓), en el diccionario y en la ficha de cada palabra.
- **Respuestas sugeridas (conversar sin hablar ni escribir).** Con cada respuesta de 지수, el modelo barato propone 3 o 4 cosas que podrías decir, con su traducción, que llevan la conversación por caminos distintos (responder, contar algo tuyo, preguntarle a 지수, mostrar un interés, cambiar de tema…), sobre el cuadro de texto. Al tocar una se dice en voz alta y se envía, así que se puede llevar el diálogo eligiendo, como en un juego; con ✏ queda escrita para cambiarla antes de enviar. Se pueden ocultar en ⚙ Ajustes.
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
3. Elige un nivel y un tema en 🎓, o toca «Empezar».

La voz usa lo que trae el navegador: la síntesis de voz con una voz coreana (en el celular suele venir; en el computador puede que haya que instalarla) y el reconocimiento de voz `ko-KR`.

## Cómo está hecho

- **Un solo archivo**, sin bibliotecas ni compilación. La conversación, el diccionario y los ajustes se guardan en `localStorage`.
- **Respuestas en JSON fijo.** La IA de la conversación responde con un esquema fijo (salida estructurada): el texto en coreano, la traducción, y cada palabra con su forma de diccionario, significado y forma gramatical. También analiza y corrige el último mensaje del estudiante.
- **Caché.** Las instrucciones fijas de cada nivel van primero, para que el proveedor las guarde en caché.
- **Esfuerzo y respaldo.** La conversación usa esfuerzo bajo, para que sea rápida y barata; las definiciones, esfuerzo medio. En Opus, Sonnet y Fable, si el modelo declina una respuesta, el servidor la reintenta en otro modelo.
- **Sin IA para lo básico.** El reconocimiento de verbos sin IA descompone el hangul en jamos, quita terminaciones y deshace contracciones e irregulares, y valida cada candidato contra el diccionario y el vocabulario de los niveles.

## Ideas para seguir

- Otros idiomas: los niveles y las instrucciones son datos, y el reconocimiento de formas es lo único propio del coreano.
- Tarjetas de repaso (repetición espaciada) con las palabras «por aprender».
- Una voz más natural (TTS de un proveedor) y pronunciación evaluada.
- Un servidor intermediario para no tener que poner una clave.
