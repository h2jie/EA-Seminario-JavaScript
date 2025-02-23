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
        
        // 1. Map: Añadir longitud del título y del contenido a las publicaciones
        const enhancedPosts = posts.map(post => ({
            ...post,
            titleLength: post.title.length,
            bodyLength: post.body.length,
            totalLength: post.title.length + post.body.length
        }));
        
        // 2. Sort: Ordenar publicaciones por longitud total
        const sortedPosts = [...enhancedPosts].sort((a, b) => 
            b.totalLength - a.totalLength
        );
        
        // 3. Filter: Filtrar publicaciones con títulos largos (longitud del título > 50)
        const longTitlePosts = enhancedPosts.filter(post => 
            post.titleLength > 50
        );
        
        // 4. Reduce: Calcular estadísticas básicas
        const stats = enhancedPosts.reduce((acc, post) => ({
            totalPosts: acc.totalPosts + 1,
            avgTitleLength: acc.avgTitleLength + post.titleLength,
            avgBodyLength: acc.avgBodyLength + post.bodyLength
        }), { totalPosts: 0, avgTitleLength: 0, avgBodyLength: 0 });
        
        // Calcular promedios
        stats.avgTitleLength = Math.round(stats.avgTitleLength / stats.totalPosts);
        stats.avgBodyLength = Math.round(stats.avgBodyLength / stats.totalPosts);

        // Mostrar resultados
        console.log('===== Resultados del análisis de datos =====');
        console.log(`Usuario: ${user.name}\n`);
        
        console.log('1. Estadísticas básicas:');
        console.log(`- Total de publicaciones: ${stats.totalPosts}`);
        console.log(`- Longitud promedio del título: ${stats.avgTitleLength} caracteres`);
        console.log(`- Longitud promedio del contenido: ${stats.avgBodyLength} caracteres\n`);
        
        console.log('2. Las 3 publicaciones más largas:');
        sortedPosts.slice(0, 3).forEach((post, index) => {
            console.log(`[${index + 1}] ${post.totalLength} caracteres - ${post.title.slice(0, 30)}...`);
        });
        
        console.log('\n3. Publicaciones con títulos largos:');
        console.log(`Se encontraron ${longTitlePosts.length} publicaciones con títulos largos:`);
        longTitlePosts.forEach((post, index) => {
            console.log(`[${index + 1}] ${post.titleLength} caracteres - ${post.title.slice(0, 30)}...`);
        });

        return {
            user,
            stats,
            sortedPosts,
            longTitlePosts
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