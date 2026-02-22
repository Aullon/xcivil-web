// ===== CONFIG =====
const SUPABASE_URL = "SUPABASE_URL";
const SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY";

// Wompi
const WOMPI_PUBLIC_KEY = "WOMPI_PUBLIC_KEY"; // pub_test_... o pub_prod_...
const CURRENCY = "COP";

// WhatsApp contacto
const WHATSAPP = "573166012095";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helpers
const $ = (id) => document.getElementById(id);

function pageName() {
  return (location.pathname.split("/").pop() || "index.html").toLowerCase();
}

async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    location.href = "./login.html";
    return null;
  }
  return session;
}

async function isAdmin() {
  const session = await getSession();
  if (!session) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) return false;
  return data?.role === "admin";
}

function statusBadge(status) {
  if (status === "paid") return `<span class="badge2 badge2--ok">paid</span>`;
  if (status === "pending") return `<span class="badge2 badge2--warn">pending</span>`;
  return `<span class="badge2 badge2--bad">${status}</span>`;
}

// ===== FRONT: HOME =====
async function loadProjectsHome() {
  const grid = $("projectsGrid");
  if (!grid) return;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    grid.innerHTML = `<div class="box">No se pudieron cargar proyectos.</div>`;
    return;
  }

  if (!data.length) {
    grid.innerHTML = `<div class="box">Aún no hay proyectos. El admin puede agregarlos.</div>`;
    return;
  }

  grid.innerHTML = data.map((p) => {
    const cover = p.cover_url || "assets/project_1.png";
    const meta = [p.city, p.year, p.type].filter(Boolean).join(" • ");
    return `
      <article class="card">
        <img class="card__media" src="${cover}" alt="${p.title}" />
        <div class="card__body">
          <div class="card__title">${p.title}</div>
          <div class="card__meta">${meta}</div>
          <div class="card__desc">${p.summary || ""}</div>
        </div>
      </article>
    `;
  }).join("");
}

async function loadProductsHome() {
  const servicesGrid = $("servicesGrid");
  const plansGrid = $("plansGrid");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) return;

  const services = data.filter(x => x.kind === "service");
  const plans = data.filter(x => x.kind === "plan");

  if (servicesGrid) {
    servicesGrid.innerHTML = services.map((p) => `
      <article class="card">
        <div class="card__body">
          <div class="card__title">${p.name}</div>
          <div class="card__meta">${(p.price_cop || 0).toLocaleString("es-CO")} COP</div>
          <div class="card__desc">${p.description || ""}</div>
          <div class="mt"></div>
          <a class="btn btn--lime" href="./dashboard.html">Comprar (PSE)</a>
          <a class="btn btn--ghost" target="_blank" rel="noreferrer"
             href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola XCIVIL, quiero cotizar: ${p.name}.`) }">Cotizar</a>
        </div>
      </article>
    `).join("") || `<div class="box">Aún no hay servicios en catálogo.</div>`;
  }

  if (plansGrid) {
    plansGrid.innerHTML = plans.map((p) => `
      <article class="card">
        <div class="card__body">
          <div class="card__title">${p.name}</div>
          <div class="card__meta">${(p.price_cop || 0).toLocaleString("es-CO")} COP</div>
          <div class="card__desc">${p.description || ""}</div>
          <div class="mt"></div>
          <a class="btn btn--lime" href="./dashboard.html">Comprar (PSE)</a>
        </div>
      </article>
    `).join("") || `<div class="box">Aún no hay planos en catálogo.</div>`;
  }
}

// ===== AUTH =====
async function register() {
  const name = $("regName").value.trim();
  const phone = $("regPhone").value.trim();
  const email = $("regEmail").value.trim();
  const password = $("regPassword").value;

  $("regMsg").textContent = "Creando cuenta…";

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    $("regMsg").textContent = error.message;
    return;
  }

  // crear perfil
  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: name,
      phone,
    });
  }

  $("regMsg").textContent = "Cuenta creada. Ahora ingresa.";
}

async function login() {
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;

  $("loginMsg").textContent = "Ingresando…";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    $("loginMsg").textContent = error.message;
    return;
  }
  $("loginMsg").textContent = "Listo. Redirigiendo…";
  setTimeout(() => (location.href = "./dashboard.html"), 600);
}

async function logout() {
  await supabase.auth.signOut();
  location.href = "./index.html";
}

// ===== DASHBOARD =====
async function loadDashboard() {
  const session = await requireAuth();
  if (!session) return;

  const admin = await isAdmin();
  const adminLink = $("adminLink");
  if (adminLink) adminLink.style.display = admin ? "inline-flex" : "none";

  $("userInfo").textContent = `Usuario: ${session.user.email}`;

  // cargar productos para pagar
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  const sel = $("productSelect");
  if (sel) {
    sel.innerHTML = (products || []).map(p => `<option value="${p.id}" data-price="${p.price_cop}">${p.kind.toUpperCase()} • ${p.name} • ${p.price_cop.toLocaleString("es-CO")} COP</option>`).join("");
  }

  // compras
  await renderPurchases();
  // entregables
  await renderDeliverables();

  $("btnPayPSE").addEventListener("click", payPSE);
  $("btnLogout").addEventListener("click", logout);
}

async function renderPurchases() {
  const tbody = $("purchasesTable")?.querySelector("tbody");
  if (!tbody) return;

  const { data, error } = await supabase
    .from("purchases")
    .select("id,status,wompi_reference,products(name)")
    .order("created_at", { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="3">No se pudieron cargar compras.</td></tr>`;
    return;
  }

  tbody.innerHTML = (data || []).map(r => `
    <tr>
      <td>${r.products?.name || "-"}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${r.wompi_reference || "-"}</td>
    </tr>
  `).join("") || `<tr><td colspan="3">Aún no tienes compras.</td></tr>`;
}

