# Bewerbungsapp

Desktop-App zur Verwaltung von Bewerbungen. Lokal gespeichert, deutschsprachig, modernes UI.

## Funktionen
- Bewerbungen speichern (Unternehmen, Datum, Anschreiben, Antwort, Status, Versandweg)
- Erinnerungstermin pro Bewerbung
- Listenansicht mit Suche und Status-Übersicht

## Hinweise
- Daten werden lokal in einer SQLite-Datenbank gespeichert.
- Benachrichtigungen für Erinnerungen sind noch nicht aktiviert.

## Start
1. Node.js installieren (LTS-Version)
2. Abhängigkeiten installieren: `npm install`
3. Empfohlener Start (inkl. Rebuild): `npm run start:clean`
4. Schneller Start ohne Rebuild: `npm start`

## Wichtiger Hinweis zu nativen Modulen
- Diese App nutzt `better-sqlite3` (natives Modul).
- Für den empfohlenen Start nach Updates einfach verwenden: `npm run start:clean`
- Falls nur ein manueller Rebuild nötig ist: `npm run rebuild`

## Troubleshooting
- Fehler: `NODE_MODULE_VERSION mismatch`
	- Ursache: Natives Modul wurde gegen eine andere Node-/Electron-ABI gebaut.
	- Lösung:
		1. `npm install`
		2. `npm run rebuild`
		3. `npm start`
- Fehler: `EBUSY` bei `npm install` (z. B. gesperrte Datei in `node_modules/electron`)
	- Ursache: Laufender Electron-Prozess sperrt Dateien.
	- Lösung:
		1. Alle laufenden App-/Electron-Prozesse beenden
		2. `npm install` erneut ausführen
