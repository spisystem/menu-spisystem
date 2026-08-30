// Vercel Serverless Function — GET /api/get-checkout-session?session_id=...
//
// Chiamata dal sito subito dopo che il cliente torna da Stripe (success_url).
// Verifica DIRETTAMENTE con Stripe che il pagamento sia stato effettuato
// (non ci si fida di semplici parametri nell'URL, che chiunque potrebbe scrivere
// a mano), e restituisce i dati dell'ordine salvati nei metadata della sessione
// al momento della creazione, così il sito può generare lo stesso messaggio
// WhatsApp di conferma già usato per gli altri metodi di pagamento.
//
// La chiave segreta viene letta ESCLUSIVAMENTE da process.env.STRIPE_SECRET_KEY.

const Stripe = require('stripe');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo non consentito' });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY non configurata su Vercel.');
    res.status(500).json({ error: 'Configurazione pagamento mancante sul server.' });
    return;
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const sessionId = req.query.session_id;

  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: 'session_id mancante.' });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      res.status(200).json({ paid: false });
      return;
    }

    res.status(200).json({
      paid: true,
      metadata: session.metadata || {},
      amountTotal: session.amount_total,
      currency: session.currency
    });
  } catch (err) {
    console.error('Errore verifica sessione Stripe:', err);
    res.status(500).json({ error: 'Impossibile verificare il pagamento.' });
  }
};
