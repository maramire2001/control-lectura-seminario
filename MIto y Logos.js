import React, { useState, useRef, useEffect } from 'react';
import {
    BookOpen, Trophy, ArrowRight, RotateCcw, CheckCircle2, XCircle,
    HelpCircle, MessageSquare, ChevronRight, Quote, Library,
    FileText, Lock, Unlock, Download, Save, Eye, GraduationCap,
    Sparkles, Volume2, Loader2, Brain, Star, Moon, Orbit
} from 'lucide-react';

// Configuración de API Groq
const apiKey = "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";

const App = () => {
    const [currentStep, setCurrentStep] = useState('intro');
    const [score, setScore] = useState(0);
    const [currentModuleIdx, setCurrentModuleIdx] = useState(0);
    const [showFeedback, setShowFeedback] = useState(null);
    const [reflectionInput, setReflectionInput] = useState("");
    const [hasFinishedReading, setHasFinishedReading] = useState(false);
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const [userLog, setUserLog] = useState([]);

    // Estados para IA
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiHint, setAiHint] = useState("");
    const [aiExplanation, setAiExplanation] = useState("");
    const [aiPortrait, setAiPortrait] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);

    const mainQuote = "El camino recorrido por el hombre para transitar del mito al logos ha sido largo y alimentado por muchas mentes brillantes en busca de la verdad, a pesar de eso, no podemos considerar que ya se ha recorrido toda la ruta, aún ahora hay muchos mitos en el corazón del hombre y aún y cuando existe información suficiente para eliminar el mito de nuestras vidas, todavía vemos, por ejemplo, a quienes creen en la astrología como guía para conducir sus decisiones. Superar por completo al mito para instalar en definitiva un logos racional tiene aún, al estilo de los Beatles, un largo y sinuoso camino por recorrer.";

    // --- Utilidades de IA y API ---

    const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw error;
        }
    };

    const callGroq = async (prompt, systemPrompt = "") => {
        setIsAiLoading(true);
        try {
            const result = await fetchWithRetry(
                `https://api.groq.com/openai/v1/chat/completions`,
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "llama3-70b-8192",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 1500
                    })
                }
            );
            return result.choices?.[0]?.message?.content || "No se pudo generar una respuesta.";
        } catch (error) {
            console.error(error);
            return "El Oráculo del Logos está experimentando interferencias cósmicas. Intenta de nuevo.";
        } finally {
            setIsAiLoading(false);
        }
    };

    const speakText = (text) => {
        if (!('speechSynthesis' in window)) {
            alert("Tu navegador no soporta el Lector de Voz integrado.");
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX'; // Español latino
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // --- Funciones de Lógica del App ---

    const getAiHint = async () => {
        const current = modules[currentModuleIdx];
        const prompt = `Texto: "${current.extract}". Pregunta de reflexión: "${current.reflect}". Dame una pista breve (máximo 2 frases) para empezar mi reflexión filosófica sin darme la respuesta completa.`;
        const response = await callGroq(prompt, "Eres un tutor de filosofía socrático que ayuda a los alumnos a pensar profundamente.");
        setAiHint(response);
    };

    const getDeepExplanation = async () => {
        const current = modules[currentModuleIdx];
        const prompt = `Contexto del ensayo: "${current.extract}". Pregunta: "${current.q}". La respuesta correcta es: "${current.opts[current.ans]}". Explica de forma profunda pero clara por qué esta es la respuesta lógica basada en el ensayo. Usa un tono reflexivo y académico.`;
        const response = await callGroq(prompt, "Eres un profesor experto en filosofía y mitología antigua.");
        setAiExplanation(response);
    };

    const generatePortrait = async () => {
        const summary = userLog.map(l => `Módulo: ${l.modulo}. Reflexión: ${l.reflexion}`).join("\n");
        const prompt = `Analiza estas reflexiones de un alumno sobre el paso del mito al logos:\n${summary}\n\nGenera un 'Retrato de tu Pensamiento Filosófico' (3 párrafos). Sé alentador, destaca sus intereses, evalúa su capacidad de abstracción y acompáñalo como un mentor cósmico.`;
        const response = await callGroq(prompt, "Eres Aristóteles mismo, observando a un alumno brillante y evaluando su madurez intelectual con poesía y sabiduría.");
        setAiPortrait(response);
    };

    // --- Datos y Contenido ---

    const fullText = [
        { p: 1, content: "No es tarea simple imaginar como pudo el hombre primitivo enfrentarse al mundo, sus complicaciones y la necesidad de sobrevivencia, sin contar con una explicación de todo lo que no entendía. El paso para dar lugar a la creación de una conciencia clara que lo llevara mas allá del instinto y permitiera el surgimiento de la razón y la ciencia, fue paulatino, largo y ligado a condiciones muy particulares detonantes de grandes pensadores que, finalmente, encontraron rutas de reflexión cada vez más sólidas y propias de una estructura mental capaz de buscar el origen más allá de las fantasías, los miedos y la ignorancia. El mito como idea que da sentido y explicación a los sinsentidos de la vida, finalmente es superado por el raciocinio y el deseo de llegar cada vez más lejos en la búsqueda de una explicación clara del sentido de la vida. ¿Cual explicación podía encontrar el hombre primitivo a la lluvia o el fuego?, más allá de cualquier visión reduccionista es entendible que, poseedor de una imaginación fértil, fuera capaz de encontrar en las sombras, luces, destellos y prodigios de la naturaleza, a seres sobrenaturales, dándole sentido a lo percibido y así enfrentarse a estos elementos sabedor de la existencia de una voluntad y naturaleza superior a él... Así es como, naturalmente, nacen los dioses." },
        { p: 2, content: "Es creado un cielo, un infierno... De esta manera nace y se instala el mito en la cultura como un referente que distingue a los pueblos entre sí y los condiciona en su respuesta y conducta ante la vida. Aún civilizaciones consideradas avanzadas han tenido grandes mitos: los griegos contaban con dioses, musas, semidioses y héroes, cargados con todos los defectos humanos. Los romanos tenían un mito que explicaba la fundación de Roma con la adopción de Rómulo y Remo por parte de una loba. Los egipcios generaron una religión politeísta, con libro de los muertos e Isis y Osiris. Ka, la energía vital como centro y fuente de todas sus creencias. Los celtas crean a Brighid, la diosa-madre. En Japón el Shinto y los Kamis dictan el presente. La mitología nórdica con Odín y la aspiración de perecer en combate para llegar al paraíso, le dan asidero moral a una civilización agresiva." },
        { p: 3, content: "Se pueden distinguir varias clases de mitos. Cosmogónicos (origen del mundo), Teogónicos (origen de dioses), Antropogónicos (origen del hombre), Morales (bien y mal), Fundacionales (ciudades) y Escatológicos (fin del mundo). Para que se diera el tránsito entre el mito y la filosofía se conjugaron factores: el surgimiento de la moneda en Jonia (paso a la abstracción), el intercambio cultural, el cambio de aristocracia terrateniente a comercial, la democracia ateniense y la ausencia de una clase sacerdotal ortodoxa. El ocio, apreciado firmemente por los griegos, encuentra utilidad en el pensamiento. Las tareas cotidianas eran realizadas por esclavos o mujeres, lo cual otorgaba a los ciudadanos libres la posibilidad de disponer de tiempo libre para filosofar." },
        { p: 4, content: "El surgimiento de esta racionalidad suele conocerse como 'el paso del mito al logos'. Mito y logos significan 'palabra'. El mito se relaciona con cuentos simbólicos; el logos con el estudio y el discurso de la razón. Logos significa la palabra meditada, reflexionada o razonada. El paso al logos indica que los acontecimientos naturales deben explicarse según la necesidad, no según la arbitrariedad de los dioses; considerar que todo sucede de un modo ordenado (cosmos) no arbitrariamente (caos). El caos se convierte en cosmos. El logos se caracteriza por situarse en un plano de racionalidad lógica." },
        { p: 5, content: "Tales de Mileto consideraba al agua como origen de todo (arché). Es el iniciador de la filosofía de la Physys que marca un principio y fin para todas las cosas, a partir de un elemento único. Por primera vez lo divino se liga con la vida a partir de un elemento natural. Anaximandro profundiza en el concepto del arché y considera al ápeiron (lo infinito) como naturaleza infinita. Declara que los animales nacen de un proceso de calentamiento del agua o el barro y que el hombre desciende de los peces. Anaxímenes considera al aire como el elemento natural mediante rarefacción y condensación." },
        { p: 6, content: "La escuela de Mileto inicia el proceso de desprendimiento de los dioses. Heráclito de Efeso ve en el fuego el arché del universo. El mundo se encuentra en permanente cambio, nadie se puede bañar dos veces en el mismo río. Pitágoras plantea al número como el logos en que se encuentra el origen de todo; el universo es Kosmos (orden). Jenófanes combate la concepción antropomórfica de los dioses." },
        { p: 7, content: "Parménides de Elea afirma que 'el ser es y no puede no-ser'. Por lo tanto el devenir que atestiguan los sentidos es falso. Demócrito resuelve el cambio mediante los átomos, partículas pequeñas que se mueven en un vacío. Su planteamiento implica que el ser es lo 'lleno' y el no-ser lo 'vacío', dando la primera interpretación mecanicista del mundo." },
        { p: 8, content: "Sócrates traslada la preocupación hacia el hombre. Entiende al alma como la conciencia y personalidad moral. Utiliza la mayéutica para que cada quién encuentre la verdad en sí mismo. Platón afirma que existe el mundo inteligible (ideas) y el mundo sensible (visible). El cuerpo es entendido como prisión del alma." },
        { p: 9, content: "Aristóteles critica la teoría de las ideas de Platón: para Aristóteles el mundo es uno solo; Platón utiliza mitos y metáforas en vez de aclarar conceptualmente. No explica cómo las ideas son causa de las cosas. Aristóteles creó la lógica formal, fue precursor de la anatomía y biología. Divide el alma en tres facultades: Vegetativa, Intelectiva y Sensitiva." },
        { p: 10, content: "El camino recorrido por el hombre para transitar del mito al logos ha sido largo y alimentado por muchas mentes brillantes... aún ahora hay muchos mitos en el corazón del hombre... todavía vemos a quienes creen en la astrología como guía para conducir sus decisiones. Superar por completo al mito tiene aún, al estilo de los Beatles, un largo y sinuoso camino por recorrer." }
    ];

    const modules = [
        { title: "El Hombre Primitivo", extract: "No es tarea simple imaginar como pudo el hombre primitivo enfrentarse al mundo... sin contar con una explicación de todo lo que no entendía.", reflect: "¿Cómo crees que el miedo a lo desconocido influyó en la creación de los primeros mitos?", q: "¿Cuál era la función principal del mito para el hombre primitivo?", opts: ["Entretener", "Dar una explicación de lo que no entendía", "Organizar ejércitos", "Vender productos"], ans: 1 },
        { title: "Instinto vs Conciencia", extract: "El paso para dar lugar a la creación de una conciencia clara que lo llevara mas allá del instinto... fue paulatino, largo y ligado a condiciones particulares.", reflect: "¿Qué diferencia el actuar por instinto de actuar por una conciencia clara según el autor?", q: "¿Cómo describe el autor el tránsito del instinto a la razón?", opts: ["Repentino", "Paulatino y largo", "Instantáneo", "Mágico"], ans: 1 },
        { title: "Fantasía vs Realidad", extract: "...capaz de buscar el origen más allá de las fantasías, los miedos y la ignorancia.", reflect: "En tu opinión, ¿por qué es difícil abandonar la fantasía para buscar la verdad racional?", q: "¿Qué factores impedían al hombre primitivo buscar el origen racional?", opts: ["Fantasías, miedos e ignorancia", "Falta de dinero", "Exceso de trabajo", "Clima extremo"], ans: 0 },
        { title: "Voluntad Superior", extract: "...sabedor de la existencia de una voluntad y naturaleza superior a él, con el poder de defenderlo.", reflect: "Si crees que un dios controla el clima, ¿cómo cambiaría tu comportamiento ante una tormenta?", q: "¿Qué buscaba el hombre al crear dioses de la lluvia o el fuego?", opts: ["Compañía", "Dar sentido a lo percibido", "Ganar guerras", "Crear arte"], ans: 1 },
        { title: "Dioses con Defectos", extract: "...los griegos contaban con dioses... cargados con todos los defectos humanos.", reflect: "¿Por qué crees que los griegos atribuían envidia o ira a sus propios dioses?", q: "¿Cómo eran los dioses griegos según el autor?", opts: ["Inalcanzables", "Cargados con defectos humanos", "Seres de luz pura", "Animales salvajes"], ans: 1 },
        { title: "El Mito de Roma", extract: "...un mito que explicaba la fundación de Roma con la adopción de Rómulo y Remo por parte de una loba.", reflect: "¿Qué mensaje de identidad crees que enviaba el mito de la loba a los ciudadanos romanos?", q: "¿Qué animal protagoniza el mito fundacional de Roma?", opts: ["Un águila", "Una loba", "Un león", "Un delfín"], ans: 1 },
        { title: "Energía Vital: Ka", extract: "Isis, Osiris, el mas allá y Ka, la energía vital como centro y fuente de todas sus creencias.", reflect: "¿Cómo influye la idea de una 'energía vital' en la forma de entender la muerte?", q: "¿Qué representaba el 'Ka' para los egipcios?", opts: ["El sol", "La energía vital", "Una tumba", "Un tipo de pan"], ans: 1 },
        { title: "Diosa Madre Celta", extract: "Brighid, es la diosa-madre, diosa de las artes, la magia, la guerra y la medicina.", reflect: "¿Por qué una cultura integraría la guerra y la medicina bajo una misma divinidad?", q: "¿Quién era Brighid para los celtas?", opts: ["Una guerrera mortal", "La diosa-madre", "Una reina egipcia", "Una idea matemática"], ans: 1 },
        { title: "El Shinto Japonés", extract: "En Japón... basados en el Shinto (la voz de los dioses) y los Kamis (propiamente los dioses).", reflect: "¿Qué importancia tiene para una sociedad que sus dioses dicten el presente y futuro?", q: "¿Qué significa Shinto según el texto?", opts: ["El camino del guerrero", "La voz de los dioses", "El fin del mundo", "La paz eterna"], ans: 1 },
        { title: "Moral Nórdica", extract: "...la aspiración de perecer en combate para llegar al paraíso, le dan asidero moral a una civilización agresiva.", reflect: "¿Cómo el mito puede moldear la moral de un pueblo completo?", q: "¿Cuál era la meta del guerrero nórdico para llegar al paraíso?", opts: ["Vivir mucho tiempo", "Perecer en combate", "Ser rico", "Rezar mucho"], ans: 1 },
        { title: "Clase: Cosmogónicos", extract: "Cosmogónicos: tratan de explicar el origen del mundo.", reflect: "¿Por qué todas las culturas necesitan explicar de dónde viene el mundo?", q: "¿Qué explica un mito cosmogónico?", opts: ["El fin del mundo", "El origen del mundo", "Las leyes civiles", "La medicina"], ans: 1 },
        { title: "Clase: Escatológicos", extract: "Escatológicos: donde nos hacen llegar la visión del fin del mundo.", reflect: "¿Por qué crees que los mitos del fin del mundo causan sucesos tan dramáticos?", q: "¿Qué tema tratan los mitos escatológicos?", opts: ["El origen de los dioses", "El fin del mundo", "La fundación de ciudades", "El matrimonio"], ans: 1 },
        { title: "Factor: La Moneda", extract: "...el surgimiento de la moneda en Jonia... un gran paso hacia la abstracción.", reflect: "¿Cómo usar dinero (un papel o metal con valor irreal) entrena la mente para filosofar?", q: "¿Qué capacidad desarrolló la moneda en el hombre griego?", opts: ["Fuerza física", "Abstracción", "Codicia", "Velocidad"], ans: 1 },
        { title: "Intercambio Cultural", extract: "Esto difunde y enfrenta diferentes mitos... provocando que se empiece a cuestionar cual es la real.", reflect: "¿Qué pasa cuando descubres que otros pueblos tienen mitos iguales de válidos que los tuyos?", q: "¿Qué provocó el intercambio cultural en Jonia?", opts: ["Guerras religiosas", "Cuestionamiento de los mitos", "Nuevas dietas", "Aislamiento"], ans: 1 },
        { title: "Ausencia de Clero", extract: "...la ausencia de una clase sacerdotal que velara por conservar la ortodoxia de su religión.", reflect: "¿Cómo ayuda la falta de 'persecución religiosa' a que surjan nuevas ideas?", q: "¿Qué factor facilitó la libertad de pensamiento en Grecia?", opts: ["Libros sagrados estrictos", "Ausencia de clase sacerdotal ortodoxa", "Leyes de silencio", "Castigos severos"], ans: 1 },
        { title: "El Valor del Ocio", extract: "El ocio, apreciado firmemente por los griegos... le otorgaba a los ciudadanos la posibilidad de disponer de tiempo libre.", reflect: "¿Crees que hoy en día tenemos tiempo de 'ocio' real para pensar o estamos siempre distraídos?", q: "¿Qué permitía el ocio a los ciudadanos griegos?", opts: ["Dormir más", "Empezar a filosofar", "Hacer más ejercicio", "Viajar"], ans: 1 },
        { title: "Mito vs Logos (Palabra)", extract: "...tanto mito como logos significan 'palabra' o 'discurso'.", reflect: "Si ambos son palabras, ¿en qué momento una palabra se vuelve 'razón' y deja de ser 'cuento'?", q: "¿Qué significa Logos según el texto?", opts: ["Mentira", "Palabra razonada / Discurso de razón", "Grito", "Imagen"], ans: 1 },
        { title: "Cosmos vs Caos", extract: "...considerar que todo sucede de un modo ordenado (cosmos) no arbitrariamente (caos).", reflect: "¿Por qué el hombre prefiere vivir en un 'Cosmos' que en un 'Caos'?", q: "¿Qué es el Cosmos según la filosofía?", opts: ["Un desastre", "Un todo ordenado y regido por leyes", "El espacio exterior", "Una idea falsa"], ans: 1 },
        { title: "Tales: El Agua", extract: "Tales de Mileto... consideraba al agua como origen de todo.", reflect: "¿Por qué buscar el origen en el agua es más 'científico' que buscarlo en un dios?", q: "¿Cuál es el arché para Tales?", opts: ["Fuego", "Agua", "Aire", "Tierra"], ans: 1 },
        { title: "Anaximandro: Ápeiron", extract: "Utiliza el término a-peiron que significa privado de límites.", reflect: "¿Por qué el origen de todo no podría ser algo limitado físicamente?", q: "¿Qué significa Ápeiron?", opts: ["Pequeño", "Privado de límites / Infinito", "Mojado", "Fuego"], ans: 1 },
        { title: "Heráclito: Cambio", extract: "El mundo se encuentra en permanente cambio, nadie se puede bañar dos veces en el mismo río.", reflect: "Si todo cambia, ¿qué es lo que nos hace ser 'nosotros mismos' a través del tiempo?", q: "¿Qué elemento es el arché para Heráclito?", opts: ["Tierra", "Fuego", "Oro", "Viento"], ans: 1 },
        { title: "Pitágoras: Números", extract: "Plantea al número como el logos en que se encuentra el origen de todo.", reflect: "¿Por qué crees que un matemático diría que el universo es armonía?", q: "Para Pitágoras, el universo es Kosmos porque tiene:", opts: ["Muchos dioses", "Un orden matemático", "Mucha agua", "Sin sentido"], ans: 1 },
        { title: "Jenófanes: Antropomorfismo", extract: "...combate la concepción antropomórfica de los dioses.", reflect: "¿Por qué creamos dioses a nuestra imagen y semejanza?", q: "¿Qué criticaba Jenófanes de la religión de su tiempo?", opts: ["La falta de templos", "Atribuir formas y defectos humanos a los dioses", "El uso de la moneda", "La ciencia"], ans: 1 },
        { title: "Parménides: El Ser", extract: "...parte del supuesto de que 'el ser es y no puede no-ser'.", reflect: "¿Puede algo salir de la nada absoluta? Justifica tu respuesta.", q: "¿Qué niega Parménides con su lógica?", opts: ["La existencia de dios", "La realidad del cambio / Devenir", "La verdad", "La moneda"], ans: 1 },
        { title: "Demócrito: Átomos", extract: "...unas partículas muy pequeñas a las que llamó átomos... se mueven en un vacío.", reflect: "¿Cómo cambia nuestra visión del mundo si somos solo 'átomos moviéndose en el vacío'?", q: "¿Qué interpretación del mundo da Demócrito?", opts: ["Mística", "Mecanicista", "Religiosa", "Política"], ans: 1 },
        { title: "Sócrates: El Alma", extract: "Entiende al alma como la conciencia y personalidad intelectual y moral.", reflect: "¿Qué significa 'cuidar el alma' en el sentido socrático?", q: "Para Sócrates, el vicio es:", opts: ["Un pecado", "Ignorancia", "Un crimen", "Falta de dinero"], ans: 1 },
        { title: "Platón: Dos Mundos", extract: "Existe el kosmos noetós o mundo inteligible y el kosmos aisthetós o mundo visible.", reflect: "¿Crees que nuestras ideas son más reales que los objetos que tocamos?", q: "¿Qué es el mundo sensible para Platón?", opts: ["El único real", "Un reflejo efímero / sombras", "El paraíso", "Una invención"], ans: 1 },
        { title: "Aristóteles: Crítica", extract: "Aristóteles hace cuatro criticas... para Aristóteles es uno solo; Platón utiliza mitos y metáforas.", reflect: "¿Por qué Aristóteles prefería los conceptos claros a las metáforas de Platón?", q: "¿Qué disciplina creó Aristóteles?", opts: ["Mitología", "Lógica formal", "Poesía épica", "Religión"], ans: 1 },
        { title: "Facultades del Alma", extract: "Vegetativa (crecimiento), Intelectiva (entendimiento) y Sensitiva (contacto sensible).", reflect: "¿En qué nos diferenciamos de las plantas según esta clasificación?", q: "¿Qué facultad preside la reproducción y crecimiento?", opts: ["Intelectiva", "Sensitiva", "Vegetativa", "Divina"], ans: 2 },
        { title: "Persistencia del Mito", extract: "Superar por completo al mito... tiene aún, al estilo de los Beatles, un largo y sinuoso camino por recorrer.", reflect: "¿Por qué crees que la astrología sigue guiando decisiones en un mundo científico?", q: "¿Qué ejemplo usa el autor para mostrar que el mito persiste?", opts: ["La física", "La astrología", "El internet", "La medicina"], ans: 1 }
    ];

    const handleScroll = (e) => {
        const el = e.target;
        const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
        setScrollPercentage(pct);
        if (pct > 95) setHasFinishedReading(true);
    };

    const handleAnswer = (idx) => {
        const isCorrect = idx === modules[currentModuleIdx].ans;
        if (isCorrect) setScore(score + 10);

        setUserLog([...userLog, {
            modulo: modules[currentModuleIdx].title,
            reflexion: reflectionInput,
            pregunta: modules[currentModuleIdx].q,
            respuesta: modules[currentModuleIdx].opts[idx],
            resultado: isCorrect ? "Correcto" : "Incorrecto"
        }]);

        setShowFeedback({ isCorrect, msg: modules[currentModuleIdx].opts[modules[currentModuleIdx].ans] });
        setAiExplanation(""); // Limpiar explicación IA anterior
    };

    const downloadExcel = () => {
        let csv = "Módulo,Reflexión,Pregunta,Respuesta Elegida,Resultado\n";
        userLog.forEach(row => {
            csv += `"${row.modulo}","${row.reflexion.replace(/"/g, '""')}","${row.pregunta.replace(/"/g, '""')}","${row.respuesta.replace(/"/g, '""')}","${row.resultado}"\n`;
        });
        csv += `\nTOTAL XP,${score},MAX XP,${modules.length * 10}\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Lectura_MitoLogos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const nextModule = () => {
        setShowFeedback(null);
        setReflectionInput("");
        setAiHint("");
        setAiExplanation("");
        if (currentModuleIdx < modules.length - 1) {
            setCurrentModuleIdx(currentModuleIdx + 1);
            setCurrentStep('module_read');
        } else {
            setCurrentStep('results');
        }
    };

    return (
        <div className="min-h-screen bg-[#050B14] text-slate-300 p-4 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Animación de fondo cósmico */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[150px] rounded-full"></div>
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-blue-900/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10 pt-8 pb-16">
                {/* PANTALLA 1: INTRODUCCIÓN */}
                {currentStep === 'intro' && (
                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(30,27,75,0.5)] p-10 text-center space-y-10 animate-in zoom-in duration-700 border border-slate-700/50">
                        
                        <div className="inline-block p-4 bg-indigo-950/50 rounded-3xl border border-indigo-500/20 mb-4 shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                            <Orbit size={60} className="text-indigo-400 mx-auto animate-pulse" />
                        </div>
                        
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 drop-shadow-sm pb-2">
                                Mito y Logos
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-indigo-300 font-medium tracking-wide">
                                <GraduationCap size={20} />
                                <span>Elaborada por el doctor <strong>Mario A. Ramírez Barajas</strong></span>
                            </div>
                        </div>

                        <div className="bg-slate-950/80 p-8 rounded-3xl border-l-4 border-indigo-500 text-left italic font-serif text-lg leading-relaxed text-slate-300 shadow-inner">
                            <Quote className="text-indigo-500/30 w-12 h-12 absolute -mt-4 -ml-4" />
                            <p className="relative z-10">"{mainQuote}"</p>
                        </div>
                        
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Emprende el viaje del pensamiento. Completa la lectura del ensayo fundacional para desbloquear el portal de los 30 ejercicios de análisis crítico.
                        </p>
                        
                        <button 
                            onClick={() => setCurrentStep('full_reader')} 
                            className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-12 py-5 rounded-full font-bold text-xl shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] transition-all duration-300 transform hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                <BookOpen size={24} /> Iniciar el Recorrido
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        </button>
                    </div>
                )}

                {/* PANTALLA 2: LECTOR COMPLETO */}
                {currentStep === 'full_reader' && (
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-700/50 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-slate-950/90 p-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 gap-6 border-b border-slate-800 shadow-md">
                            <div className="flex flex-col w-full md:w-auto">
                                <span className="text-xs uppercase text-indigo-400 font-bold tracking-widest mb-2 flex items-center gap-2">
                                    <Star size={12} /> Progreso del Oráculo: {Math.round(scrollPercentage)}%
                                </span>
                                <div className="w-full md:w-64 h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-700">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 relative" style={{ width: `${scrollPercentage}%` }}>
                                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => speakText(fullText.map(t => t.content).join(" "))}
                                    className={`p-3 rounded-full transition-all duration-300 shadow-lg ${isSpeaking ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700 hover:text-white'}`}
                                    title="Escuchar manifiesto completo"
                                >
                                    {isSpeaking ? <Loader2 className="animate-spin" size={20} /> : <Volume2 size={20} />}
                                </button>
                                <button
                                    disabled={!hasFinishedReading}
                                    onClick={() => setCurrentStep('module_read')}
                                    className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all duration-500 
                                        ${hasFinishedReading 
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] hover:scale-105' 
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'}`}
                                >
                                    {hasFinishedReading ? <Unlock size={18} className="animate-pulse" /> : <Lock size={18} />} 
                                    Entrar al Logos
                                </button>
                            </div>
                        </div>
                        <div onScroll={handleScroll} className="p-8 md:p-16 max-h-[70vh] overflow-y-auto font-serif text-xl leading-relaxed text-slate-300 custom-scrollbar">
                            <h1 className="text-4xl md:text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase tracking-[0.2em]">EL LOGOS</h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mb-8"></div>
                            <p className="text-center italic text-indigo-400/80 mb-16 tracking-widest font-sans">Mario A. Ramírez Barajas</p>
                            
                            {fullText.map(p => (
                                <div key={p.p} className="relative group mb-12">
                                    <span className="hidden md:block absolute -left-16 top-1 text-slate-600 font-bold text-xs tracking-widest select-none rotate-[-90deg] origin-left">ESTRATO {p.p}</span>
                                    <p className="indent-12 text-justify drop-shadow-md text-[1.15rem] leading-[1.8] text-slate-200">{p.content}</p>
                                </div>
                            ))}
                            
                            {hasFinishedReading && (
                                <div className="mt-16 bg-gradient-to-b from-indigo-900/40 to-indigo-950/40 p-10 rounded-3xl text-center font-sans border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.15)] animate-in fade-in duration-1000">
                                    <CheckCircle2 className="mx-auto text-indigo-400 mb-4" size={56} />
                                    <p className="font-bold text-indigo-300 text-2xl mb-2">Lectura completada</p>
                                    <p className="text-indigo-400/70 text-lg">Las constelaciones de conocimiento están listas. Sube para iniciar la evaluación.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PROGRESO DE LOS 30 EJERCICIOS */}
                {['module_read', 'module_reflect', 'module_quiz'].includes(currentStep) && (
                    <div className="bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 space-y-8 animate-in slide-in-from-right-8 duration-500 border border-slate-700/60 relative overflow-hidden">
                        {/* Destello de fondo sutil */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="flex justify-between items-center border-b border-slate-700/50 pb-6 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Navegación Racional</span>
                                <span className="text-2xl font-black text-white uppercase flex items-center gap-3">
                                    <Orbit className="text-indigo-500" size={24} />
                                    Hito {currentModuleIdx + 1} <span className="text-slate-600">de {modules.length}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-950/80 px-6 py-3 rounded-full border border-indigo-900 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                                <Trophy size={20} className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                                <span className="font-black text-slate-200 tracking-wider"><span className="text-indigo-400">{score}</span> XP</span>
                            </div>
                        </div>

                        {currentStep === 'module_read' && (
                            <div className="space-y-10 animate-in fade-in relative z-10 pt-4">
                                <div className="flex justify-between items-start gap-4">
                                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">{modules[currentModuleIdx].title}</h2>
                                    <button
                                        onClick={() => speakText(modules[currentModuleIdx].extract)}
                                        className={`p-3 rounded-full transition-all flex-shrink-0 ${isSpeaking ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-slate-800/80 text-indigo-400 hover:bg-slate-700 border border-slate-700'}`}
                                    >
                                        {isSpeaking ? <Loader2 className="animate-spin" size={22} /> : <Volume2 size={22} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Quote className="absolute -top-4 -left-4 text-slate-700/50 w-16 h-16 pointer-events-none" />
                                    <div className="bg-slate-950/60 p-10 rounded-3xl italic text-2xl border-l-4 border-indigo-500 leading-relaxed font-serif text-slate-300 shadow-inner relative z-10">
                                        "{modules[currentModuleIdx].extract}"
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setCurrentStep('module_reflect')} 
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 group"
                                >
                                    Comenzar la Dialéctica <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        )}

                        {currentStep === 'module_reflect' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 relative z-10 pt-2">
                                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-3 text-emerald-400 font-bold uppercase tracking-widest text-sm">
                                        <div className="p-2 bg-emerald-950 rounded-lg"><MessageSquare size={18} /></div> 
                                        Espacio de Reflexión
                                    </div>
                                    <button
                                        onClick={getAiHint}
                                        disabled={isAiLoading}
                                        className="flex items-center gap-2 bg-slate-950 px-5 py-2.5 rounded-full border border-indigo-800/50 text-indigo-300 text-sm hover:bg-indigo-900/30 hover:border-indigo-500/50 transition-all disabled:opacity-50 shadow-inner"
                                    >
                                        {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="text-yellow-400" />}
                                        Consultar al Oráculo
                                    </button>
                                </div>

                                {aiHint && (
                                    <div className="bg-indigo-950/40 border border-indigo-500/30 p-5 rounded-2xl animate-in slide-in-from-top-4 shadow-[0_0_20px_rgba(79,70,229,0.1)] flex gap-4 items-start">
                                        <Moon className="text-indigo-400 flex-shrink-0 mt-1" size={20} />
                                        <p className="text-indigo-200 font-medium text-base leading-relaxed">{aiHint}</p>
                                    </div>
                                )}

                                <h2 className="text-3xl font-bold text-slate-100 leading-tight">{modules[currentModuleIdx].reflect}</h2>
                                
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                                    <textarea
                                        className="relative w-full h-56 p-8 rounded-[2rem] bg-slate-950 border border-slate-700 outline-none focus:border-indigo-500 text-xl transition-all shadow-inner text-slate-200 placeholder:text-slate-600 custom-scrollbar resize-none font-serif"
                                        placeholder="Plasma tu razonamiento a la luz de las estrellas..."
                                        value={reflectionInput}
                                        onChange={e => setReflectionInput(e.target.value)}
                                    />
                                </div>

                                <button
                                    disabled={reflectionInput.length < 5}
                                    onClick={() => setCurrentStep('module_quiz')}
                                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-30 disabled:shadow-none transition-all duration-300"
                                >
                                    Consolidar y Desafiar la Lógica
                                </button>
                            </div>
                        )}

                        {currentStep === 'module_quiz' && (
                            <div className="space-y-8 animate-in zoom-in duration-500 relative z-10 pt-2">
                                {showFeedback ? (
                                    <div className="text-center space-y-10 py-6">
                                        <div className="relative inline-block">
                                            <div className={`absolute inset-0 blur-2xl opacity-50 ${showFeedback.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {showFeedback.isCorrect 
                                                ? <CheckCircle2 size={120} className="text-emerald-400 relative z-10 mx-auto" /> 
                                                : <XCircle size={120} className="text-rose-400 relative z-10 mx-auto" />}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h3 className={`text-5xl font-black ${showFeedback.isCorrect ? 'text-emerald-400' : 'text-rose-400'} drop-shadow-md`}>
                                                {showFeedback.isCorrect ? "¡Silogismo Perfecto!" : "Falla en la Premisa"}
                                            </h3>
                                            <div className="inline-block bg-slate-950/80 px-8 py-4 rounded-2xl text-xl font-medium text-slate-300 border border-slate-700/50 shadow-inner">
                                                Verdad establecida: <span className="text-white font-bold">{showFeedback.msg}</span>
                                            </div>
                                        </div>

                                        {!aiExplanation ? (
                                            <button
                                                onClick={getDeepExplanation}
                                                disabled={isAiLoading}
                                                className="mx-auto flex items-center justify-center gap-3 text-indigo-400 font-bold hover:text-indigo-300 transition-colors bg-indigo-950/30 px-6 py-3 rounded-full border border-indigo-900/50 hover:bg-indigo-900/50"
                                            >
                                                {isAiLoading ? <Loader2 className="animate-spin" size={20} /> : <Brain size={20} />}
                                                Requerir Explicación Profunda
                                            </button>
                                        ) : (
                                            <div className="bg-slate-950 border border-indigo-500/40 p-8 rounded-3xl text-left animate-in slide-in-from-bottom-6 shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden">
                                                <Sparkles className="absolute top-4 right-4 text-indigo-500/20" size={80} />
                                                <h4 className="font-bold text-indigo-400 text-lg mb-3 flex items-center gap-2">
                                                    <Brain size={18}/> Revelación del Logos:
                                                </h4>
                                                <p className="text-slate-300 text-lg leading-[1.8] relative z-10">{aiExplanation}</p>
                                            </div>
                                        )}

                                        <button onClick={nextModule} className="bg-slate-100 text-slate-900 px-16 py-5 rounded-full font-black text-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 block w-full mt-8">
                                            {currentModuleIdx < modules.length - 1 ? "Avanzar al siguiente Hito" : "Ver el Veredicto Final"}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 text-blue-400 font-bold uppercase tracking-widest text-sm border-b border-slate-800 pb-4">
                                            <div className="p-2 bg-blue-950/50 rounded-lg"><HelpCircle size={18} /></div>
                                            Prueba de Conocimiento
                                        </div>
                                        <h3 className="text-3xl font-bold text-white leading-snug">{modules[currentModuleIdx].q}</h3>
                                        <div className="grid gap-4 mt-6">
                                            {modules[currentModuleIdx].opts.map((o, i) => (
                                                <button key={i} onClick={() => handleAnswer(i)} className="text-left p-6 md:p-7 rounded-[1.5rem] bg-slate-950/60 border border-slate-700/80 hover:border-indigo-500/80 hover:bg-indigo-950/40 transition-all font-bold text-xl flex items-center gap-6 group shadow-sm hover:shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                                                    <span className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:border-indigo-400 group-hover:text-white transition-all shadow-inner flex-shrink-0">
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span className="text-slate-300 group-hover:text-indigo-100 transition-colors leading-tight">{o}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* PANTALLA FINAL */}
                {currentStep === 'results' && (
                    <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_0_60px_rgba(79,70,229,0.2)] p-12 text-center space-y-12 animate-in zoom-in duration-700 border-t-4 border-indigo-500 relative overflow-hidden">
                        
                        {/* Background effects */}
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none animate-spin-slow"></div>

                        <div className="relative z-10">
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                                <Trophy size={140} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] relative z-10" />
                            </div>
                            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400 tracking-tight mb-4">La Ascensión Completada</h2>
                            <div className="text-4xl font-black text-indigo-400 drop-shadow-md">
                                Cosecha: <span className="text-white">{score}</span> XP
                            </div>
                        </div>

                        {aiPortrait ? (
                            <div className="relative z-10 bg-slate-950 border border-indigo-500/40 p-10 rounded-[2.5rem] text-left shadow-[0_0_40px_rgba(79,70,229,0.15)] animate-in slide-in-from-bottom-8 duration-700">
                                <h3 className="text-3xl font-black text-indigo-300 mb-8 flex items-center gap-4 py-4 border-b border-indigo-900/50">
                                    <div className="p-3 bg-indigo-900/50 rounded-2xl"><Orbit className="text-indigo-400" size={32} /></div>
                                    El Dictamen del Logos
                                </h3>
                                <div className="text-slate-300 text-xl leading-[2] font-serif whitespace-pre-wrap px-2">
                                    {aiPortrait}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={generatePortrait}
                                disabled={isAiLoading}
                                className="relative z-10 w-full group overflow-hidden bg-slate-950 text-white py-8 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all duration-300 border border-indigo-500/40"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 opacity-50 group-hover:scale-105 transition-transform duration-700"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    {isAiLoading ? <Loader2 className="animate-spin text-indigo-400" size={36} /> : <Sparkles className="text-yellow-400" size={36} />}
                                    Invocar Evaluación Inteligente
                                </div>
                            </button>
                        )}

                        <div className="relative z-10 bg-slate-950/60 p-10 rounded-[2.5rem] space-y-8 border border-slate-700">
                            <div className="p-8 bg-slate-900/80 rounded-3xl border border-indigo-500/20 text-left space-y-6 shadow-inner">
                                <h4 className="font-black text-2xl flex items-center gap-3 text-indigo-300 border-b border-slate-700 pb-4">
                                    <Save size={28} /> Protocolo de Registro:
                                </h4>
                                <ol className="list-decimal list-outside ml-6 text-xl text-slate-400 space-y-4 leading-relaxed font-medium">
                                    <li>Haz clic en el botón <span className="text-emerald-400 font-bold">"Descargar Registro PDF/CSV"</span>.</li>
                                    <li>Se guardará el documento <code className="bg-slate-950 px-3 py-1 rounded-lg text-indigo-300 border border-slate-800">Reporte_Lectura_MitoLogos.csv</code>.</li>
                                    <li>Abre tu bitácora para asegurar que tus ideas quedaron preservadas.</li>
                                    <li><strong className="text-slate-200">Entrega este archivo a tu mentor</strong> como evidencia de tu transición.</li>
                                </ol>
                            </div>

                            <button
                                onClick={downloadExcel}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-7 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                <Download size={32} className="animate-bounce" /> Extraer Registro Completo
                            </button>
                        </div>

                        <button onClick={() => window.location.reload()} className="relative z-10 flex items-center justify-center gap-3 mx-auto text-slate-500 font-bold text-lg hover:text-indigo-400 transition-colors mt-8">
                            <RotateCcw size={20} /> Reiniciar el Ciclo del Tiempo
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 12px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(79, 70, 229, 0.4);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(79, 70, 229, 0.8);
                }
                @keyframes progress-bar-stripes {
                    from { background-position: 20px 0; }
                    to { background-position: 0 0; }
                }
                .animate-spin-slow {
                    animation: spin 30s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default App;