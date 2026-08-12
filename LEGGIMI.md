# I soliti stronzi — come mettere il gioco online

Questa cartella è tutto quello che serve. Non va aperta né modificata: si carica così com'è.

```
index.html                     il gioco (un file solo)
netlify/functions/room.mjs     la stanza condivisa fra i quattro telefoni
netlify.toml                   configurazione
package.json                   l'unica dipendenza del server
```

---

## Strada consigliata: da GitHub (5 minuti, aggiornamenti automatici)

1. Crea un repository nuovo su GitHub (può essere privato).
2. Carica dentro il **contenuto di questa cartella** — `index.html` deve stare alla radice,
   non dentro una sottocartella.
3. Vai su Netlify → **Add new site** → **Import an existing project** → **GitHub** e scegli il repository.
4. Nella schermata di configurazione lascia così:
   - **Build command**: vuoto
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions`
5. **Deploy site**. Netlify installa la dipendenza e attiva la stanza da solo.

Non c'è nessuna variabile d'ambiente da impostare.

## Strada alternativa: trascinamento

Il trascinamento non installa le dipendenze, quindi va fatto un passaggio prima.

1. Apri il terminale dentro questa cartella e lancia `npm install`.
2. Vai su [app.netlify.com/drop](https://app.netlify.com/drop).
3. Trascina l'**intera cartella** (ora contiene anche `node_modules`).

Se salti il punto 1 il gioco si apre ma i quattro dispositivi non si vedono fra loro.

---

## Il link da mandare agli altri

Netlify ti dà un indirizzo tipo `https://qualcosa-random.netlify.app`.
Puoi cambiarlo in **Site configuration → Change site name** (per esempio `soliti-stronzi`).

Quello è il link: lo aprite tutti e quattro, ognuno tocca il proprio avatar
e la partita parte quando il tavolo è completo.

Per avere più tavoli separati in contemporanea aggiungi una stanza all'indirizzo:

```
https://soliti-stronzi.netlify.app/?stanza=giovedi
https://soliti-stronzi.netlify.app/?stanza=rivincita
```

Chi apre lo stesso indirizzo entra nello stesso tavolo. Senza `?stanza=` finite tutti
nel tavolo principale, che va benissimo se giocate un tavolo alla volta.

---

## Come controllare che funzioni davvero

Apri il sito su **due dispositivi diversi** (non due finestre dello stesso computer)
e tocca FRENK sul primo.

- Sul secondo, entro un paio di secondi, FRENK deve diventare grigio con la scritta **OCCUPATO**.
- I pallini sotto gli avatar si accendono man mano che entrate.

Se FRENK resta selezionabile su entrambi, la stanza non è attiva: in Netlify apri
**Deploys → Functions** e verifica che ci sia `room`. Se non c'è, quasi sempre è perché
il campo **Functions directory** non è impostato su `netlify/functions`.

---

## Cose utili da sapere

- **Chi entra per primo tiene il mazzo**: il suo dispositivo applica le regole e manda a
  ciascuno soltanto le proprie carte. Nessuno può vedere la mano degli altri.
- **Se qualcuno esce** compare "PARTITA IN PAUSA" su tutti e riprende da sola quando rientra.
- **Lo storico vive sul server** della stanza: è identico per tutti e resta anche se chiudete
  tutti il gioco. Si azzera solo dal tasto AZZERA TUTTO dentro lo storico.
- **Le partite di allenamento** contro il telefono non entrano nello storico.
- **Si gioca fino a superare i 21 punti**: a 21 esatti si continua.
- **Audio**: su iPhone il suono parte al primo tocco sullo schermo; controlla anche
  l'interruttore silenzioso laterale. L'icona in alto a destra accende e spegne tutto.
- **Aggiornamenti**: se in futuro cambiamo qualcosa, con la strada GitHub basta ricaricare
  il nuovo `index.html` nel repository e Netlify ripubblica da solo.
