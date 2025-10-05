export default {
	Metadata: {
		NativeName: "English",
		EnglishName: "English",
		Code: "en",
	},
	Translations: {
		Common: {
			Expires: "Expires",
			UnsupportedBrowser:
				"The browser you are using is not supported. Please update your browser or use a different one. Supported are: {{browsers}}",
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
			Message: {
				Title: "Message",
				Description: "Enter the secret message you want to share.",
			},
			Files: {
				Title: "Files",
				Description:
					"Upload files and share them as part of the secret. Note: The total size of the secret (the text and files) cannot exceed {{size}}.",
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
			Encrypting: "Encrypting secret",
		},
		PasswordGenerator: {
			Title: "Generate Password",
			Description: "Generate a random cryptographic password.",
			Generate: "Generate",
			Insert: "Insert",
			Length: {
				Title: "Password Length",
				Description: "Specify the desired length of the generated password.",
			},
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
					Description: "Include the following symbols: ~!@#%&*_-+=,.?<>",
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
			Files: {
				Title: "Attached Files",
			},
			DecryptionError: "Unable to decrypt the secret. This is likely due to a wrong password. Please try again.",
			Decrypting: "Decrypting secret",
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
				'{{name}} is inspired by <a href="https://privatebin.info">PrivateBin</a>, developed by <a href="https://github.com/PrivateBin/PrivateBin/graphs/contributors">El RIDO</a> among others and released under the <a href="https://github.com/PrivateBin/PrivateBin/blob/master/LICENSE.md">Zlib License</a>.',
			BrandedNotice: "{{name}} is based on SecretBin, developed by Marvin Peter.",
			SourceNotice:
				'SecretBin is open source and available under the MIT license. If you want to host your own version of SecretBin, head over to <a href="https://github.com/aecretbin-io/secretbin">GitHub</a>.',
			Components: {
				Title: "Components",
				Description:
					"Below you will find a list of all software components used by {{name}}, along with their license.'",
				Headers: {
					Author: "Author",
					Component: "Component",
					License: "License",
					Version: "Version",
				},
			},
		},
		TermsOfService: {
			Title: "Terms of Service",
			Accept: "Accept",
			Decline: "Decline",
		},
		Errors: {
			PageNotFoundError: {
				Title: "Page Not Found",
				Message: "The page you were looking for doesn't exist.",
			},
			EventListError: {
				Title: "EventListError",
				Message: "Failed to get events.",
			},
			SecretNotFoundError: {
				Title: "SecretNotFoundError",
				Message: "A secret with the ID {{id}} does not exist.",
			},
			SecretAlreadyExistsError: {
				Title: "SecretAlreadyExistsError",
				Message: "A secret with the ID {{id}} already exists.",
			},
			SecretListError: {
				Title: "SecretListError",
				Message: "Failed to get secrets.",
			},
			SecretReadError: {
				Title: "SecretReadError",
				Message: "Unable to read secret with ID {{id}}.",
			},
			SecretCreateError: {
				Title: "SecretCreateError",
				Message: "Unable to create secret with ID {{id}}.",
			},
			SecretUpdateError: {
				Title: "SecretUpdateError",
				Message: "Unable to update the secret with ID {{id}}.",
			},
			SecretDeleteError: {
				Title: "SecretDeleteError",
				Message: "Unable to delete secret with ID {{id}}.",
			},
			SecretParseError: {
				Title: "SecretParseError",
				Message: "The secret has an invalid format. Details: {{reason}}",
			},
			SecretPolicyError: {
				Title: "SecretPolicyError",
				Message: "The secret you are trying to create violates the policies. Details: {{reason}}",
			},
			SecretSizeLimitError: {
				Title: "SecretSizeLimitError",
				Message: "The total size of the secret ({{size}}) exceeds the maximum allowed size of {{maxSize}}.",
			},
		},
		ErrorPage: {
			Title: "Error",
			GoHome: "Go back home",
		},
	},
}
