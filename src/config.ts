const localConfig = {
  apiUri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  networks: 'Localhost',
  lotusNodes: [
    {
      name: 'Localhost',
      code: 461,
      url: process.env.NEXT_PUBLIC_NODE_ADDRESS,
      token: process.env.NEXT_PUBLIC_NODE_TOKEN,
      notaryRepo: 'filecoin-notaries-onboarding',
      notaryOwner: 'keyko-io',
      rkhMultisig: 'f080',
      rkhtreshold: 1,
      largeClientRequestAssign: ['clriesco'],
    },
  ],
  dev_mode: process.env.NEXT_PUBLIC_MODE,
  numberOfWalletAccounts: 20,
  mnemonic: process.env.NEXT_PUBLIC_MNEMONIC,
  walletClass: 'BurnerWallet',
}

const prodConfig = {
  apiUri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  networks: 'Mainnet',
  lotusNodes: [
    {
      name: 'Mainnet',
      code: 461,
      url: process.env.NEXT_PUBLIC_NODE_ADDRESS,
      token: process.env.NEXT_PUBLIC_NODE_TOKEN,
      notaryRepo: 'notary-governance',
      notaryOwner: 'filecoin-project',
      rkhMultisig: 'f080',
      rkhtreshold: 2,
      largeClientRequestAssign: ['galen-mcandrew'],
    },
  ],
  dev_mode: process.env.NEXT_PUBLIC_MODE,
  numberOfWalletAccounts: 20,
  mnemonic: process.env.MNEMONIC,
  walletClass: 'LedgerWallet',
}

export const config =
  process.env.NEXT_PUBLIC_MODE !== 'production' ? localConfig : prodConfig
