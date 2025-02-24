// Función para obtener datos del usuario
async function getUser(userId) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) throw new Error('Error al obtener datos del usuario');
    return response.json();
}

// Función para obtener las publicaciones del usuario
async function getPosts(userId) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
    if (!response.ok) throw new Error('Error al obtener publicaciones');
    return response.json();
}

// Función para obtener los comentarios de una publicación
async function getComments(postId) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
    if (!response.ok) throw new Error('Error al obtener comentarios');
    return response.json();
}

async function processUserData(userId) {
    try {
        console.log('Comenzando a procesar datos...\n');
        
        // Obtener datos del usuario y publicaciones
        const user = await getUser(userId);
        const posts = await getPosts(userId);

        // Obtener todos los comentarios de las publicaciones
        const postsWithComments = await Promise.all(posts.map(async post => {
            const comments = await getComments(post.id);
            return {
                ...post,
                comments,
                titleWords: post.title.split(' ').length,
                bodyWords: post.body.split(' ').length,
                totalWords: post.title.split(' ').length + post.body.split(' ').length,
                // Calcular la longitud promedio de los comentarios
                avgCommentLength: comments.reduce((sum, comment) => sum + comment.body.length, 0) / comments.length
            };
        }));
        // Usar filter + map + reduce juntos
        // Encontrar publicaciones con más palabras que el promedio y extraer la cantidad de palabras del título
        const avgTotalWords = postsWithComments.reduce((sum, post) => 
            sum + post.totalWords, 0) / postsWithComments.length;
            
        const wordCountAnalysis = postsWithComments
            .filter(post => post.totalWords > avgTotalWords) // Filtrar contenido largo
            .map(post => ({
                id: post.id,
                title: post.title,
                titleWords: post.titleWords,
                bodyWords: post.bodyWords,
                totalWords: post.totalWords
            })) // Extraer información de la cantidad de palabras
            .reduce((result, post) => {
                result.posts.push(post);
                result.totalWordCount += post.totalWords;
                result.averageTitleWords = result.posts.reduce((sum, p) => sum + p.titleWords, 0) / result.posts.length;
                return result;
            }, { posts: [], totalWordCount: 0, averageTitleWords: 0 }); // Resumen de estadísticas
        
        // Usar sort + filter + map juntos
        // Encontrar las 3 publicaciones con más palabras en el título
        const topWordCountPosts = postsWithComments
            .sort((a, b) => b.titleWords - a.titleWords) // Ordenar por cantidad de palabras en el título
            .filter((_, index) => index < 3) // Seleccionar las primeras 3
            .map(post => ({ // Extraer los campos necesarios
                id: post.id,
                title: post.title,
                titleWords: post.titleWords,
                ratio: (post.titleWords / post.totalWords * 100).toFixed(1) + '%'
            }));

        // Mostrar resultados
        console.log('===== Resultados del análisis de datos =====');
        console.log(`Usuario: ${user.name}\n`);
        console.log('Combinación Filter + Map + Reduce:');
        console.log(`- Promedio total de palabras: ${avgTotalWords.toFixed(2)} palabras`);
        console.log(`- Encontradas ${wordCountAnalysis.posts.length} publicaciones con más palabras que el promedio`);
        console.log(`- Promedio de palabras en el título de estas publicaciones: ${wordCountAnalysis.averageTitleWords.toFixed(2)} palabras\n`);
    
        console.log('Combinación Sort + Filter + Map:');
        console.log('- Las 3 publicaciones con más palabras en el título:');
        topWordCountPosts.forEach((post, index) => {
            console.log(`  [${index + 1}] ${post.titleWords} palabras - ${post.ratio} del total de palabras - Título: ${post.title.slice(0, 30)}...`);
        });

        return {
            user,
            wordCountAnalysis,
            topWordCountPosts,
            commentLengthAnalysis
        };
        
    } catch (error) {
        console.error('Error al procesar datos:', error.message);
        throw error;
    }
}

console.log('Empezar a ejecutarse...\n');
processUserData(1)
    .then(() => console.log('\nFinalizado!'))
    .catch(error => console.error('\nError:', error.message));