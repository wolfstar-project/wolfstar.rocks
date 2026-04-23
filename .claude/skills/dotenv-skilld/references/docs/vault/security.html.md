Security | Dotenv



Pricing Security

Docs

Log in

## Proven. Trusted. Secure.

Proven AES-GCM encryption, a separate vault store, and a developer experience that encourages security.

## How It Works. Securely.

Here's what happens when you sync your .env file with dotenv-vault.

Step 1

##### npx dotenv-vault push

You run npx dotenv-vault push. Your request is started.

Step 2

##### Encrypted Connection

Your .env file is encrypted and sent securely over SSL to Dotenv's in-memory servers.

Step 3

##### Dotenv Servers

This encrypted payload is decrypted and briefly held in memory to complete the next steps. Afterward, the memory is flushed. Rest assured the decrypted version is never persisted to Dotenv systems.

Step 4

##### Parsing

Your .env file is parsed line by line - in memory.

Note: There are minor differences between dotenv parsers across various languages and frameworks. So far Dotenv Vault handles 100% of these, and we continue to add test cases to cover all edge cases.

KEY=VALUE

Step 5

##### Secret Extraction

Each key/value pair (and any comments) are extracted - in memory.

KEY=VALUE

KEY VALUE

Step 6

##### Secret Division

The secret is divided into its separate key and value. This is by design. They will be stored in separate databases for added security. This way if an attacker somehow gained access to one database they would not be able to make sense of the data - having only half the puzzle.

KEY

key_b46…

VALUE

val_a8e…

Step 7

##### AES-GCM Encryption

The KEY is encrypted. The VALUE is encrypted. They are encrypted with different master encryption keys. This way if an attacker somehow gained access to the VALUE decryption key they would find the data useless. They would not know if the secret belonged to Twilio or to AWS.

Encryption uses the AES-GCM algorithm. It is:

- well-studied
- NIST recommended
- an IETF standard
- fast thanks to a dedicated instruction set

Additionally, all master encryption keys are rotated on an unpublished schedule, further adding to the level of security.

val_a8e…

Dotenv Vault Store

token_fd4b…

Step 8

##### Tokenization

The encrypted VALUE is sent to Dotenv Vault for safe storage. A token is returned as an identifier. The token is used in the next step for mapping the KEY to the VALUE for later secure-read operations.

Multiple security measures go into the Vault. They include but are not limited to:

- Separate datastore from the application database
- Not accessible via the internet and all external connections are prevented
- Encrypted clients are required and these clients have to go through the application - which has its own additional layers of encryption
- There are stricter TLS requirements for connecting to the Vault. TLS 1.0 cannot be used to connect.
- The secrets stored in the Vault are not just encrypted at the datastore level. They are also encrypted at each datastore entry as you saw in the prior step(s).

key_b46… token_fd4b…

Dotenv Application DB

Step 9

##### Store Key Part with Token

Lastly, the encrypted KEY and token (representing the encrypted VALUE) are placed in an envelope and stored together in the application database.

Step 10

##### Success 201

A success message is returned to the developer.

See the security docs to dive deeper

## Security Specifications

Here's additional specifications that went into building dotenv-vault.

| ✓ The Dotenv Vault is a separate datastore from the application database. This way if an attacker gains access to the application database they do not gain access to the vault datastore. |
| --- |
| ✓ The Dotenv Vault datastore is not accessible via the internet and all external connections are prevented. This way an attacker can not remotely access the Dotenv Vault datastore. |
| ✓ Encrypted clients are required and these clients have to go through the application - which has its own layers of encryption. |
| ✓ There are stricter TLS requirements for connecting to the Dotenv Vault datastore. TLS 1.0 cannot be used to connect. |
| ✓ The secrets stored in the Dotenv Vault are not just encrypted at the datastore level. They are also encrypted at each VALUE. This way even if an attacker gains access to the datastore they could not make sense of the encrypted values. |
| ✓ The VAULT does NOT store the KEY. It ONLY stores the VALUE. The KEY is stored in the application database and a shared pointer (in both datastores) allows them to be identified as a pair. This way an attacker must gain access to both the application database and the Dotenv Vault datastore to make sense of the values. |
| ✓ The encryption key(s) used to encrypt the secret values are rotated on an unpublished schedule. This way an attacker might gain access to an old encryption key but not the most recent - foiling their ability to decrypt the secret values. |
| ✓ Encryption uses AES-GCM encryption. It is a well-studied, NIST recommended, and IEFT standard algorithim. |

As you see, we go to great lengths to make sure your secrets are safe. Afterall, we keep our secrets here too.

## Security Statement

A message from Dotenv's Founder & CTO.

Fellow developer,

As you already know, security is an evermoving target - an arms race. But that doesn't mean it should be hard to use. Good design can make complex things simple, and that is what we are after at Dotenv.

Dotenv is a security tool. It has been since it was first developed in 2013. We saw developers struggling to keep their secrets safe so we pioneered the .env security file format standard. The design led to a better Developer Security Experience - which led to safer secrets for millions of developers. Today, we are taking that to the next logical step.

What is the problem with .env files today? The world has changed. Developers manage secrets at greater scale than a decade ago. .env files are not easily shareable between machines, environments, and team members. As a result, developers share secrets over Slack, email, and other messaging services. It's not scaleable and is a security risk. For a CTO or CSO it is a risk they should not take.

So, today, we are extending the .env file format to support syncing across machines, environments, and team members. It's an exciting development and we welcome you to go on this journey with us.

Join us.

- Mot

Founder & CTO



## Secure your .env files today

Create Dotenv Account

   Visual Studio Code Pricing Security Docs Terms Privacy Status Help & Support

 2025 Dotenv