async function renderDeliverables() {
  const tbody = $("deliverablesTable")?.querySelector("tbody");
  if (!tbody) return;

  const { data, error } = await supabase
    .from("deliverables")
    .select("id,file_path,file_name,purchases(status)")
    .order("created_at", { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="2">No se pudieron cargar entregables.</td></tr>`;
    return;
  }

  if (!data?.length) {
    tbody.innerHTML = `<tr><td colspan="2">Aún no tienes entregables.</td></tr>`;
    return;
  }

  // Link firmado (time-limited)
  const rows = [];
  for (const d of data) {
    const { data: signed } = await supabase.storage
      .from("deliverables")
      .createSignedUrl(d.file_path, 60 * 10); // 10 minutos

    rows.push(`
      <tr>
        <td>${d.file_name}</td>
        <td>
          ${signed?.signedUrl ? `<a class="btn btn--lime" href="${signed.signedUrl}" target="_blank" rel="noreferrer">Descargar</a>` : `<span class="muted">No disponible</span>`}
        </td>
      </tr>
    `);
  }
  tbody.innerHTML = rows.join("");
}

// ===== PAGO PSE (Wompi) =====
// Flujo seguro:
// 1) Llamamos a Edge Function create-checkout (servidor) para crear purchase + firma integrity
// 2) Abrimos widget con esa firma y referencia
async function payPSE() {
  const sel = $("productSelect");
  if (!sel || !sel.value) return;

  $("payMsg").textContent = "Creando checkout…";

  const productId = sel.value;
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: { product_id: productId, redirect_url: `${location.origin}/dashboard.html` },
  });

  if (error || !data) {
    $("payMsg").textContent = "No se pudo crear el checkout.";
    return;
  }

  const { reference, amount_in_cents, integrity_signature } = data;

  $("payMsg").textContent = "Abriendo Wompi…";

  // Widget Wompi
  const checkout = new WidgetCheckout({
    currency: CURRENCY,
    amountInCents: amount_in_cents,
    reference,
    publicKey: WOMPI_PUBLIC_KEY,
    signature: { integrity: integrity_signature },
    redirectUrl: `${location.origin}/dashboard.html`,
  });

  checkout.open(async (result) => {
    // Resultado inmediato (no confiar para entrega). La entrega real la hace el webhook.
    $("payMsg").textContent = "Pago iniciado. Espera confirmación…";
    // Recarga tablas (por si el webhook ya actualizó)
    setTimeout(async () => {
      await renderPurchases();
      await renderDeliverables();
    }, 2500);
  });
}

// ===== ADMIN =====
async function loadAdmin() {
  const session = await requireAuth();
  if (!session) return;

  const admin = await isAdmin();
  if (!admin) {
    $("adminInfo").textContent = "Acceso denegado. Solo administrador.";
    setTimeout(() => (location.href = "./dashboard.html"), 900);
    return;
  }

  $("adminInfo").textContent = `Admin: ${session.user.email}`;

  $("btnLogout").addEventListener("click", logout);
  $("btnAddProject").addEventListener("click", addProject);
  $("btnAddProduct").addEventListener("click", addProduct);
  $("btnAddAsset").addEventListener("click", addAsset);

  await refreshProductsForAssets();
  await renderAdminPurchases();
}

async function addProject() {
  const title = $("pTitle").value.trim();
  const city = $("pCity").value.trim();
  const year = $("pYear").value.trim();
  const type = $("pType").value.trim();
  const summary = $("pSummary").value.trim();
  const cover_url = $("pCover").value.trim();
  const gallery = ($("pGallery").value || "").split(",").map(s => s.trim()).filter(Boolean);
  let metrics = [];
  try { metrics = $("pMetrics").value.trim() ? JSON.parse($("pMetrics").value) : []; } catch { metrics = []; }

  $("projectMsg").textContent = "Guardando…";

  const { error } = await supabase.from("projects").insert({
    title, city, year, type, summary, cover_url,
    gallery, metrics
  });

  $("projectMsg").textContent = error ? error.message : "Proyecto agregado ✅";
}

async function addProduct() {
  const name = $("prodName").value.trim();
  const kind = $("prodKind").value;
  const price_cop = parseInt($("prodPrice").value, 10);
  const description = $("prodDesc").value.trim();

  $("productMsg").textContent = "Creando…";
  const { error } = await supabase.from("products").insert({ name, kind, price_cop, description, active: true });
  $("productMsg").textContent = error ? error.message : "Producto creado ✅";

  await refreshProductsForAssets();
}

async function refreshProductsForAssets() {
  const { data } = await supabase.from("products").select("id,name,kind,price_cop").order("created_at", { ascending: false });
  const sel = $("assetProductSelect");
  if (!sel) return;
  sel.innerHTML = (data || []).map(p => `<option value="${p.id}">${p.kind.toUpperCase()} • ${p.name}</option>`).join("");
}

async function addAsset() {
  const product_id = $("assetProductSelect").value;
  const file_path = $("assetPath").value.trim();
  const file_name = $("assetName").value.trim();

  $("assetMsg").textContent = "Guardando…";
  const { error } = await supabase.from("product_assets").insert({ product_id, file_path, file_name });
  $("assetMsg").textContent = error ? error.message : "Entregable asociado ✅";
}

async function renderAdminPurchases() {
  const tbody = $("adminPurchases")?.querySelector("tbody");
  if (!tbody) return;

  const { data, error } = await supabase
    .from("purchases")
    .select("status,wompi_reference,profiles(full_name),products(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    tbody.innerHTML = `<tr><td colspan="4">No se pudo cargar.</td></tr>`;
    return;
  }

  tbody.innerHTML = (data || []).map(r => `
    <tr>
      <td>${r.profiles?.full_name || "Usuario"}</td>
      <td>${r.products?.name || "-"}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${r.wompi_reference || "-"}</td>
    </tr>
  `).join("") || `<tr><td colspan="4">Sin compras aún.</td></tr>`;
}

// ===== Mobile nav =====
(function initMobileNav(){
  const navbtn = document.getElementById("navbtn");
  const navmobile = document.getElementById("navmobile");
  if (!navbtn || !navmobile) return;

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
})();

// ===== Router =====
(async function main(){
  const p = pageName();

  if (p === "index.html" || p === "") {
    await loadProjectsHome();
    await loadProductsHome();
    return;
  }

  if (p === "login.html") {
    $("btnRegister").addEventListener("click", register);
    $("btnLogin").addEventListener("click", login);

    const session = await getSession();
    if (session) {
      $("btnLogout").style.display = "inline-flex";
      $("btnLogout").addEventListener("click", logout);
      $("loginMsg").textContent = "Ya tienes sesión. Ve a Mi panel.";
    }
    return;
  }

  if (p === "dashboard.html") {
    await loadDashboard();
    return;
  }

  if (p === "admin.html") {
    await loadAdmin();
    return;
  }
})();
