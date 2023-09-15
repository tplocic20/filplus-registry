const localConfig = {
  apiUri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  networks: 'Localhost',
  lotusNodes: [
    {
      name: 'Localhost',
      code: 1,
      url: 'wss://lotus.filecoin.nevermined.rocks/rpc/v0',
      token: process.env.LOCAL_NODE_TOKEN,
      notaryRepo: 'filecoin-notaries-onboarding',
      notaryOwner: 'keyko-io',
      rkhMultisig: 't080',
      rkhtreshold: 1,
      largeClientRequestAssign: ['clriesco', 'huseyincansoylu'],
    },
  ],
  dev_mode: process.env.NEXT_PUBLIC_MODE,
  numberOfWalletAccounts: 20,
  mnemonic: process.env.MNEMONIC,
  walletClass: 'BurnerWallet',
}

const prodConfig = {
  apiUri: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  networks: 'Mainnet',
  lotusNodes: [
    {
      name: 'Mainnet',
      code: 461,
      url: 'https://node.glif.io/space06/lotus/rpc/v1',
      token: process.env.MAINNET_TOKEN,
      notaryRepo: 'notary-governance',
      notaryOwner: 'filecoin-project',
      rkhMultisig: 'f080',
      rkhtreshold: 2,
      largeClientRequestAssign: ['galen-mcandrew'],
    },
  ],
  dev_mode: process.env.NEXT_PUBLIC_MODE,
  numberOfWalletAccounts: 20,
  mnemonic: '',
  walletClass: 'BurnerWallet',
}

export const config =
  process.env.NEXT_PUBLIC_MODE !== 'Production' ? localConfig : prodConfig
