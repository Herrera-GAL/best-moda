
export const PRODUCTS = [
  {
    
    id: 1,
    name: "Chaleco Premium Hombre",
    category: "Hombre",
    price: 200,
    image: "/imagenes/chaleco-negro.jpg",

    stock: {
      Negro: { CH: 0, M: 0, G: 0, EG: 0 },
      DarkNavy: { CH: 0, M: 0, G: 0, EG: 0 },
      DarkGray: { CH: 0, M: 0, G: 0, EG: 0 },
      Chocolate: { CH: 0, M: 0, G: 0, EG: 0 }
    },

    images: {
      Negro: "/imagenes/chaleco-negro.jpg",
      "Dark Navy": "/imagenes/chaleco-azul.jpg",
      "Dark Gray": "/imagenes/chaleco-gris.jpg",
      Chocolate: "/imagenes/chaleco-café.jpg"
    },

    description: "Chaleco premium para hombre, elegante y cómodo.",
    colors: ["Negro", "Dark Navy", "Dark Gray", "Chocolate"],
    sizes: ["CH", "M", "G", "EG"],
    active: true
  },

  {
    id: 2,
    name: "Chaleco Premium Mujer",
    category: "Mujer",
    price: 200,
    image: "/imagenes/chaleco-negro-mujer.jpeg",

    stock: {
      Negro: { CH: 2, M: 1, G: 2, EG: 2 },
      Rojo: { CH: 1, M: 1, G: 1, EG: 1 },
      Bronze: { CH: 1, M: 1, G: 1, EG: 1 },
      Beige: { CH: 1, M: 1, G: 1, EG: 1 },
      Grey: { CH: 1, M: 1},
      Purple: { CH: 1},
      Pink: { CH: 1},
      Coral: { M: 2}
    },

    images: {
      Negro: "/imagenes/chaleco-negro-mujer.jpeg",
      Beige: "/imagenes/chaleco-beige.jpeg",
      Rojo: "/imagenes/chaleco-rojo.jpeg",
      Bronze: "/imagenes/chaleco-bronze.jpeg",
      Grey: "/imagenes/chaleco-grey.jpeg",
      Purple: "/imagenes/chaleco-purple.jpeg",
      Pink: "/imagenes/chaleco-pink.jpeg",
      Coral: "/imagenes/chaleco-coral.jpeg"
    },

    description: "Chaleco casual para mujer con diseño moderno.",
    colors: ["Negro", "Beige", "Rojo", "Bronze", "Grey", "Purple", "Pink", "Coral"],
    sizes: ["CH", "M", "G", "EG"],
    active: true
  },
];
