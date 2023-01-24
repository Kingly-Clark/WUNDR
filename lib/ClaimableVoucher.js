const ethers = require('ethers');

// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = 'Wandurpar-voucher';
const SIGNING_DOMAIN_VERSION = '1';

/**
 * JSDoc typedefs.
 *
 * @typedef {object} NFTVoucher
 * @property {ethers.address | string} redeemer The id of the minted NFT
 * @property {ethers.BigNumber | number} amount the id of the minted NFT
 * @property {ethers.BigNumber | number} nonce  The nonce is the number of vocuhers created from a given address, onced claimed it can never be re used
 * @property {ethers.BigNumber | number} expiry the expiry of voucher, hence cannot be calaimed after the due limit
 * @property {ethers.BytesLike} signature an EIP-712 signature of all fields in the NFTVoucher, apart from signature itself.
 */
class ClaimableVoucher {
  /**
   * Create a new LazyMinter targeting a deployed instance of the LazyNFT contract.
   *
   * @param {Object} options
   * @param {ethers.Contract} contract an ethers Contract that's wired up to the deployed contract
   * @param {ethers.Signer} signer a Signer whose account is authorized to transfer the NFTs on the deployed contract
   */
  constructor({ contract, signer, chainId }) {
    this.contract = contract;
    this.signer = signer;
    this.chainId = chainId;
  }

  /**
   * Creates a new NFTVoucher object and signs it using signing key provided.
   *
   * @param {string} redeemer The uri of the NFT to be minted
   * @param {ethers.BigNumber | number} nonce  The nonce is the number of vocuhers created from a given address, onced claimed it can never be re used
   * @param {ethers.BigNumber | number} expiry the expiry of voucher, hence cannot be calaimed after the due limit
   *
   * @returns {NFTVoucher}
   */
  async createVoucher(redeemer, amount, nonce, expiry) {
    const voucher = { redeemer, amount, nonce, expiry };
    const domain = await this._signingDomain();
    const types = {
      RewardVoucher: [
        { name: 'redeemer', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    const signature = await this.signer._signTypedData(domain, types, voucher);
    return {
      ...voucher,
      signature,
    };
  }

  async verifyVoucher(voucher) {
    const domain = await this._signingDomain();
    const types = {
      RewardVoucher: [
        { name: 'redeemer', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    };

    return ethers.utils.verifyTypedData(domain, types, voucher, voucher.signature);
  }

  /**
   * @private
   * @returns {object} the EIP-721 signing domain, tied to the chainId of the signer
   */
  async _signingDomain() {
    if (this._domain != null) {
      return this._domain;
    }
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId: this.chainId,
    };
    return this._domain;
  }
}

module.exports = {
  ClaimableVoucher,
};
