module.exports = {
  '/it/extend/': [
    {
      title: 'Concetti principali',
      collapsable: false,
      children: [
        ['', 'Estensioni di Flarum'],
        ['start', 'Iniziare'],
        ['frontend', 'Sviluppo del Frontend'],
        ['routes', 'Percorsi e contenuti'],
        ['data', 'Lavorare con i dati'],
        ['distribution', 'Distribuzione'],
        ['update-b15', 'Aggiornamenti Beta 15'],
      ]
    },
    {
      title: 'Guide di riferimento',
      collapsable: false,
      children: [
        ['admin', 'Pannello amministrazione'],
        ['frontend-pages', 'Frontend e Resolver'],
        ['interactive-components', 'Componenti interattivi'],
        ['forms', 'Moduli e richieste'],
        ['backend-events', 'Eventi backend'],
      ]
    },
    {
      title: 'Guide Avanzate',
      collapsable: false,
      children: [
        ['api-throttling', 'Limitazione delle API'],
        ['authorization', 'Autorizzazione'],
        ['console', 'Console'],
        ['formatting', 'Formattazione'],
        ['i18n', 'Internazionalizzazione'],
        ['mail', 'Mail'],
        ['middleware', 'Middleware'],
        ['slugging', 'Modello Slugging'],
        ['notifications', 'Notifiche'],
        ['permissions', 'Gruppi e autorizzazioni'],
        ['post-types', 'Tipi di post'],
        ['search', 'Cerca'],
        ['service-provider', 'Provider di servizi'],
        ['settings', 'Impostazioni'],
        ['testing', 'Test'],
      ]
    },
    // {
    //   title: 'Themes',
    //   collapsable: false,
    //   children: [
    //     'theme',
    //   ]
    // },
    // {
    //   title: 'Localization',
    //   collapsable: false,
    //   children: [
    //   ]
    // }
  ],

  '/it/': [
    {
      title: 'Introduzione',
      collapsable: false,
      children: [
        ['', "Flarum? Cos'è?"],
        ['code-of-conduct', 'Codice di Condotta'],
        ['releases', 'Note di rilascio'],
        ['contributing', 'Contribuire a Flarum'],
        ['bugs', 'Report dei Bugs'],
        ['faq', 'FAQ']
      ]
    },
    {
      title: 'Impostazioni',
      collapsable: false,
      children: [
        ['install', 'Installazione'],
        ['update', 'Aggiornare la versione di Flarum'],
        ['troubleshoot', 'Risoluzione dei problemi']
      ]
    },
    {
      title: 'Gestione',
      collapsable: false,
      children: [
        ['admin', 'Pannello di amministrazione'],
        ['config', 'File di configurazione'],
        ['extensions', 'Estensioni'],
        ['languages', 'Lingue'],
        ['themes', 'Aspetto e Temi'],
        ['mail', 'Configurazione Email'],
        ['console', 'Console']
      ]
    }
  ],
}
