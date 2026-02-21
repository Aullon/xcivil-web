// ====== CONFIG: cambia aquí tu WhatsApp, teléfono y correo ======
const BRAND = {
  whatsapp: "573000000000", // <-- CAMBIA esto
  phone: "+57 000 000 0000",
  email: "contacto@xcivil.co",
  location: "Neiva, Huila, Colombia",
};

const projects = [
  {
    id: "bim-interventoria-01",
    name: "Interventoría BIM – Edificación",
    city: "Neiva",
    year: "2025",
    type: "Interventoría BIM",
    summary:
      "Auditoría de modelos, control de entregables y reportes de coordinación por disciplina.",
    metrics: [
      { k: "Disciplinas", v: "ARQ / STR / MEP" },
      { k: "Frecuencia", v: "Mensual" },
      { k: "Entregables", v: "BCF + Informe" },
    ],
    gallery: ["Vista general", "Clash report", "Coordinación MEP", "Control 5D"],
  },
  {
    id: "bim-5d-02",
    name: "BIM 5D – Cantidades",
    city: "Huila",
    year: "2025",
    type: "BIM 5D",
    summary:
      "Cuantificación desde el modelo, matriz de supuestos y control de versiones para presupuesto.",
    metrics: [
      { k: "Área", v: "3.200 m²" },
      { k: "LOD", v: "300" },
      { k: "Salida", v: "Excel + IFC" },
    ],
    gallery: ["Modelo federado", "Tablero de cantidades", "Filtros por partidas", "Entrega"],
  },
  {
    id: "clash-03",
    name: "Coordinación – Clash & BCF",
    city: "Neiva",
    year: "2026",
    type: "Coordinación BIM",
    summary:
      "Detección de interferencias, priorización y seguimiento a cierre por disciplina.",
    metrics: [
      { k: "Rondas", v: "4" },
      { k: "Clashes", v: "180 → 12" },
      { k: "Tiempo", v: "3 semanas" },
    ],
    gallery: ["Clashes críticos", "BCF workflow", "Acta de comité", "Cierre"],
  },
];

const services = [
  {
    title: "Coordinación BIM (Clash)",
    desc: "Federación, detección de interferencias, reportes y seguimiento semanal.",
    bullets: ["Navisworks / IFC / BCF", "Reuniones + actas + control de cambios", "Entrega lista para obra"],
  },
  {
    title: "BIM 5D (Cantidades & Control)",
    desc: "Metrados confiables desde el modelo, bases para presupuesto y control de avance.",
    bullets: ["Cuantificación por partidas", "Supuestos y trazabilidad", "Tablero de control (Excel-ready)"],
  },
  {
    title: "Interventoría BIM",
    desc: "Auditoría de modelos, entregables, estándares, seguimiento contractual y reportes.",
    bullets: ["Checklist BEP / EIR", "Validación de entregables", "Informes mensuales para entidad/cliente"],
  },
  {
    title: "Diseño Estructural",
    desc: "Diseño, revisión y optimización. Coordinación con arquitectura e instalaciones.",
    bullets: ["Memorias + planos", "Optimización de materiales", "Compatibilidad con BIM"],
  },
  {
    title: "Obra y Adecuaciones",
    desc: "Ejecución con control, calidad y trazabilidad de cambios (cuando aplique).",
    bullets: ["Planeación y control", "Bitácora y actas", "Cierre con as-built"],
  },
  {
    title: "Catálogo de Planos",
    desc: "Planos tipo listos para construir. Upgrade: adaptación + soporte.",
    bullets: ["Casas y cabañas", "Estructuras tipo", "Compra digital + descarga"],
  },
];

const planStore = [
  { name: "Cabaña 60 m²", price: "$199.000", tag: "Más vendido", includes: ["PDF", "DWG", "Guía de construcción"] },
  { name: "Casa 90 m² (1 piso)", price: "$249.000", tag: "Rápido", includes: ["PDF", "DWG", "Cuadro de áreas"] },
  { name: "Casa 140 m² (2 pisos)", price: "$349.000", tag: "Pro", includes: ["PDF", "DWG", "Detalles constructivos"] },
];

function waLink(text) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
}

