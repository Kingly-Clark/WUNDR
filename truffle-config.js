const { createProvider } = require("@rarible/trezor-provider");
const HDWalletProvider = require("@truffle/hdwallet-provider");
module.exports = {
  networks: {
    polygon_trezor: {
      provider: () => {
        return createProvider({
          url: process.env.POLYGON_NODE,
          path: "m/44'/60'/0'/0/0",
          chainId: 137,
        });
      },
      network_id: 137,
      gasPrice: 150 * 10 ** 9,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    mumbai_trezor: {
      provider: () => {
        return createProvider({
          url: process.env.MUMBAI_NODE,
          path: "m/44'/60'/0'/0/0",
          chainId: 80001,
        });
      },
      network_id: 80001,
      gasPrice: 2 * 10 ** 9,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    polygon: {
      provider: () =>
        new HDWalletProvider(process.env.MNEMONIC, process.env.POLYGON_NODE),
      network_id: 137,
      gasPrice: 150 * 10 ** 9,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    mumbai: {
      provider: () =>
        new HDWalletProvider(process.env.MNEMONIC, process.env.MUMBAI_NODE),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.18",
      settings: {
        optimizer: {
          enabled: true,
          runs: 100000,
        },
      },
    },
  },
};
