
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ShoppingCart,
  Truck,
  ShieldCheck,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Star,
  Send
} from "lucide-react";

import { jsPDF } from "jspdf";
import { PRODUCTS as PRODUCT_DATA } from "./data/products.js";
import "./App.css";

const WHATSAPP = "522821129983"; // Número de WhatsApp de BEST MODA

const PRODUCTS = Array.isArray(PRODUCT_DATA) ? PRODUCT_DATA : [];

// Agrega aquí únicamente las reseñas que tú hayas aprobado.
// Ejemplo:
// {
//   id: 1,
//   name: "María",
//   rating: 5,
//   comment: "Excelente calidad y atención.",
//   date: "15/11/2026"
// }
const APPROVED_REVIEWS = [];


const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(value) || 0);

const getProductImage = (product, color) =>
  product?.images?.[color] || product?.image || "";

// Existencias configuradas manualmente en src/data/products.js.
const getVariantStock = (product, color, size) =>
  Math.max(0, Number(product?.stock?.[color]?.[size]) || 0);

const getProductStock = (product) =>
  Object.values(product?.stock || {}).reduce(
    (colorTotal, sizes) =>
      colorTotal + Object.values(sizes || {}).reduce(
        (sizeTotal, amount) => sizeTotal + Math.max(0, Number(amount) || 0),
        0
      ),
    0
  );

