import baseLang from "./en.ts"

export default {
	Metadata: {
		NativeName: "Deutsch",
		EnglishName: "German",
		Code: "de",
	},
	Translations: {
		Common: {
			Expires: "Verfällt am",
		},
		NewSecret: {
			Title: "Neues Geheimnis anlegen",
			Description:
				"Erstelle ein neues, verschlüsseltes Geheimnis und teile es mit beliebig vielen Personen über einen Link. Das Geheimnis wird auf deinem Gerät verschlüsselt und dann an den Server gesendet, wo es aufbewahrt wird, bis es wieder geöffnet wird oder bis es abläuft. Das Geheimnis kann nur über den Link entschlüsseln werden.",
			Create: "Erstellen",
			Expiration: {
				Title: "Ablaufzeit",
				Description:
					"Wähle, wie lange das Geheimnis gültig sein soll. Nach Ablauf der Zeit wird das Geheimnis automatisch gelöscht.",
				Expire: {
					Day: { Many: "{{count}} Tage", One: "Ein Tag" },
					Hour: { Many: "{{count}} Stunden", One: "Eine Stunde" },
					Minute: { Many: "{{count}} Minuten", One: "Eine Minute" },
					Month: { Many: "{{count}} Monate", One: "Ein Monat" },
					Week: { Many: "{{count}} Wochen", One: "Eine Woche" },
					Year: { Many: "{{count}} Jahre", One: "Ein Jahr" },
				},
			},
			Files: {
				Title: "Dateien",
				Description:
					"Lade Dateien hoch und teile sie als Teil des Geheimnisses. Anmerkung: Das gesamte Geheimnis (der Text und die Datei(en)) darf {{size}} MB nicht überschreiten.",
				DragAndDrop: "Klicke hier zum Hochladen oder ziehe eine Datei in dieses Feld.",
			},
			RequiredByPolicy: "Du kannst diese option nicht ändern, da sie von {{name}} vorgeschrieben ist.",
			Options: {
				Title: "Optionen",
				Description: "",
				Password: {
					Title: "Passwort",
					Description: "Schütze dein Geheimnis mit einem weiteren Faktor.",
					Placeholder: "Passwort",
					RepeatPlaceholder: "Passwort (Wiederholung)",
					Mismatch: "Die Passwörter stimmen nicht überein.",
				},
				Burn: {
					Title: "Nach dem Öffnen löschen",
					Description:
						"Automatische Löschung des Geheimnisse nach dem erstmaligen Öffnen (in den meisten Fällen empfohlen)",
				},
				SlowBurn: {
					Title: "Verzögertes Löschen aktivieren",
					Description:
						"Erlaubt eine bestimmte Anzahl von Lesezugriffen innerhalb von 5 Minuten nach dem Öffnen des Geheimnisses. Diese Option ist nützlich, wenn du beispielsweise ein Geheimnis an mehrere Personen in einer Besprechung senden möchtest.",
					Status:
						"Erlaube {{count}} Lesezugriffe innerhalb von 5 Minuten nach dem ersten Öffnen des Geheimnisses.",
				},
				GeneratePassword: "Passwort Generieren",
			},
		},
		PasswordGenerator: {
			Title: "Passwort Generieren",
			Description: "Generate ein zufälliges kryptografisches Passwort.",
			Generate: "Generieren",
			Insert: "Einfügen",
			Length: "Passwortlänge",
			Characters: {
				Title: "Zeichen",
				Description: "Lege fest welche Zeichen beim Generieren verwendet werden sollen.",
				Uppercase: {
					Title: "Großbuchstaben",
					Description: "Verwende alle Großbuchstaben von A bis Z",
				},
				Lowercase: {
					Title: "Kleinbuchstaben",
					Description: "Verwende alle Kleinbuchstaben von a bis z",
				},
				Digits: {
					Title: "Ziffern",
					Description: "Verwende alle Ziffern von 0 bis 9",
				},
				Symbols: {
					Title: "Symbole",
					Description: "Verwende die folgenden Symbole: ~!@#%&*_-+=,.?<>",
				},
			},
		},
		ShareSecret: {
			Title: "Geheimnis teilen",
			Description:
				"Sende den unten stehenden Link an die Person, mit der du das Geheimnis teilen möchtest. Jeder, der den Link hat, ist in der Lage, sich das Geheimnis anzusehen.",
			Preview: {
				Title: "Geheimnisvorschau",
				Description:
					"Hier ist eine Vorschau des von dir uebermittelten Geheimnis. Die Vorschau wird verworfen sobald du diese Seite neu lädst oder sie verlässt.",
			},
			Actions: {
				New: "Neu",
				Open: "Open Link",
				CopyLink: "Link kopieren",
				GenerateQR: "QR-Code generieren",
				Email: "Link per E-Mail senden",
				Delete: "Geheimnis löschen",
				DownloadQR: "Herunterladen",
			},
		},
		ViewSecret: {
			Title: "Geheimnis",
			Description:
				"Jemand hat dir diese geheime Nachricht geschickt. Diese ist nur für deine Augen bestimmt. Teile sie mit keinem Dritten.",
			Decrypt: "Entschlüsseln",
			Password: {
				Title: "Passwort",
				Description:
					"Dieses Geheimnis ist durch ein Passwort geschützt. Bitte gebe das Passwort ein, um das Geheimnis zu entschlüsseln.",
			},
			Read: "Lesen",
			ReadConfirm:
				'Dieses Geheimnis wird nach dem Öffnen automatisch gelöscht. Mit dem Klick auf "Lesen" nimmst du zur Kenntnis, dass du dieses Geheimnis kein zweites Mal öffnen kannst, nachdem du dieses Fenster geschlossen hast.',
			Files: {
				Title: "Angehängte Dateien",
			},
			DecryptionError:
				"Das Geheimnis konnte nicht entschlüsselt werden. Dies kann z.B. an einem falschen Passwort liegen. Bitte versuche es erneut.\n",
		},
		DeleteSecret: {
			Title: "Geheimnis löschen",
			Description: "Möchtest du das Geheimnis mit der ID {{id}} löschen?",
			Delete: "Löschen",
			Success: "Das Geheimnis mit der ID {{id}} wurde gelöscht.",
		},
		Credits: {
			Title: "Credits",
			Description:
				'{{name}} ist von <u><a href="https://privatebin.info">PrivateBin</a></u> inspiriert. PrivateBin wird unter anderem von <u><a href="https://github.com/PrivateBin/PrivateBin/graphs/contributors">El RIDO</a></u> entwickelt und wird unter der <u><a href="https://github.com/PrivateBin/PrivateBin/blob/master/LICENSE.md">Zlib Lizenz</a></u> bereitgestellt. <br/> {{name}} wurde vollkommen neu entwickelt und vereint die Basisfunktionalität von PrivateBin mit sinnvollen Erweiterungen.',
			BrandedNotice: "{{name}} basiert auf Nihility.io SecretBin.",
			SourceNotice:
				'Nihility.io SecretBin ist Open Source und steht unter MIT-Lizenz zur Verfügung. Wenn du deine eigene Version von SecretBin hosten möchtest, findest du den Quellcode auf <u><a href="https://github.com/Nihility-io/SecretBin">GitHub</a></u>.',
			Components: {
				Title: "Komponenten",
				Description:
					"Unten findest du eine Liste von allen genutzten Softwarekomponenten zusammen mit deren Lizenzen.",
				Headers: {
					Author: "Autor(en)",
					Component: "Komponente",
					License: "Lizenz",
					Version: "Version",
				},
			},
		},
		TermsOfService: {
			Title: "Nutzungsbedingungen",
			Accept: "Akzeptieren",
			Decline: "Ablehnen",
		},
		Errors: {
			PageNotFoundError: {
				Title: "Seite nicht gefunden",
				Message: "Die gesuchte Seite konnte nicht gefunden werden.",
			},
			SecretNotFoundError: {
				Title: "SecretNotFoundError",
				Message: "Ein Geheimnis mit der ID {{id}} wurde nicht gefunden.",
			},
			SecretAlreadyExistsError: {
				Title: "SecretAlreadyExistsError",
				Message: "Ein Geheimnis mit der ID {{id}} existiert bereits.",
			},
			SecretListError: {
				Title: "SecretListError",
				Message: "Es ist ein Fehler beim Landen der Geheimnisse aufgetreten.",
			},
			SecretReadError: {
				Title: "SecretReadError",
				Message: "Es ist ein Fehler beim Lesen des Geheimnisses mit der ID {{id}} aufgetreten.",
			},
			SecretCreateError: {
				Title: "SecretCreateError",
				Message: "Es ist ein Fehler beim Erstellen des Geheimnisses mit der ID {{id}} aufgetreten.",
			},
			SecretUpdateError: {
				Title: "SecretUpdateError",
				Message: "Es ist ein Fehler beim aktualisieren des Geheimnisses mit der ID {{id}} aufgetreten.",
			},
			SecretDeleteError: {
				Title: "SecretDeleteError",
				Message: "Es ist ein Fehler beim Löschen des Geheimnisses mit der ID {{id}} aufgetreten.",
			},
			SecretParseError: {
				Title: "SecretParseError",
				Message: "Das Geheimnis hat ein ungültiges Format. Details: {{reason}}",
			},
			SecretPolicyError: {
				Title: "SecretPolicyError",
				Message: "Das Geheimnis was du versuchst anzulegen verstößt gegen die Vorgaben. Details: {{reason}}",
			},
			SecretSizeLimitError: {
				Title: "SecretSizeLimitError",
				Message:
					"Die Datenmenge von {{size}} des Geheimnisses überschreitet die zulässige Grenze von {{maxSize}}.",
			},
		},
		ErrorPage: {
			Title: "Seite nicht gefunden",
			GoHome: "Zurück zur Startseite",
		},
	},
} satisfies typeof baseLang
