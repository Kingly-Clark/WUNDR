import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-test-utils';
import "hardhat-contract-sizer";
import 'solidity-coverage';
import * as dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
  mocha: {
    timeout: 200000,
  },
  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ]
  },

  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
    gasPriceApi: `https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice`,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: 'MATIC',
  },
  networks: {
    hardhat: {
      blockGasLimit: 30e6,
      gas: 24e6,
      gasPrice: 8e9,
    },
    mumbai: {
      url: process.env.MUMBAI_NODE,
      accounts: [process.env.WUNDERPAR_DEPLOYER_PRIVATE_KEY ?? ''],
    },
    polygon: {
      url: process.env.POLYGON_NODE,
      accounts: [process.env.WUNDERPAR_DEPLOYER_PRIVATE_KEY ?? ''],
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
};

export default config;