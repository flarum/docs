---
slug: '/extend'
---

# Estensioni di Flarum

Flarum è minimalista, ma è anche altamente estensibile. In effetti, la maggior parte delle funzionalità fornite con Flarum sono in realtà estensioni!

Questo approccio rende Flarum estremamente personalizzabile. Un utente può disabilitare tutte le funzionalità che non utilizza sul proprio forum e installare altre estensioni per creare un forum "cucito" su misura per la sua community.

Per ottenere questa estensibilità, Flarum è stato costruito con ricche API e punti di estensione. Con alcune conoscenze di programmazione, puoi sfruttare queste API per aggiungere quasi tutte le funzionalità che desideri. Questa sezione della documentazione ha lo scopo di insegnarti come funziona Flarum e come utilizzare le API in modo da poter creare le tue estensioni.

## Core vs. Estensioni

Dove tracciamo il confine tra il nucleo di Flarum e le sue estensioni? Perché alcune funzionalità sono incluse nel core e altre no? È importante comprendere questa distinzione in modo da poter mantenere la coerenza e la qualità all'interno dell'ecosistema di Flarum.

** Il nucleo di Flarum ** non è pensato per essere pieno di funzionalità. Piuttosto, è una base, o un framework, che fornisce un appoggio affidabile su cui costruire le estensioni. Contiene solo funzionalità di base non avanzate che sono essenziali per un forum: discussioni, post, utenti, gruppi e notifiche.

Le ** estensioni in bundle ** sono funzionalità incluse in Flarum e abilitate per impostazione predefinita. Sono estensioni come le altre e possono essere disabilitate e disinstallate. Sebbene il loro ambito non sia inteso ad affrontare tutti i casi d'uso, l'idea è di renderli abbastanza generici e configurabili da poter soddisfare la maggioranza degli utenti finali.

** Le estensioni di terze parti ** sono funzionalità create da altri e non sono ufficialmente supportate dal team di Flarum. Possono essere costruite e utilizzate per affrontare casi d'uso più specifici.

Se stai cercando di risolvere un bug o un difetto del core, o di un'estensione in bundle esistente, potrebbe essere appropriato * contribuire al rispettivo progetto * piuttosto che disperdere gli sforzi su una nuova estensione di terze parti. È una buona idea iniziare una discussione sulla [Community di Flarum](https://discuss.flarum.org/) per avere opinioni anche dagli sviluppatori di Flarum.

## Risorse utili

- [Questa documentazione](start.md)
- [Suggerimenti per sviluppatori principianti](https://discuss.flarum.org/d/5512-extension-development-tips)
- [Sviluppatori che spiegano il loro flusso di lavoro per lo sviluppo di estensioni](https://github.com/flarum/cli)
- [Suggerimenti per il namespace delle estensioni](https://discuss.flarum.org/d/6320-extension-developers-show-us-your-workflow)
- [Documentazione js di Mithril](https://discuss.flarum.org/d/9625-flarum-extension-namespacing-tips)
- [Documenti API Laravel](https://mithril.js.org/)
- [Documenti delle API di Flarum](https://laravel.com/api/8.x/)
- [Documenti delle API di Flarum](https://api.flarum.org)
- [ES6 cheatsheet](https://github.com/DrkSephy/es6-cheatsheet)

### Supporto

- [Communiti ufficiale di sviluppatori di Flarum](https://discuss.flarum.org/t/dev)
- [Entra sulla nostra chat #extend su Discord](https://flarum.org/discord/)
