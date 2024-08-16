import React from 'react';
import { Card, CardBody } from "@nextui-org/card";

export default function TermsPage() {
    return (
        <div className="p-6 font-sans leading-relaxed">
            <Card className="shadow-lg rounded-lg">
                <CardBody className='p-8'>
                    <h1 className="text-3xl font-bold mb-6">Termini e Condizioni di Utilizzo</h1>
                    <p className="mb-6">
                        Ultimo aggiornamento: <strong>16/08/2024</strong>
                    </p>

                    <p className="mb-6">
                        Benvenuto su LowContent.ai. Utilizzando il nostro sito web e i nostri servizi, accetti di rispettare i seguenti
                        termini e condizioni. Ti invitiamo a leggere attentamente questi termini prima di utilizzare il nostro sito.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">1. Accettazione dei Termini</h2>
                    <p className="mb-6">
                        Utilizzando il sito LowContent.ai, accetti di essere vincolato da questi termini e condizioni. Se non sei d'accordo
                        con questi termini, ti preghiamo di non utilizzare il nostro sito.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">2. Modifiche ai Termini</h2>
                    <p className="mb-6">
                        Ci riserviamo il diritto di modificare questi termini e condizioni in qualsiasi momento. Le modifiche saranno pubblicate
                        su questa pagina, e l'uso continuato del sito dopo tali modifiche costituirà accettazione delle stesse.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">3. Utilizzo del Sito</h2>
                    <p className="mb-6">
                        L'utente si impegna a utilizzare il sito in modo legale e conforme alle leggi vigenti. È vietato utilizzare il sito per
                        scopi illeciti o non autorizzati.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">4. Proprietà Intellettuale</h2>
                    <p className="mb-6">
                        Tutti i contenuti presenti su LowContent.ai, inclusi testi, grafica, loghi, immagini e software, sono di proprietà di
                        LowContent.ai o dei suoi licenziatari e sono protetti dalle leggi sul copyright e sulla proprietà intellettuale.
                    </p>
                    <p className="mb-6">
                        Utilizzando il nostro servizio a pagamento, gli utenti acquisiscono la piena proprietà dei contenuti generati, inclusi testi e immagini.
                        Gli utenti hanno il diritto esclusivo di utilizzare, modificare e distribuire tali contenuti senza restrizioni. Tuttavia, i diritti di
                        copyright sulle immagini generate durano finché l'utente mantiene attivo l'abbonamento. Una volta cessato l'abbonamento, i diritti di
                        copyright sulle immagini generate non saranno più validi e l'utente non avrà più diritto a utilizzare tali contenuti.
                    </p>
                    <p className="mb-6">
                        LowContent.ai non rivendica alcun diritto sui contenuti creati dagli utenti attraverso il servizio a pagamento durante il periodo di
                        validità dell'abbonamento. Ci riserviamo il diritto di utilizzare i contenuti generati per scopi promozionali o di miglioramento del
                        servizio, previa autorizzazione dell'utente.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">5. Limitazione di Responsabilità</h2>
                    <p className="mb-6">
                        LowContent.ai non sarà responsabile per eventuali danni diretti, indiretti, incidentali, consequenziali o punitivi derivanti dall'uso o
                        dall'incapacità di utilizzare il sito o i suoi servizi.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">6. Privacy</h2>
                    <p className="mb-6">
                        La tua privacy è importante per noi. Ti invitiamo a leggere la nostra <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Informativa sulla Privacy</a> per comprendere come raccogliamo, utilizziamo e proteggiamo le tue informazioni personali.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">7. Legge Applicabile</h2>
                    <p className="mb-6">
                        Questi termini sono regolati dalle leggi dello Stato Italiano. Qualsiasi controversia derivante da o
                        relativa a questi termini sarà sottoposta alla giurisdizione esclusiva dei tribunali di Milano.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">8. Contatti</h2>
                    <p className="mb-6">
                        Per domande riguardanti questi termini e condizioni, ti preghiamo di contattarci all'indirizzo email:
                        <a href="mailto:info@lowcontent.ai" className="text-blue-500 underline"> info@lowcontent.ai</a>.
                    </p>

                    <h3 className="text-xl font-bold mb-4">Importante</h3>
                    <p>
                        Ti ricordiamo di rivedere periodicamente questi termini e condizioni. Continuare a utilizzare il nostro sito implica l'accettazione
                        di eventuali aggiornamenti o modifiche. Per eventuali dubbi, contattaci tramite i canali indicati.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}