// ====== Render Projects ======
const projectsGrid = document.getElementById("projectsGrid");
projects.forEach((p) => {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.innerHTML = `
    <div class="card__media">
      <span class="card__tag">${p.type}</span>
    </div>
    <div class="card__body">
      <div class="card__title">${p.name}</div>
      <div class="card__meta">${p.city} • ${p.year}</div>
      <div class="card__desc">${p.summary}</div>
      <div class="pills">
        ${p.metrics.map((m) => `<span class="pill"><span style="opacity:.7">${m.k}:</span> ${m.v}</span>`).join("")}
      </div>
    </div>
  `;
  card.addEventListener("click", () => openModal(p));
  projectsGrid.appendChild(card);
});

// ====== Render Services ======
const servicesGrid = document.getElementById("servicesGrid");
services.forEach((s) => {
  const card = document.createElement("div");
  card.className = "box";
  card.innerHTML = `
    <h3>${s.title}</h3>
    <p class="muted">${s.desc}</p>
    <ul>
      ${s.bullets.map((b) => `<li>${b}</li>`).join("")}
    </ul>
    <div style="margin-top:12px">
      <a class="btn btn--lime" target="_blank" rel="noreferrer"
         href="${waLink(`Hola XCIVIL, quiero cotizar: ${s.title}. Proyecto en: __. Fecha: __.`)}">
        Cotizar por WhatsApp
      </a>
    </div>
  `;
  servicesGrid.appendChild(card);
});

// ====== Render Plan Store ======
const planStoreEl = document.getElementById("planStore");
planStore.forEach((pl) => {
  const item = document.createElement("div");
  item.className = "storeitem";
  item.innerHTML = `
    <div class="storeitem__top">
      <div>
        <div class="storeitem__name">${pl.name}</div>
        <div class="storeitem__tag">${pl.tag}</div>
      </div>
      <div class="storeitem__price">${pl.price}</div>
    </div>
    <div class="storeitem__chips">
      ${pl.includes.map((x) => `<span class="pill">${x}</span>`).join("")}
    </div>
    <div class="storeitem__actions">
      <a class="btn btn--lime" target="_blank" rel="noreferrer"
         href="${waLink(`Hola XCIVIL, quiero comprar el plano: ${pl.name}.`)}">
        Comprar por WhatsApp
      </a>
      <a class="btn btn--ghost" href="#contacto">Quiero adaptar este plano</a>
    </div>
  `;
  planStoreEl.appendChild(item);
});

// ====== Modal logic ======
const modal = document.getElementById("modal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDesc = document.getElementById("modalDesc");
const modalFacts = document.getElementById("modalFacts");
const modalGallery = document.getElementById("modalGallery");
const modalCta = document.getElementById("modalCta");

function openModal(p) {
  modalTitle.textContent = p.name;
  modalMeta.textContent = `${p.city} • ${p.year} • ${p.type}`;
  modalDesc.textContent = p.summary;

  modalFacts.innerHTML = p.metrics
    .map((m) => `<div class="fact"><span style="opacity:.7">${m.k}</span><b>${m.v}</b></div>`)
    .join("");

  modalGallery.innerHTML = p.gallery
    .map((g) => `<div class="gitem"><div class="gitem__label">${g}</div><div class="gitem__bar"></div></div>`)
    .join("");

  modalCta.href = waLink(`Hola XCIVIL, quiero una propuesta para ${p.type}. Proyecto: ${p.name}.`);

  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
}

modalBackdrop.addEventListener("click", closeModal);
closeModalBtn.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Hero example button opens first project
document.getElementById("openProject").addEventListener("click", () => openModal(projects[0]));

// ====== Form -> WhatsApp ======
document.getElementById("quoteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const msg =
`Hola XCIVIL, quiero cotizar BIM.
Nombre: ${fd.get("nombre")}
Empresa: ${fd.get("empresa") || "-"}
Correo: ${fd.get("correo") || "-"}
Celular: ${fd.get("celular") || "-"}
Necesidad: ${fd.get("necesidad")}`;

  window.open(waLink(msg), "_blank");
});

// ====== Mobile nav toggle ======
const navbtn = document.getElementById("navbtn");
const navmobile = document.getElementById("navmobile");

navbtn.addEventListener("click", () => {
  const expanded = navbtn.getAttribute("aria-expanded") === "true";
  navbtn.setAttribute("aria-expanded", String(!expanded));
  navmobile.hidden = expanded;
});

navmobile.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    navbtn.setAttribute("aria-expanded", "false");
    navmobile.hidden = true;
  });
});
