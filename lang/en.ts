export default {
	Metadata: {
		NativeName: "English",
		EnglishName: "English",
		Code: "en",
		Author: "Nihility.io",
	},
	Translations: {
		Common: {
			Expires: "Expires",
		},
		NewSecret: {
			Title: "Create New Secret",
			Description:
				"Create a new encrypted secret and share it with as many people as you like via a link. Your secret is encrypted on your device and then sent to the server where it is kept until it is opened or expired. The secret can only be decrypted via the link.",
			Create: "Create",
			Expiration: {
				Title: "Expiration",
				Description:
					"Choose when the secret should expire. Secrets are automatically deleted after the set time has passed.",
				Expire: {
					Day: { Many: "{{count}} days", One: "One day" },
					Hour: { Many: "{{count}} hours", One: "One hour" },
					Minute: { Many: "{{count}} minutes", One: "One minute" },
					Month: { Many: "{{count}} months", One: "One month" },
					Week: { Many: "{{count}} weeks", One: "One week" },
					Year: { Many: "{{count}} years", One: "One year" },
				},
			},
			Files: {
				Title: "Files",
				Description:
					"Upload files and share them as part of the secret. Note: The total size of the secret (the text and files) cannot exceed {{size}} MB.",
				DragAndDrop: "Click here to upload or drag and drop a file onto this field.",
			},
			RequiredByPolicy: "You cannot change this option since it's required by {{name}}'s policies.",
			Options: {
				Title: "Options",
				Description: "",
				Password: {
					Title: "Password",
					Description: "Protect your secret with a password for an additional layer of security",
					Placeholder: "Password",
					RepeatPlaceholder: "Password (Repeat)",
					Mismatch: "The passwords do not match.",
				},
				Burn: {
					Title: "Burn after reading",
					Description: "Automatically delete the secret once it has been opened (recommended in most cases)",
				},
				SlowBurn: {
					Title: "Enable slow burn",
					Description:
						"Allow a number of re-reads within 5 minutes of opening the secret. For example, this option is useful if you want to send a secret to several people in a meeting.",
					Status:
						"Allow secret to be read {{count}} time(s) within 5 minutes of opening the secret for the first time.",
				},
				GeneratePassword: "Generate Password",
			},
		},
		PasswordGenerator: {
			Title: "Generate Password",
			Description: "Generate a random cryptographic password.",
			Generate: "Generate",
			Insert: "Insert",
			Length: "Password Length",
			Characters: {
				Title: "Characters",
				Description: "Specify which characters should be included when the password is generated.",
				Uppercase: {
					Title: "Uppercase",
					Description: "Include all uppercase letters from A to Z",
				},
				Lowercase: {
					Title: "Lowercase",
					Description: "Include all lowercase letters from a to z",
				},
				Digits: {
					Title: "Digits",
					Description: "Include all digits from 0 to 9",
				},
				Symbols: {
					Title: "Symbols",
					Description: "Include the following symbols: ~!@#$%&*_-+=,.?<>",
				},
			},
		},
		ShareSecret: {
			Title: "Share Secret",
			Description:
				"Send the link below to the person you want to share the secret with. Any person with this link will be able to view the secret.",
			Preview: {
				Title: "Secret Preview",
				Description:
					"Below is a preview of secret you submitted. The preview is gone once you refresh or leave this page.",
			},
			Actions: {
				New: "New",
				Open: "Open Link",
				CopyLink: "Copy Link",
				GenerateQR: "Generate QR Code",
				Email: "Email Link",
				Delete: "Delete Secret",
				DownloadQR: "Download",
			},
		},
		ViewSecret: {
			Title: "Secret",
			Description:
				"You were sent this secret message. It is meant for your eyes only. Do not share it with anyone.",
			Decrypt: "Decrypt",
			Password: {
				Title: "Password",
				Description:
					"This secret is protected by a password. Please enter the password in order to decrypt this secret.",
			},
			Read: "Read",
			ReadConfirm:
				'This secret will be automatically deleted after opening it. By clicking on "Read", you acknowledge that you cannot open this secret a second time after you have closed this window.',
			Files: { Title: "Attached Files" },
			DecryptionError: "Unable to decrypt the secret. This is likely due to a wrong password. PLease try again.",
		},
		DeleteSecret: {
			Title: "Delete Secret",
			Description: "Do you want to delete the secret with the ID {{id}}?",
			Delete: "Delete",
			Success: "The secret with the ID {{id}} has been deleted.",
		},
		Credits: {
			Title: "Credits",
			Description:
				'{{name}} is inspired by <u><a href="https://privatebin.info">PrivateBin</a></u>. PrivateBin is developed by <u><a href="https://github.com/PrivateBin/PrivateBin/graphs/contributors">El RIDO</a></u> among others and released under the <u><a href="https://github.com/PrivateBin/PrivateBin/blob/master/LICENSE.md">Zlib License</a></u>. <br/> {{name}} has been completely redeveloped and combines the basic functionality of PrivateBin with useful extensions.',
			BrandedNotice: "{{name}} is based on Nihility.io SecretBin.",
			SourceNotice:
				'Nihility.io SecretBin is open source and licensed under MIT. If you want to host your own version of SecretBin, head over to <u><a href="https://github.com/Nihility-io/SecretBin">GitHub</a></u>.',
			Translations: {
				Title: "Translations",
				Description: "Below you will find a list of all supported translations and their authors.",
				Headers: { Author: "Author", Translation: "Translation" },
			},
			Components: {
				Title: "Components",
				Description:
					"Below you will find a list of all software components used by {{name}}, along with their license.'",
				Headers: {
					Author: "Author(s)",
					Component: "Component",
					License: "Licenses",
					Version: "Version",
				},
			},
		},
		TermsOfService: {
			Title: "Terms of Service",
			Content: `<h2>Usage Policy</h2>
        <p class="text-base text-gray-500 dark:text-gray-400">
          This services is provided as is. <b>{{name}} is NOT a public service</b>. It is a private project and not intended to be used by anyone
          aside from my friends and acquaintances which express permission. Secrets submitted to {{name}} may be
          deleted at anytime without prior notice.
        </p>
        <br />
        <h2>Data Policy</h2>
        <p class="text-base text-gray-500 dark:text-gray-400">
          {{name}} uses cookies in order to store user settings like the preferred language. Cookies are NOT use
          to personally identify you or your browser. <br />
          The hoster of {{name}} may also collect the following data for server logging:
          <ul class="space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
            <li>- Your IP address: A number used to identify your internet connection</li>
            <li>
              - Your User-Agent: A string sent by your browser which contains information about your browser and
              device like browser type and version and the operating system you use e.g. Windows 11
            </li>
            <li>- Time and date when you access {{name}}</li>
          </ul>
        </p>
        <br />
        <p class="text-base text-gray-500 dark:text-gray-400">
          <b><i>If you disagree with these terms, please close this page.</i></b>
        </p>`,
			Accept: "Accept",
			Decline: "Decline",
		},
		Errors: {
			SecretNotFoundError: "A secret with the ID {{id}} does not exist.",
			SecretAlreadyExistsError: "A secret with the ID {{id}} already exists.",
			SecretListExistsError: "Failed to get secrets.",
			SecretReadError: "Unable to read secret with ID {{id}}.",
			SecretWriteError: "Unable to write secret with ID {{id}}.",
			SecretDeleteError: "Unable to delete secret with ID {{id}}.",
			SecretParseError: "The secret has an invalid format. Details: {{reason}}",
			SecretPolicyError: "The secret you are trying to create violates the policies. Details: {{reason}}",
			SecretSizeLimitError:
				"The total size of the secret ({{size}}) exceeds the maximum allowed size of {{maxSize}}.",
		},
		ErrorPage: {
			NotFound: {
				Title: "Page not NotFound",
				Description: "The page you were looking for doesn't exist.",
				GoHome: "Go back home",
			},
		},
	},
}
