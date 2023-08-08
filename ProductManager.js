// llamada al sistema de archivos

const fs = require('fs').promises;

/****************************************************************************************
 * creacion de la clase Product Manager                                                 *
 * **************************************************************************************/

class ProductManager {
    constructor(filePath) {
        this.products = []; 
        this.path = filePath; // direccion del archivo de productos
        this.loadProducts(); // llama al método para cargar los productos al inicio
        this.nextProductId = this.getNextProductId(); // obtencion del próximo ID a generar
        
    }

// Método para cargar los productos desde el archivo al inicio

async loadProducts() {
    try {
        console.log('Cargando productos...');
        await fs.access(this.path);
        const data = await fs.readFile(this.path, 'utf-8');
        this.products = JSON.parse(data);
        this.nextProductId = await this.getNextProductId(); 
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        console.error(error.stack);
        if (error.code === 'ENOENT') {
            console.log('El archivo no existe. Se creará uno nuevo.');
            this.nextProductId = await this.getNextProductId();
            await this.saveProducts();
        } else {
            console.error('Error al cargar los productos:', error);
        }
    }
}


// Método para obtener el próximo ID

async getNextProductId() {
    try {
        await fs.access(this.path);
        const data = await fs.promises.readFile(this.path, 'utf-8');
        this.products = JSON.parse(data);

        let highestId = 0;
        for (const product of this.products) {
            if (product.id > highestId) {
                highestId = product.id;
            }
        }
        return highestId + 1;
    } catch (error) {
        console.error('Error al obtener el próximo ID:', error);
        if (error.code === 'ENOENT') {
            console.log('El archivo no existe. Se creará uno nuevo.');
            await this.saveProducts();
            return 1;
        } else {
            console.error('Error al cargar los productos:', error);
            return;
        }
    }
}

// Creación del método addProduct 

    async addProduct(
        title,
        description,
        price,
        thumbnail,
        code,
        stock) {
        if (!title || !description || !price || !thumbnail || !code || !stock) {
            console.error("Todos los campos son obligatorios.");
            return;
        }

        const isCodeRepeated = this.products.some(product => product.code === code);

        if (isCodeRepeated) {
            console.error(`El código "${code}" ya existe en otro producto.`);
            return;
        }

        const newProduct = {
            id: await this.nextProductId,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
        };

        this.products.push(newProduct);
        await this.saveProducts(); // Llama al método para guardar los productos en el archivo
        this.nextProductId++;
        console.log("Producto agregado correctamente:", newProduct);
    }

// creación del Método getProducts

    async getProducts() {
        console.log(this.products);
        return this.products;
    }

// creación del Método getProductsById 


    async getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (product) {
            console.log(product, "Se encontró mediante búsqueda por id");
            return product;
        } else {
            console.error(`La ID "${id}" no pudo ser encontrada`);
            return;
        }
    }

// creación del Método updateProduct


    async updateProduct(id, titulo, descripcion, precio, imagen, codigo, existencia) {
        const product = this.products.find(product => product.id === id);
        if (!product) {
            console.error(`La ID "${id}" no pudo ser encontrada`);
            return;
        }

        // Actualiza solo los campos que se han recibido con datos
        if (titulo != null) {
            product.title = titulo;
        }
        if (descripcion != null) {
            product.description = descripcion;
        }
        if (precio != null) {
            product.price = precio;
        }
        if (imagen != null) {
            product.thumbnail = imagen;
        }
        if (codigo != null) {
            product.code = codigo;
        }
        if (existencia != null) {
            product.stock = existencia;
        }

        await this.saveProducts(); // Llama al método para guardar los productos en el archivo
        console.log(product, `Se actualizó en la id ${id}`);
        return product;
    }

// creación del Método para guardar los productos en el archivo

async saveProducts() {
    try {
        const myJSON = JSON.stringify(this.products);
        await fs.writeFile(this.path, myJSON);
        console.log('Archivo grabado correctamente');
    } catch (error) {
        console.error('Error al grabar el archivo:', error);
    }
}

// creación del Método deleteProduct

    async deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            console.error(`La ID "${id}" no pudo ser encontrada`);
            return;
        }

        this.products.splice(productIndex, 1);
        await this.saveProducts(); // Llama al método para guardar los productos en el archivo
        console.log(`Producto con ID "${id}" eliminado correctamente`);
    }
}

/****************************************************************************************
 * Final de la clase Product Manager                                                    *
 * **************************************************************************************/

// Prueba de la clase 
async function prueba () {
// creación de la instancia productManager de la clase ProductManager
  
  const productManager = new ProductManager('./productos.json');

// llamar al metodo “getProducts” y debe devolver un arreglo vacío 
  
  await productManager.getProducts();
  console.log (productManager.products);
  
// agregado del producto de prueba 
  
  await productManager.addProduct("producto prueba", "Este es un producto prueba", 200, "sin imagen", "abc123", 25);
  await productManager.getProducts();
  console.log (productManager.products);

// intento de agregar el mismo producto por segunda vez
  
  await productManager.addProduct("producto prueba", "Este es un producto prueba", 200, "sin imagen", "abc123", 25);
  
  
// pruebas del metodo getProductById 
  
  let productIdToFind = 1;
  let productById = await productManager.getProductById(productIdToFind); // debe encontrarlo
  
  
  productIdToFind = 2; 
  productById = await productManager.getProductById(productIdToFind); // no debe encontrarlo

// agregado de mas productos de prueba

await productManager.addProduct("producto prueba 2", "Este es un producto prueba 2", 300, "sin imagen", "efd456", 50);
await productManager.addProduct("producto prueba 3", "Este es un producto prueba 3", 400, "sin imagen", "jkl789", 70);
await productManager.addProduct("producto prueba 4", "Este es un producto prueba 4", 500, "sin imagen", "mno147", 90);

console.table (productManager.products);

// prueba del método updateProduct

await productManager.updateProduct(2,'nuevotitulo','nueva descripcion', 1000, "todavia no hay imagenes",null,500);
console.table (productManager.products);  

// prueba del método deleteProduct

await productManager.deleteProduct (3); // producto debe existir
await productManager.deleteProduct (7); // producto inexistente

console.table (productManager.products); 
}

prueba ()
