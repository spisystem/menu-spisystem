// Vercel Serverless Function — POST /api/create-checkout-session
//
// Riceve il contenuto del carrello (solo productId/quantità/personalizzazioni,
// MAI un prezzo) e crea una sessione di pagamento Stripe Checkout in modalità test.
//
// Il totale viene SEMPRE ricalcolato qui, lato server:
//  - il prezzo base del prodotto viene letto dal Google Sheet (stessa fonte usata dal menù),
//  - il prezzo degli extra viene letto da EXTRAS_PRICE qui sotto (stessa configurazione
//    usata in menu.html per "Il Brigante").
// In questo modo un cliente non può in alcun modo modificare il prezzo dal browser:
// anche se inviasse un totale diverso, verrebbe ignorato, perché qui non viene mai
// letto un prezzo/totale arrivato dal client.
//
// La chiave segreta viene letta ESCLUSIVAMENTE da process.env.STRIPE_SECRET_KEY
// (impostata nelle variabili d'ambiente di Vercel) e non compare mai nel codice.

const Stripe = require('stripe');

// Stessa configurazione extra di ORDERABLE_PRODUCTS in menu.html (solo prezzi,
// duplicata qui volutamente in modo minimo: il prezzo BASE del prodotto resta
// sempre il Google Sheet, unica fonte di verità).
const EXTRAS_PRICE = {
  il_brigante: {
    extra_caciocavallo: 1.00,
    extra_bacon_jam: 1.00
  }
};

const SHEET_ID = '1-Ft8yH4Efs2QyrGkaPb-gr3iVcGNlc1sEv05iSXFd3s';
const PRODUCTS_URL = `https://opensheet.elk.sh/${SHEET_ID}/Prodotti`;

function parsePrice(raw){
  if (raw === undefined || raw === null) return 0;
  const s = String(raw).trim().replace('€', '').replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY non configurata su Vercel.');
    res.status(500).json({ error: 'Configurazione pagamento mancante sul server.' });
    return;
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { cartLines, origin, customer } = req.body || {};

    if (!Array.isArray(cartLines) || cartLines.length === 0) {
      res.status(400).json({ error: 'Carrello vuoto o non valido.' });
      return;
    }
    if (!origin || typeof origin !== 'string') {
      res.status(400).json({ error: 'Origine della richiesta mancante.' });
      return;
    }

    // Fonte di verità dei prezzi base: lo stesso Google Sheet che alimenta il menù.
    const sheetResp = await fetch(PRODUCTS_URL);
    if (!sheetResp.ok) throw new Error('Impossibile leggere il foglio prodotti.');
    const sheetProducts = await sheetResp.json();
    const productsById = {};
    sheetProducts.forEach(p => { if (p && p.id) productsById[String(p.id).trim()] = p; });

    const lineItems = [];
    const orderForMetadata = [];
    let grandTotalCents = 0;

    for (const line of cartLines) {
      const productId = line && line.productId;
      const sheetRow = productsById[productId];
      const extrasConfig = EXTRAS_PRICE[productId];

      if (!sheetRow || !extrasConfig) {
        res.status(400).json({ error: `Prodotto non ordinabile: ${productId}` });
        return;
      }

      const basePrice = parsePrice(sheetRow.prezzo);
      const requestedExtras = Array.isArray(line.extras) ? line.extras : [];
      const validExtras = requestedExtras.filter(key => Object.prototype.hasOwnProperty.call(extrasConfig, key));

      let unitPrice = basePrice;
      validExtras.forEach(key => { unitPrice += extrasConfig[key]; });

      const qty = Math.max(1, Math.min(20, parseInt(line.qty, 10) || 1));
      const unitAmountCents = Math.round(unitPrice * 100);
      grandTotalCents += unitAmountCents * qty;

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: sheetRow.nome_it || productId },
          unit_amount: unitAmountCents
        },
        quantity: qty
      });

      orderForMetadata.push({
        productId,
        qty,
        removed: Array.isArray(line.removed) ? line.removed : [],
        extras: validExtras,
        notes: typeof line.notes === 'string' ? line.notes.slice(0, 120) : ''
      });
    }

    if (grandTotalCents <= 0) {
      res.status(400).json({ error: 'Totale non valido.' });
      return;
    }

    const c = customer || {};
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${origin}menu.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}menu.html?payment=cancelled`,
      metadata: {
        order: JSON.stringify(orderForMetadata).slice(0, 490),
        customerNome: String(c.nome || '').slice(0, 100),
        customerCognome: String(c.cognome || '').slice(0, 100),
        customerTelefono: String(c.telefono || '').slice(0, 50),
        customerOrario: String(c.orario || '').slice(0, 20),
        customerNoteLocale: String(c.noteLocale || '').slice(0, 200)
      }
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Errore creazione sessione Stripe:', err);
    res.status(500).json({ error: 'Errore nella creazione della sessione di pagamento.' });
  }
};
