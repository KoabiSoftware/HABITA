import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const db = new PrismaClient();
async function main() {
  const locations = await Promise.all(
    ["El Golf", "California", "Víctor Larco"].map((name) =>
      db.location.upsert({ where: { name }, create: { name }, update: {} }),
    ),
  );
  const categories = await Promise.all(
    ["Casa", "Departamento"].map((name) =>
      db.category.upsert({ where: { name }, create: { name }, update: {} }),
    ),
  );
  const records = [
    {
      slug: "casa-en-el-golf",
      title: "Casa en El Golf",
      price: 780000,
      area: 180,
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
      operation: "SALE" as const,
      locationId: locations[0].id,
      categoryId: categories[0].id,
      image: "casa",
      featured: true,
      description:
        "Una casa pensada para vivir sin prisas. Volúmenes contemporáneos, materiales naturales y un jardín privado se encuentran en una de las zonas residenciales más tranquilas de Trujillo. Sala de doble orientación, cocina integrada y tres dormitorios con luz natural. Propiedad de demostración: los datos y las imágenes son ilustrativos.",
      amenities: [
        "Jardín privado",
        "Terraza",
        "Cocina integrada",
        "Dormitorio principal con baño",
      ],
    },
    {
      slug: "departamento-en-california",
      title: "Departamento en California",
      price: 360000,
      area: 95,
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      operation: "SALE" as const,
      locationId: locations[1].id,
      categoryId: categories[1].id,
      image: "california",
      featured: true,
      description:
        "Luz, amplitud y una distribución que hace que cada metro cuente. Un departamento con balcón, sala comedor integrada y acabados en tonos naturales. Cercano a parques y servicios de California. Propiedad de demostración: los datos y las imágenes son ilustrativos.",
      amenities: [
        "Balcón",
        "Ascensor",
        "Cocina abierta",
        "Seguridad de acceso",
      ],
    },
    {
      slug: "departamento-en-victor-larco",
      title: "Departamento en Víctor Larco",
      price: 480000,
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      operation: "SALE" as const,
      locationId: locations[2].id,
      categoryId: categories[1].id,
      image: "larco",
      featured: true,
      description:
        "Espacios abiertos para compartir y rincones para desconectar. Este departamento reúne una sala comedor de generosas proporciones, tres dormitorios y una terraza con vistas despejadas. Propiedad de demostración: los datos y las imágenes son ilustrativos.",
      amenities: [
        "Terraza",
        "Ascensor",
        "Lavandería independiente",
        "Vista exterior",
      ],
    },
    {
      slug: "residencia-jardin-el-golf",
      title: "Residencia Jardín · El Golf",
      price: 5200,
      area: 210,
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
      operation: "RENT" as const,
      locationId: locations[0].id,
      categoryId: categories[0].id,
      image: "hero",
      featured: false,
      description:
        "Una residencia de arquitectura contemporánea conectada con su jardín. Grandes ventanales y espacios generosos para una vida tranquila. Alquiler mensual de demostración; disponibilidad y características ilustrativas.",
      amenities: ["Jardín", "Terraza", "Estudio", "Cochera doble"],
    },
    {
      slug: "loft-california",
      title: "Loft Terraza · California",
      price: 2400,
      area: 95,
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      operation: "RENT" as const,
      locationId: locations[1].id,
      categoryId: categories[1].id,
      image: "california",
      featured: false,
      description:
        "Un refugio urbano con acabados cálidos, balcón y áreas sociales conectadas. Distribución funcional y una ubicación residencial. Alquiler mensual de demostración; disponibilidad y características ilustrativas.",
      amenities: ["Balcón", "Cocina integrada", "Ascensor"],
    },
  ];
  for (const { image, ...data } of records) {
    const p = await db.property.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        address: `Zona residencial de ${locations.find((l) => l.id === data.locationId)?.name}, Trujillo`,
      },
    });
    if (!(await db.media.count({ where: { propertyId: p.id } })))
      await db.media.create({
        data: {
          propertyId: p.id,
          url: `/images/${image}.webp`,
          alt: data.title + " · imagen arquitectónica ilustrativa",
          position: 0,
        },
      });
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 14)
      throw Error("ADMIN_PASSWORD requiere al menos 14 caracteres.");
    await db.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      update: {},
      create: {
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        name: "Administración HÁBITA",
        passwordHash: await hash(process.env.ADMIN_PASSWORD, 12),
        role: "ADMIN",
      },
    });
  }
  console.log("Catálogo de demostración preparado.");
}
main().finally(() => db.$disconnect());
