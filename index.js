const productosJSON = `[
  { "id": 1, "nombre": "Cheeseburger", "descripcion": "Medallón de carne, cheddar, pepinos y ketchup", "categoria": "Clásicas", "precio": 7500, "stock": 10, "imagen": "img/1.jpg" },
  { "id": 2, "nombre": "Clásica Completa", "descripcion": "Carne, lechuga, tomate y cebolla", "categoria": "Clásicas", "precio": 8200, "stock": 8, "imagen": "img/2.jpg" },
  { "id": 3, "nombre": "Cuarto de Libra", "descripcion": "Carne de 200 g, cheddar, cebolla y tomate", "categoria": "Clásicas", "precio": 9900, "stock": 0, "imagen": "img/3.jpg" },
  { "id": 4, "nombre": "Bacon BBQ", "descripcion": "Carne, panceta crocante, cheddar y salsa barbacoa", "categoria": "Especiales", "precio": 12500, "stock": 5, "imagen": "img/4.jpg" },
  { "id": 5, "nombre": "Provoleta", "descripcion": "Carne, provoleta fundida y cebolla caramelizada", "categoria": "Especiales", "precio": 13200, "stock": 4, "imagen": "img/5.jpg" },
  { "id": 6, "nombre": "Doble Cheddar", "descripcion": "Doble carne, doble cheddar, cebolla y lechuga", "categoria": "Especiales", "precio": 14000, "stock": 3, "imagen": "img/6.jpg" },
  { "id": 7, "nombre": "Combo Clásico", "descripcion": "Hamburguesa completa con papas fritas", "categoria": "Combos", "precio": 15900, "stock": 6, "imagen": "img/7.jpg" },
  { "id": 8, "nombre": "Combo Crispy", "descripcion": "Pollo crispy, coleslaw y papas fritas", "categoria": "Combos", "precio": 16500, "stock": 2, "imagen": "img/8.jpg" },
  { "id": 9, "nombre": "Combo Onion", "descripcion": "Carne, aros de cebolla, cheddar y papas fritas", "categoria": "Combos", "precio": 17800, "stock": 1, "imagen": "img/9.jpg" }
]`;

const productosIniciales = JSON.parse(productosJSON);
if (!localStorage.getItem("productos")) {
  localStorage.setItem("productos", JSON.stringify(productosIniciales));
}
const productos = JSON.parse(localStorage.getItem("productos")) || [];
console.table(productos);

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productosRenderizados = false;

const contenedorProductos = document.getElementById("products-container");
const listaCarrito = document.getElementById("cart-list");
const totalCarrito = document.getElementById("cart-total");
const contadorCarrito = document.getElementById("cart-counter");
const buscador = document.getElementById("buscador");
const ordenPrecio = document.getElementById("orden-precio");
const botonVaciar = document.getElementById("vaciar-carrito");
const titulo = document.getElementById("burger-house");

function formatoPrecio(valor) {
  return "$ " + Number(valor).toLocaleString("es-AR");
}

function renderizarProductos() {
  productosRenderizados = true;
  contenedorProductos.innerHTML = "";

  const categoriaSeleccionada = document.querySelector('input[name="categoria"]:checked').value;
  const texto = buscador.value.trim().toLocaleLowerCase("es");
  let resultado = productos.filter(producto => {
    const coincideCategoria = categoriaSeleccionada === "Todas" || producto.categoria === categoriaSeleccionada;
    const coincideTexto = producto.nombre.toLocaleLowerCase("es").includes(texto) ||
      producto.descripcion.toLocaleLowerCase("es").includes(texto);
    return coincideCategoria && coincideTexto;
  });

  // Ordenamos una copia del array para no modificar el original.
  resultado = [...resultado];
  if (ordenPrecio.value === "menor") resultado.sort((a, b) => a.precio - b.precio);
  if (ordenPrecio.value === "mayor") resultado.sort((a, b) => b.precio - a.precio);

  if (resultado.length === 0) {
    contenedorProductos.innerHTML = '<p class="sin-resultados">No se encontraron productos</p>';
    return;
  }

  resultado.forEach(producto => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "product-card";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const descripcion = document.createElement("p");
    descripcion.className = "descripcion";
    descripcion.textContent = producto.descripcion;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = formatoPrecio(producto.precio);

    const boton = document.createElement("button");
    boton.className = "btn-agregar";
    boton.type = "button";
    boton.textContent = producto.stock === 0 ? "SIN STOCK" : "AGREGAR AL CARRITO";
    boton.disabled = producto.stock === 0;
    boton.addEventListener("click", () => agregarAlCarrito(producto.id));

    tarjeta.append(imagen, nombre, descripcion, precio, boton);
    contenedorProductos.appendChild(tarjeta);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find(item => item.id === id);
  const itemCarrito = carrito.find(item => item.id === id);
  const cantidadActual = itemCarrito ? itemCarrito.cantidad : 0;

  if (cantidadActual >= producto.stock) {
    alert("No hay más stock disponible");
    return;
  }

  if (itemCarrito) itemCarrito.cantidad += 1;
  else carrito.push({ id: producto.id, cantidad: 1 });

  actualizarCarrito();
}

function quitarDelCarrito(id) {
  const item = carrito.find(item => item.id === id);
  if (!item) return;
  item.cantidad -= 1;
  if (item.cantidad <= 0) carrito = carrito.filter(item => item.id !== id);
  actualizarCarrito();
}

function actualizarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  if (carrito.length === 0) {
    const mensaje = document.createElement("li");
    mensaje.className = "carrito-vacio";
    mensaje.textContent = "Tu carrito está vacío";
    listaCarrito.appendChild(mensaje);
  } else {
    carrito.forEach(item => {
      const producto = productos.find(p => p.id === item.id);
      if (!producto) return;
      const subtotal = producto.precio * item.cantidad;
      total += subtotal;
      cantidadTotal += item.cantidad;

      const li = document.createElement("li");
      li.className = "cart-item";
      const nombre = document.createElement("span");
      nombre.className = "cart-item-name";
      nombre.textContent = `${producto.nombre} x${item.cantidad}`;

      const precio = document.createElement("span");
      precio.className = "cart-item-subtotal";
      precio.textContent = formatoPrecio(subtotal);

      const quitar = document.createElement("button");
      quitar.className = "btn-quitar";
      quitar.type = "button";
      quitar.textContent = "Quitar";
      quitar.addEventListener("click", () => quitarDelCarrito(item.id));

      li.append(nombre, precio, quitar);
      listaCarrito.appendChild(li);
    });
  }

  contadorCarrito.textContent = `Carrito (${cantidadTotal})`;
  totalCarrito.textContent = formatoPrecio(total);
  if (productosRenderizados) renderizarProductos();
}

titulo.addEventListener("click", renderizarProductos);
titulo.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    renderizarProductos();
  }
});

document.querySelectorAll('input[name="categoria"]').forEach(input => {
  input.addEventListener("change", () => {
    if (productosRenderizados) renderizarProductos();
  });
});
buscador.addEventListener("keyup", () => {
  if (productosRenderizados) renderizarProductos();
});
ordenPrecio.addEventListener("change", () => {
  if (productosRenderizados) renderizarProductos();
});
botonVaciar.addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
});

actualizarCarrito();
