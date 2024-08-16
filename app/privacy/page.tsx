import React from 'react';
import { Card, CardBody } from "@nextui-org/card";

export default function PrivacyPage() {
    return (
        <div className="p-6 font-sans leading-relaxed">
            <Card className="shadow-lg rounded-lg">
                <CardBody className='p-8'>
                    <h1 className="text-3xl font-bold mb-6">Informativa sulla Privacy</h1>
                    <p className="mb-6">
                        Ultimo aggiornamento: <strong>16/08/2024</strong>
                    </p>

                    <p className="mb-6">
                        Questa informativa sulla privacy descrive come LowContent.ai (di seguito "noi" o "il sito") raccoglie, utilizza e protegge i dati personali
                        degli utenti (di seguito "tu" o "l'utente") che visitano e utilizzano il nostro sito.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">1. Tipologia di Dati Raccolti</h2>
                    <p className="mb-6">
                        Raccogliamo i seguenti dati personali:
                    </p>
                    <ul className="list-disc ml-6 mb-6">
                        <li>Nome</li>
                        <li>Indirizzo</li>
                        <li>Indirizzo email</li>
                        <li>Informazioni di pagamento</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4">2. Modalità di Raccolta</h2>
                    <p className="mb-6">
                        I dati personali vengono raccolti tramite:
                    </p>
                    <ul className="list-disc ml-6 mb-6">
                        <li>Moduli online</li>
                        <li>Registrazione al sito</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4">3. Utilizzo dei Dati</h2>
                    <p className="mb-6">
                        I dati raccolti vengono utilizzati per:
                    </p>
                    <ul className="list-disc ml-6 mb-6">
                        <li>Sottoscrivere gli abbonamenti</li>
                        <li>Migliorare il nostro sito e i nostri servizi</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4">4. Condivisione dei Dati</h2>
                    <p className="mb-6">
                        Non condividiamo i dati personali degli utenti con terze parti.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">5. Conservazione dei Dati</h2>
                    <p className="mb-6">
                        Conserviamo i dati personali fino al recesso da parte del cliente.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">6. Diritti degli Utenti</h2>
                    <p className="mb-6">
                        Hai il diritto di richiedere la cancellazione dei tuoi dati personali in qualsiasi momento. Per esercitare questo diritto, puoi contattarci
                        utilizzando le informazioni fornite nella sezione contatti.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">7. Sicurezza dei Dati</h2>
                    <p className="mb-6">
                        Adottiamo misure di sicurezza adeguate per proteggere i dati personali degli utenti da accessi non autorizzati, alterazioni o divulgazioni.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">8. Contatti</h2>
                    <p className="mb-6">
                        Per domande riguardanti questa informativa sulla privacy o per esercitare i tuoi diritti, ti preghiamo di contattarci tramite il form dedicato
                        sul nostro sito o inviando un'email a <a href="mailto:info@lowcontent.ai" className="text-blue-500 underline"> info@lowcontent.ai</a>.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">9. Modifiche all'Informativa sulla Privacy</h2>
                    <p className="mb-6">
                        Ci riserviamo il diritto di modificare questa informativa sulla privacy in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina e ti invitiamo
                        a controllare periodicamente questa informativa per eventuali aggiornamenti.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}