export default function App() {
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [lightbox, setLightbox] = useState({
    open: false,
    src: "",
    alt: ""
  });
  const [zoomed, setZoomed] = useState(false);

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    references: ""
  });

  const categories = ["Todos", "Hombre", "Mujer", "Pants Estilo Cargo", "Pijamas"];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        category === "Todos" || product.category === category;

      const matchesSearch = String(product.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        product.active !== false &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [category, search]);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedStock = selectedProduct
    ? getVariantStock(selectedProduct, selectedColor, selectedSize)
    : 0;

  const openLightbox = (src, alt = "Fotografía del producto") => {
    if (!src) {
      alert("No hay una fotografía disponible para este producto.");
      return;
    }

    setZoomed(false);
    setLightbox({ open: true, src, alt });
  };

  const closeLightbox = () => {
    setLightbox({ open: false, src: "", alt: "" });
    setZoomed(false);
  };

  useEffect(() => {
    if (!lightbox.open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === " " || event.key === "Enter") {
        if (event.target.tagName !== "BUTTON") {
          event.preventDefault();
          setZoomed((previous) => !previous);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightbox.open]);

  const openProduct = (product) => {
    if (!product) return;

    const colors = Array.isArray(product.colors)
      ? product.colors
      : [];

    const sizes = Array.isArray(product.sizes)
      ? product.sizes
      : [];

    setSelectedProduct(product);
    setSelectedColor(colors[0] || "");
    setSelectedSize(sizes[0] || "");
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedProduct || !selectedColor || !selectedSize) {
      alert("Selecciona el color y la talla.");
      return;
    }

    const availableStock = getVariantStock(
      selectedProduct,
      selectedColor,
      selectedSize
    );

    if (availableStock <= 0) {
      alert("Este color y talla están agotados.");
      return;
    }

    const key = `${selectedProduct.id}-${selectedColor}-${selectedSize}`;
    const alreadyInCart = cart.find((item) => item.key === key)?.quantity || 0;

    if (alreadyInCart + quantity > availableStock) {
      alert(`Solo hay ${availableStock - alreadyInCart} pieza(s) disponible(s) de esta combinación.`);
      return;
    }

    const selectedImage = getProductImage(
      selectedProduct,
      selectedColor
    );

    setCart((previous) => {
      const existing = previous.find((item) => item.key === key);

      if (existing) {
        return previous.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...previous,
        {
          key,
          id: selectedProduct.id,
          name: selectedProduct.name,
          image: selectedImage,
          price: Number(selectedProduct.price) || 0,
          color: selectedColor,
          size: selectedSize,
          quantity
        }
      ];
    });

    setSelectedProduct(null);
    setCartOpen(true);
  };

  const changeQuantity = (key, amount) => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: Math.max(0, item.quantity + amount)
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (key) => {
    setCart((previous) =>
      previous.filter((item) => item.key !== key)
    );
  };

  const updateCustomer = (event) => {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const generateOrderPDF = (orderNumber) => {
    const doc = new jsPDF();

    doc.setFillColor(17, 17, 17);
    doc.rect(0, 0, 210, 38, "F");

    doc.setTextColor(214, 179, 106);
    doc.setFontSize(24);
    doc.text("BEST MODA", 18, 19);

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("MODA Y ESTILO", 18, 28);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.text("RESUMEN DE PEDIDO", 18, 52);

    doc.setFontSize(10);
    doc.text(`Pedido: ${orderNumber}`, 18, 62);
    doc.text(
      `Fecha: ${new Date().toLocaleDateString("es-MX")}`,
      18,
      69
    );

    doc.text(`Cliente: ${customer.name}`, 18, 82);
    doc.text(`Telefono: ${customer.phone}`, 18, 89);

    const addressLines = doc.splitTextToSize(
      `Direccion: ${customer.address}`,
      175
    );

    doc.text(addressLines, 18, 96);

    let y = 110 + (addressLines.length - 1) * 5;

    doc.setFont("helvetica", "bold");
    doc.text("Producto", 18, y);
    doc.text("Color / Talla", 95, y);
    doc.text("Cant.", 145, y);
    doc.text("Importe", 165, y);

    y += 8;
    doc.setFont("helvetica", "normal");

    cart.forEach((item) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.text(item.name.substring(0, 35), 18, y);
      doc.text(`${item.color} / ${item.size}`, 95, y);
      doc.text(String(item.quantity), 145, y);
      doc.text(money(item.price * item.quantity), 165, y);

      y += 9;
    });

    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`TOTAL: ${money(total)}`, 145, y);

    y += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("BEST MODA - Perote", 18, y);
    doc.text("Gracias por tu preferencia.", 18, y + 7);

    doc.save(`BEST-MODA-Pedido-${orderNumber}.pdf`);
  };

  const sendWhatsAppOrder = (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      alert("Completa tu nombre, teléfono y dirección.");
      return;
    }

    const orderNumber = `BM-${Date.now().toString().slice(-8)}`;

    const productLines = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}\n` +
          `Color: ${item.color}\n` +
          `Talla: ${item.size}\n` +
          `Cantidad: ${item.quantity}\n` +
          `Precio: ${money(item.price * item.quantity)}`
      )
      .join("\n\n");

    const message =
      `¡Hola BEST MODA! Quiero realizar el siguiente pedido:\n\n` +
      `Pedido: ${orderNumber}\n\n` +
      `${productLines}\n\n` +
      `TOTAL: ${money(total)}\n\n` +
      `DATOS DEL CLIENTE\n` +
      `Nombre: ${customer.name}\n` +
      `Teléfono: ${customer.phone}\n` +
      `Dirección: ${customer.address}\n` +
      `Referencias: ${customer.references || "No proporcionadas"}\n\n` +
      `¿Me pueden confirmar la disponibilidad y entrega?`;

    try {
      generateOrderPDF(orderNumber);

      const whatsappURL =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

      window.open(whatsappURL, "_blank");
    } catch (error) {
      console.error("Error al generar el pedido:", error);
      alert("No se pudo generar el pedido. Intenta nuevamente.");
    }
  };

  const sendReview = (event) => {
    event.preventDefault();

    if (!reviewName.trim() || !reviewComment.trim()) {
      alert("Completa tu nombre y escribe tu opinión.");
      return;
    }

    const stars = "★".repeat(reviewRating) + "☆".repeat(5 - reviewRating);

    const message =
      `¡Hola BEST MODA! Quiero enviar una opinión sobre mi experiencia.\n\n` +
      `NOMBRE: ${reviewName.trim()}\n` +
      `CALIFICACIÓN: ${stars} (${reviewRating}/5)\n` +
      `OPINIÓN: ${reviewComment.trim()}\n\n` +
      `Quiero que revisen mi opinion!!`;

    const whatsappURL =
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");

    setReviewName("");
    setReviewRating(5);
    setReviewComment("");
  };

  return (
    <div className="app">
      <div className="announcement">
        ENVÍOS Y ENTREGAS · ATENCIÓN PERSONALIZADA POR WHATSAPP
      </div>

      <header className="header">
        <button
          className="icon-button mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <a href="#inicio" className="brand">
          <span>BEST</span> MODA
          <small>MODA & ESTILO</small>
        </a>

        <nav className={menuOpen ? "nav active" : "nav"}>
          <a href="#inicio" onClick={() => setMenuOpen(false)}>Inicio</a>
          <a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a>
          <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a>
          <a href="#opiniones" onClick={() => setMenuOpen(false)}>Opiniones</a>
          <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
        </nav>

        <button
          className="cart-button"
          onClick={() => setCartOpen(true)}
          aria-label="Abrir carrito"
        >
          <ShoppingBag size={21} />
          <span>Carrito</span>
          <b>{totalItems}</b>
        </button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <span className="eyebrow">NUEVA COLECCIÓN</span>

            <h1>
              VISTE CON
              <br />
              <span>ESTILO.</span>
            </h1>

            <p>
              Descubre prendas que combinan elegancia, comodidad
              y personalidad. Encuentra tu próximo chaleco favorito.
            </p>

            <a href="#catalogo" className="gold-button">
              DESCUBRIR COLECCIÓN <ChevronRight size={18} />
            </a>

            <div className="hero-note">
              <span></span> BEST MODA · PEROTE
            </div>
          </div>

          <div className="hero-image">
            <img
              src="/imagenes/chaleco-negro.jpg"
              alt="Colección de chalecos BEST MODA"
            />

            <div className="image-label">
              <span>BEST MODA</span>
              <small>ESTILO QUE TE DISTINGUE</small>
            </div>
          </div>
        </section>

        <section className="benefits">
          <div>
            <Truck />
            <span>ENTREGAS EN PEROTE</span>
          </div>

          <div>
            <ShieldCheck />
            <span>ATENCIÓN PERSONALIZADA</span>
          </div>

          <div>
            <MessageCircle />
            <span>PEDIDOS POR WHATSAPP</span>
          </div>
        </section>

        <section className="catalog-section" id="catalogo">
          <div className="section-heading">
            <span className="eyebrow">NUESTRA SELECCIÓN</span>
            <h2>DESCUBRE TU <span>ESTILO</span> SOLO <span>TÚ</span> PUEDES HACER <span>GRANDE</span> ESTO</h2>
            <p>Encuentra el chaleco ideal para cada ocasión.</p>
          </div>

          <div className="catalog-tools">
            <div className="categories">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "category active" : "category"}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar chaleco..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <button
                  type="button"
                  className="product-image"
                  onClick={() =>
                    openLightbox(product.image, product.name)
                  }
                  aria-label={`Ampliar fotografía de ${product.name}`}
                >
                  <img src={product.image} alt={product.name} />

                  <span className="product-tag">BEST MODA</span>

                  <span className="product-zoom-icon">
                    <ZoomIn size={21} />
                  </span>
                </button>

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className={getProductStock(product) > 0 ? "product-stock" : "product-stock out-of-stock"}>
                    {getProductStock(product) > 0
                      ? `Disponibles: ${getProductStock(product)} piezas`
                      : "Agotado"}
                  </div>

                  <div className="product-bottom">
                    <strong>{money(product.price)}</strong>

                    <button onClick={() => openProduct(product)}>
                      <h2>ELEGIR</h2><Plus size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="empty-message">
              No encontramos productos con esa búsqueda.
            </p>
          )}
        </section>

        <section className="about-section" id="nosotros">
          <span className="eyebrow">NUESTRA ESENCIA</span>

          <h2>
            LA ELEGANCIA ESTÁ EN <span>LOS DETALLES.</span>
          </h2>

          <p>
            En BEST MODA queremos ayudarte a encontrar prendas que
            reflejen tu personalidad. Elige tu modelo, selecciona tu talla
            y color, y realiza tu pedido de manera sencilla por WhatsApp.
          </p>
        </section>

        <section className="reviews-section" id="opiniones">
          <div className="section-heading">
            <span className="eyebrow">EXPERIENCIAS BEST MODA</span>
            <h2>OPINIONES DE <span>NUESTROS CLIENTES</span></h2>
            <p>Tu experiencia es importante para nosotros.</p>
          </div>

          <div className="reviews-content">
            <div className="reviews-list">
              {APPROVED_REVIEWS.length > 0 ? (
                APPROVED_REVIEWS.map((review) => (
                  <article className="review-card" key={review.id}>
                    <div className="review-stars" aria-label={`${review.rating} de 5 estrellas`}>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>

                    <p className="review-comment">
                      “{review.comment}”
                    </p>

                    <div className="review-author">
                      <strong>{review.name}</strong>
                      <span>{review.date}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="reviews-empty">
                  <Star size={30} />
                  <h3>Tu opinión puede ser la primera</h3>
                  <p>
                    Comparte tu experiencia con BEST MODA.
                    Las opiniones se publican después de ser revisadas.
                  </p>
                </div>
              )}
            </div>

            <div className="review-form-card">
              <span className="eyebrow">COMPARTE TU EXPERIENCIA</span>
              <h3>ESCRIBE TU OPINIÓN</h3>
              <p>
                Envíanos tu comentario. Lo recibiremos por WhatsApp
                y revisaremos si puede publicarse.
              </p>

              <form onSubmit={sendReview}>
                <label htmlFor="reviewName">Tu nombre</label>
                <input
                  id="reviewName"
                  type="text"
                  value={reviewName}
                  onChange={(event) => setReviewName(event.target.value)}
                  placeholder="Escribe tu nombre"
                  maxLength={60}
                  required
                />

                <label>Tu calificación</label>
                <div className="rating-selector" aria-label="Seleccionar calificación">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={star <= reviewRating ? "rating-star active" : "rating-star"}
                      onClick={() => setReviewRating(star)}
                      aria-label={`${star} estrellas`}
                      aria-pressed={reviewRating === star}
                    >
                      <Star size={27} fill={star <= reviewRating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>

                <label htmlFor="reviewComment">Tu opinión</label>
                <textarea
                  id="reviewComment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Cuéntanos cómo fue tu experiencia..."
                  rows="5"
                  maxLength={600}
                  required
                />

                <small className="review-privacy">
                  Tu opinión no aparecerá en la página hasta que BEST MODA la apruebe.
                </small>

                <button type="submit" className="whatsapp-button review-submit">
                  <Send size={18} />
                  ENVIAR OPINIÓN POR WHATSAPP
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer id="contacto">
        <div className="footer-brand">
          <a href="#inicio" className="brand">
            <span>BEST</span> MODA
            <small>MODA & ESTILO</small>
          </a>

          <p>Tu estilo, tu esencia.</p>
        </div>

        <div>
          <h4>UBICACIÓN</h4>
          <p>Perote</p>
          <p>Entregas a domicilio en Perote.</p>
        </div>

        <div>
          <h4>CONTACTO</h4>

          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} /> WhatsApp
          </a>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} BEST MODA. TODOS LOS DERECHOS RESERVADOS.
        </div>
      </footer>

      {selectedProduct && (
        <div
          className="overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedProduct(null)}
              aria-label="Cerrar"
            >
              <X />
            </button>

            <button
              type="button"
              className="modal-image-button"
              onClick={() =>
                openLightbox(
                  getProductImage(selectedProduct, selectedColor),
                  `${selectedProduct.name} ${selectedColor}`
                )
              }
              aria-label="Ampliar fotografía del producto"
            >
              <img
                key={`${selectedProduct.id}-${selectedColor}`}
                src={getProductImage(selectedProduct, selectedColor)}
                alt={`${selectedProduct.name} ${selectedColor}`}
                className="modal-image"
              />
              <span className="modal-zoom-hint">
                <ZoomIn size={17} /> AMPLIAR IMAGEN
              </span>
            </button>

            <div className="modal-details">
              <span className="eyebrow">
                {selectedProduct.category}
              </span>

              <h2>{selectedProduct.name}</h2>

              <strong className="modal-price">
                {money(selectedProduct.price)}
              </strong>

              <p>{selectedProduct.description}</p>
              <div className={selectedStock > 0 ? "variant-stock" : "variant-stock out-of-stock"}>
                {selectedStock > 0
                  ? `Existencias para ${selectedColor} / ${selectedSize}: ${selectedStock}`
                  : `Agotado: ${selectedColor} / ${selectedSize}`}
              </div>

              <label>COLOR: <b>{selectedColor}</b></label>

              <div className="option-list">
                {(Array.isArray(selectedProduct.colors)
                  ? selectedProduct.colors
                  : []
                ).map((color) => (
                  <button
                    key={color}
                    className={
                      selectedColor === color
                        ? "option selected"
                        : "option"
                    }
                    onClick={() => {
                      setSelectedColor(color);
                      setQuantity(1);
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>

              <label>TALLA: <b>{selectedSize}</b></label>

              <div className="option-list">
                {(Array.isArray(selectedProduct.sizes)
                  ? selectedProduct.sizes
                  : []
                ).map((size) => (
                  <button
                    key={size}
                    className={
                      selectedSize === size
                        ? "option selected"
                        : "option"
                    }
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <label>CANTIDAD</label>

              <div className="quantity-control">
                <button
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                >
                  <Minus size={16} />
                </button>

                <b>{quantity}</b>

                <button
                  onClick={() => setQuantity(Math.min(selectedStock, quantity + 1))}
                  disabled={quantity >= selectedStock}
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                className="gold-button full-button"
                onClick={addToCart}
                disabled={selectedStock <= 0 || quantity > selectedStock}
              >
                AGREGAR AL CARRITO
                <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox.open && (
        <div
          className="lightbox-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de fotografía"
        >
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Cerrar fotografía"
          >
            <X size={27} />
          </button>

          <div
            className="lightbox-image-container"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className={zoomed ? "lightbox-image zoomed" : "lightbox-image"}
              onClick={() => setZoomed((previous) => !previous)}
            />
          </div>

          <div
            className="lightbox-controls"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setZoomed(false)}
              aria-label="Alejar imagen"
              title="Alejar"
            >
              <ZoomOut size={20} />
            </button>

            <span>{zoomed ? "ZOOM 2X" : "VISTA COMPLETA"}</span>

            <button
              onClick={() => setZoomed(true)}
              aria-label="Acercar imagen"
              title="Acercar"
            >
              <ZoomIn size={20} />
            </button>

            <button
              onClick={() => setZoomed(false)}
              aria-label="Restablecer zoom"
              title="Restablecer"
            >
              <RotateCcw size={19} />
            </button>
          </div>

          <p className="lightbox-instruction">
            Toca la fotografía para acercar o alejar · ESC para cerrar
          </p>
        </div>
      )}

      {cartOpen && (
        <div
          className="overlay cart-overlay"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow">BEST MODA</span>
                <h2>MI CARRITO ({totalItems})</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setCartOpen(false)}
                aria-label="Cerrar carrito"
              >
                <X />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={45} />
                  <h3>Tu carrito está vacío</h3>
                  <p>Agrega tus chalecos favoritos.</p>

                  <button
                    className="gold-button"
                    onClick={() => setCartOpen(false)}
                  >
                    VER CATÁLOGO
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.key}>
                    <img src={item.image} alt={item.name} />

                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>Color: {item.color}</p>
                      <p>Talla: {item.size}</p>

                      <strong>
                        {money(item.price * item.quantity)}
                      </strong>

                      <div className="quantity-control small">
                        <button
                          onClick={() => changeQuantity(item.key, -1)}
                        >
                          <Minus size={13} />
                        </button>

                        <b>{item.quantity}</b>

                        <button
                          onClick={() => changeQuantity(item.key, 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <button
                      className="delete-button"
                      onClick={() => removeItem(item.key)}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary">
                <div className="total-row">
                  <span>TOTAL DEL PEDIDO</span>
                  <strong>{money(total)}</strong>
                </div>

                <button
                  className="gold-button full-button"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                >
                  CONTINUAR PEDIDO <ChevronRight size={18} />
                </button>

                <p>
                  Las entregas en Perote se coordinan por WhatsApp.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div
          className="overlay"
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className="checkout-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setCheckoutOpen(false)}
              aria-label="Cerrar"
            >
              <X />
            </button>

            <span className="eyebrow">ÚLTIMO PASO</span>

            <h2>DATOS DE <span>ENTREGA</span></h2>

            <p>Completa tus datos para preparar tu pedido.</p>

            <form onSubmit={sendWhatsAppOrder}>
              <label>Nombre completo *</label>

              <input
                name="name"
                value={customer.name}
                onChange={updateCustomer}
                placeholder="Escribe tu nombre"
                required
              />

              <label>Teléfono *</label>

              <input
                name="phone"
                type="tel"
                value={customer.phone}
                onChange={updateCustomer}
                placeholder="Tu número de teléfono"
                required
              />

              <label>Dirección de entrega *</label>

              <input
                name="address"
                value={customer.address}
                onChange={updateCustomer}
                placeholder="Calle, colonia y número"
                required
              />

              <label>Referencias adicionales</label>

              <textarea
                name="references"
                value={customer.references}
                onChange={updateCustomer}
                placeholder="Indicaciones para localizar tu domicilio"
                rows="3"
              />

              <div className="checkout-total">
                <span>Total de tu pedido</span>
                <strong>{money(total)}</strong>
              </div>

              <button type="submit" className="whatsapp-button">
                <MessageCircle size={20} />
                GENERAR PDF Y PEDIR POR WHATSAPP
              </button>

              <small className="form-note">
                Se descargará el comprobante PDF y se abrirá WhatsApp
                con los detalles de tu pedido.
              </small>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
