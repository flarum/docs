# Distribuzione

Hai scritto una grande estensione e ora vuoi che il mondo intero sia in grado di usarla. Questo documento ti guiderà attraverso il processo di distribuzione, dalla configurazione di un repository Git per la tua estensione, alla pubblicazione su Packagist.

## Configurazione di Git

La prima cosa che devi fare è configurare un sistema di controllo della versione (VCS). Il VCS più popolare è [Git](https://git-scm.com/). In questa guida useremo Git, quindi assicurati di [installarlo](https://git-scm.com/downloads) prima di continuiare. Se non hai molta conoscenza di Git, ti consigliamo di controllare [queste risorse di apprendimento](https://try.github.io/).

Dopo aver installato Git, dovrai inizializzare il tuo repository. Puoi utilizzare `git init` su riga di comando se ti è più familiare, o un interfaccia tipo [SourceTree](https://www.sourcetreeapp.com/) o [GitKraken](https://www.gitkraken.com/).

Quindi, avrai bisogno di un account in un server di hosting Git, dove i sovrani sono[GitHub](https://github.com) e [GitLab](https://gitlab.com). Questi siti ti istruiranno su come collegare la tua repository locale con la repository "in remoto" online.

## Contrassegnare una versione

Mentre pubblicherai la tua estensione, ti consigliamo di assicurarti che le informazioni siano aggiornate. Prenditi un minuto per rivisitare `composer.json` e assicurati che il nome del pacchetto, la descrizione e le informazioni sull'estensione Flarum siano tutte corrette. Si consiglia di avere un file `README.md` nella tua repository per spiegare qual è e cosa fa l'estensione, quindi creane una se non lo hai già fatto.

Quando sei pronto per il rilascio, salva i file della tua estensione nel repository e tagga la tua prima versione:

```bash
git tag v0.1.0
git push && git push --tags
```

## Pubblicazione su Packagist

I pacchetti Composer sono pubblicati in una repository, solitamente [Packagist](https://packagist.org/). Avrai bisogno di un account per proseguire.

Se questa è la prima versione della tua estensione che stai pubblicando, [carica il tuo pacchetto](https://packagist.org/packages/submit) utilizzando il suo URL repository pubblico. Se la tua estensione si trova su GitHub, questo URL avrà un aspetto simile `https://github.com/AUTHOR/NAME.git`.

### Rilasci futuri

Puoi configurare Packagist per [auto-aggiornare i pacchetti](https://packagist.org/about#how-to-update-packages). Quindi, per le versioni future, tutto ciò che dovrai fare con Git è eseguire il commit, il tag e il push al server remoto.

## Promuovere la tua estensione

Molto probabilmente vorrai creare una discussione sulla comunità Flarum sulla categoria [Estensioni](https://discuss.flarum.org/t/extensions). Altre persone potranno installare la tua estensione utilizzando il seguente comando:

```bash
composer require autore/nome-estensione
```