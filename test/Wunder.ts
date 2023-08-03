import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";

import { INTERFACE_IDS, REVERT_MESSAGES, name, symbol } from "./utils";

const wunderToEth = (decimal: string) => ethers.utils.parseEther(decimal);
const accessControlMessage = (role: string, account: string) =>
  `AccessControl: account ${account.toLowerCase()} is missing role ${role.toLowerCase()}`;

describe("Wunder", () => {
  async function deployWunder() {
    const [deployer, minter, pauser, burner, acc1, acc2, acc3] = await ethers.getSigners();

    const Wunder = await ethers.getContractFactory("Wunder");
    const wunder = await Wunder.deploy();

    return {
      deployer,
      wunder,
      minter,
      pauser,
      burner,
      acc1,
      acc2,
      acc3
    };
  }

  async function applyMinterRole(wunder: any, owner: any, minter: any) {
    await wunder.connect(owner).grantRole(await wunder.MINTER_ROLE(), minter.address);
  }

  async function applyPauserRole(wunder: any, owner: any, pauser: any) {
    await wunder.connect(owner).grantRole(await wunder.PAUSER_ROLE(), pauser.address);
  }

  async function applyBurnerRole(wunder: any, owner: any, burner: any) {
    await wunder.connect(owner).grantRole(await wunder.BURNER_ROLE(), burner.address);
  }

  /**
   * Fixture to 
   *  - deploy Wunder
   *  - apply roles
   *  - mint 1000 Wunder (1e21) tokens to acc1, acc2, acc3
   * 
   * @returns
   * wunder: Wunder contract
   * owner: owner of Wunder
   * notOwner: not owner of Wunder
   * minter: minter of Wunder
   * pauser: pauser of Wunder
   * burner: burner of Wunder
   * governor: governor of Wunder
   * acc1: account 1
   * acc2: account 2
   * acc3: account 3
   * 
   */
  async function deployWithRolesAppliedWunder() {
    const { wunder,
      deployer,
      minter,
      pauser,
      burner,
      acc1,
      acc2,
      acc3 } = await loadFixture(deployWunder);

    await applyMinterRole(wunder, deployer, minter);
    await applyPauserRole(wunder, deployer, pauser);
    await applyBurnerRole(wunder, deployer, burner);


    return {
      wunder,
      deployer,
      minter,
      pauser,
      burner,
      acc1,
      acc2,
      acc3
    };
  }

  describe("Deployment", () => {
    it("Should be able to deploy", async () => {
      const { wunder } = await loadFixture(deployWunder);

      expect(await wunder.name()).to.equal(name);
      expect(await wunder.symbol()).to.equal(symbol);
    });

    it("Should have granted DEFAULT_ADMIN_ROLE to deployer", async () => {
      const { wunder, deployer } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;
    });

    it("Should not have granted MINTER_ROLE to deployer after deployment", async () => {
      const { wunder, deployer } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.MINTER_ROLE(), deployer.address)).to.be.false;
    })

    it("Should not have granted PAUSER_ROLE to deployer after deployment", async () => {
      const { wunder, deployer } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), deployer.address)).to.be.false;
    });

    it("Should not have granted BURNER_ROLE to deployer after deployment", async () => {
      const { wunder, deployer } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.BURNER_ROLE(), deployer.address)).to.be.false;
    });

  });

  describe("Roles", () => {
    describe("Granting", () => {
      it("Should be able to grant MINTER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm deployer has DEFAULT_ADMIN_ROLE
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        // confirm acc1 doens't have MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), acc1.address)).to.be.false;

        // grant MINTER_ROLE to acc1
        await wunder.grantRole(await wunder.MINTER_ROLE(), acc1.address);

        // confirm acc1 has MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), acc1.address)).to.be.true;
      });

      it("Should be able to grant BURNER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm deployer has DEFAULT_ADMIN_ROLE
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        // confirm acc1 doens't have BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), acc1.address)).to.be.false;

        // grant BURNER_ROLE to acc1
        await wunder.grantRole(await wunder.BURNER_ROLE(), acc1.address);

        // confirm acc1 has BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), acc1.address)).to.be.true;
      });

      it("Should be able to grant PAUSER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm deployer has DEFAULT_ADMIN_ROLE
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        // confirm acc1 doens't have PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), acc1.address)).to.be.false;

        // grant PAUSER_ROLE to acc1
        await wunder.grantRole(await wunder.PAUSER_ROLE(), acc1.address);

        // confirm acc1 has PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), acc1.address)).to.be.true;
      });

      it("Shouldn't be able to grant any role if not DEFAULT_ADMIN_ROLE", async () => {
        const { wunder, acc1, acc2 } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), acc1.address)).to.be.false;

        await expect(wunder.connect(acc1).grantRole(await wunder.MINTER_ROLE(), acc2.address)).to.be.revertedWith(REVERT_MESSAGES.missingRole(await wunder.DEFAULT_ADMIN_ROLE(), acc1.address));
        await expect(wunder.connect(acc1).grantRole(await wunder.BURNER_ROLE(), acc2.address)).to.be.revertedWith(REVERT_MESSAGES.missingRole(await wunder.DEFAULT_ADMIN_ROLE(), acc1.address));
        await expect(wunder.connect(acc1).grantRole(await wunder.PAUSER_ROLE(), acc2.address)).to.be.revertedWith(REVERT_MESSAGES.missingRole(await wunder.DEFAULT_ADMIN_ROLE(), acc1.address));
      });

      it("Can't grant DEFAULT_ADMIN_ROLE directly - ensuring only 1 DEFAULT_ADMIN_ROLE", async () => {
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        await expect(wunder.grantRole(await wunder.DEFAULT_ADMIN_ROLE(), acc1.address)).to.be.revertedWith(REVERT_MESSAGES.noDirectAdminGrant);
      });

      it("Can't transfer DEFAULT_ADMIN_ROLE if not waiting pending period", async () => {
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);

        // confirm deployer has DEFAULT_ADMIN_ROLE  
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        // transfer DEFAULT_ADMIN_ROLE to acc1
        await wunder.beginDefaultAdminTransfer(acc1.address);

        const { newAdmin, schedule } = await wunder.pendingDefaultAdmin();

        await time.increaseTo(schedule - 1);


        await expect(wunder.connect(acc1).acceptDefaultAdminTransfer()).to.be.revertedWith(REVERT_MESSAGES.deplayNotPassed);



      });

      it("Can transfer DEFAULT_ADMIN_ROLE by waiting pending period", async () => {
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);

        // confirm deployer has DEFAULT_ADMIN_ROLE  
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        // transfer DEFAULT_ADMIN_ROLE to acc1
        await wunder.beginDefaultAdminTransfer(acc1.address);

        const { newAdmin, schedule } = await wunder.pendingDefaultAdmin();
        await time.increaseTo(schedule);
        await wunder.connect(acc1).acceptDefaultAdminTransfer();

        // confirm deployer doesn't have DEFAULT_ADMIN_ROLE
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.false;

      });
    });

    describe("Revoking", () => {
      it("Should be able to revoke MINTER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        // confirm acc1 doens't have MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), acc1.address)).to.be.false;

        // grant MINTER_ROLE to acc1
        await wunder.grantRole(await wunder.MINTER_ROLE(), acc1.address);

        // confirm acc1 has MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), acc1.address)).to.be.true;

        // revoke MINTER_ROLE from acc1
        await wunder.revokeRole(await wunder.MINTER_ROLE(), acc1.address);

        // confirm acc1 doesn't have MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), acc1.address)).to.be.false;
      });

      it("Should be able to revoke BURNER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm deployer has DEFAULT_ADMIN_ROLE
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        // confirm acc1 doens't have BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), acc1.address)).to.be.false;

        // grant BURNER_ROLE to acc1
        await wunder.grantRole(await wunder.BURNER_ROLE(), acc1.address);

        // confirm acc1 has BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), acc1.address)).to.be.true;

        // revoke BURNER_ROLE from acc1
        await wunder.revokeRole(await wunder.BURNER_ROLE(), acc1.address);

        // confirm acc1 doesn't have BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), acc1.address)).to.be.false;
      });


      it("Should be able to revoke PAUSER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm deployer has DEFAULT_ADMIN_ROLE
        const { wunder, deployer, acc1 } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;

        // confirm acc1 doens't have PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), acc1.address)).to.be.false;

        // grant PAUSER_ROLE to acc1
        await wunder.grantRole(await wunder.PAUSER_ROLE(), acc1.address);

        // confirm acc1 has PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), acc1.address)).to.be.true;

        // revoke PAUSER_ROLE from acc1
        await wunder.revokeRole(await wunder.PAUSER_ROLE(), acc1.address);

        // confirm acc1 doesn't have PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), acc1.address)).to.be.false;
      });
    });

    describe("Methods", () => {
      describe("MINTER_ROLE", () => {

        it("Should be able to batchMint Wunder as MINTER_ROLE", async () => {
          const { wunder, minter } = await loadFixture(deployWithRolesAppliedWunder);

          // confirm minter has MINTER_ROLE
          expect(await wunder.hasRole(await wunder.MINTER_ROLE(), minter.address)).to.be.true;

          // mint 100 Wunder to minter
          await wunder
            .connect(minter)
            .batchMint([minter.address], [100]);

          // confirm minter has 100 Wunder
          expect(await wunder.balanceOf(minter.address)).to.equal(100);

        });

        it("Shouldn't be able to batchMint Wunder as not MINTER_ROLE", async () => {
          const { wunder, minter } = await loadFixture(deployWunder);
          // confirm minter doens't have MINTER_ROLE
          expect(await wunder.hasRole(await wunder.MINTER_ROLE(), minter.address)).to.be.false;

          // mint 100 Wunder to minter
          await expect(wunder
            .connect(minter)
            .batchMint([minter.address], [100]))
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.MINTER_ROLE(), minter.address));

        });
      });

      describe("BURNER_ROLE", () => {

        it("Should be able to `burn` Wunder as BURNER_ROLE", async () => {
          const { wunder, burner, minter } = await loadFixture(deployWithRolesAppliedWunder);

          // confirm burner has BURNER_ROLE
          expect(await wunder.hasRole(await wunder.BURNER_ROLE(), burner.address))
            .to
            .be
            .true;


          // mint 100 Wunder to burner
          await wunder.connect(minter).batchMint([burner.address], [100]);

          // confirm burner has 100 Wunder
          expect(await wunder.balanceOf(burner.address)).to.equal(100);

          // burn 100 Wunder from burner
          await wunder.connect(burner).burn(100);

          // confirm burner has 0 Wunder
          expect(await wunder.balanceOf(burner.address)).to.equal(0);
        });

        it("Shouldn't be able to `burn` Wunder as not BURNER_ROLE", async () => {
          const { wunder, burner } = await loadFixture(deployWunder);

          // confirm burner doens't have BURNER_ROLE
          expect(await wunder.hasRole(await wunder.BURNER_ROLE(), burner.address))
            .to
            .be
            .false;

          // burn 100 Wunder from burner
          await expect(wunder.connect(burner).burn(100))
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.BURNER_ROLE(), burner.address));
        });

      });

      describe("PAUSER_ROLE", () => {
        // function pause() public onlyRole(PAUSER_ROLE)
        it("Should be able to `pause` as PAUSER_ROLE", async () => {
          const { wunder, pauser } = await loadFixture(deployWithRolesAppliedWunder);

          // confirm pauser has PAUSER_ROLE
          expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), pauser.address)).to.be.true;

          // confirm wunder is not paused
          expect(await wunder.paused()).to.be.false;

          // pause wunder
          await wunder.connect(pauser).pause();

          // confirm wunder is paused
          expect(await wunder.paused()).to.be.true;
        });

        it("Shouldn't be able to `pause` as not PAUSER_ROLE", async () => {
          const { wunder, pauser } = await loadFixture(deployWunder);
          // confirm pauser doens't have PAUSER_ROLE
          expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), pauser.address)).to.be.false;

          // confirm wunder is not paused
          expect(await wunder.paused()).to.be.false;

          // pause wunder
          await expect(wunder.connect(pauser).pause())
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.PAUSER_ROLE(), pauser.address));
        });

        // function unpause() public onlyRole(PAUSER_ROLE)
        it("Should be able to `unpause` as PAUSER_ROLE", async () => {
          const { wunder, pauser } = await loadFixture(deployWithRolesAppliedWunder);

          // confirm wunder is not paused
          expect(await wunder.paused()).to.be.false;

          // pause wunder
          await wunder.connect(pauser).pause();

          // confirm wunder is paused
          expect(await wunder.paused()).to.be.true;

          // unpause wunder
          await wunder.connect(pauser).unpause();

          // confirm wunder is not paused
          expect(await wunder.paused()).to.be.false;
        });

        it("Shouldn't be able to `unpause` as not PAUSER_ROLE", async () => {
          const { wunder, pauser } = await loadFixture(deployWunder);
          // confirm pauser doens't have PAUSER_ROLE
          expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), pauser.address)).to.be.false;

          // confirm wunder is not paused
          expect(await wunder.paused()).to.be.false;

          // unpause wunder
          await expect(wunder.connect(pauser).unpause())
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.PAUSER_ROLE(), pauser.address));
        });
      });
    });
  });

  describe("Batch", () => {
    describe("BatchTransfer", () => {

      // TODO: test multiTransfer with 0 addresses
      // TODO: test multiTransfer with 0 amounts
      // TODO: test multiTransfer with 0 addresses and 0 amounts
      // TODO: test multiTransfer with 1 address
      // TODO: test multiTransfer with 1 amount
      // TODO: test multiTransfer with mismatched addresses and amounts
      // TODO: test ERC20 allowance works with multiTransfer

      it("Should be able to transfer to multiple accounts", async () => {
        const { wunder, acc1, acc2, acc3, minter } = await loadFixture(deployWithRolesAppliedWunder);

        await wunder.connect(minter).batchMint([acc1.address, acc2.address, acc3.address], [wunderToEth("1000"), wunderToEth("1000"), wunderToEth("1000")])

        const src = acc1;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));
        // confirm acc2 has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));
        // confirm acc3 has 1000 Wunder
        expect(await wunder.balanceOf(acc3.address)).to.equal(wunderToEth("1000"));

        // transfer 100 Wunder from src to acc2 and acc3 respectively
        await wunder.connect(src)
          .batchTransfer([acc2.address, acc3.address], [wunderToEth("100"), wunderToEth("100")]);

        // confirm src has 900 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("800"));

        // confirm acc2 has 1100 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1100"));

        // confirm acc3 has 1100 Wunder
        expect(await wunder.balanceOf(acc3.address)).to.equal(wunderToEth("1100"));
      });

      it("Should be able to transfer to the same account as destination account", async () => {
        const { wunder, acc1, acc2, minter } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        const src = acc1;
        const dst = acc2;
        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        await wunder
          .connect(src)
          .batchTransfer([dst.address, dst.address], [wunderToEth("100"), wunderToEth("100")]);

        // confirm src has 800 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("800"));

        // confirm dst has 1200 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1200"));

      });

      it("Shouldn't be able to transfer to the same destination account if src funds run out after first transfer", async () => {
        const { wunder, acc1, acc2, minter } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        const src = acc1;
        const dst = acc2;


        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        await expect(wunder
          .connect(src)
          .batchTransfer([dst.address, dst.address], [wunderToEth("600"), wunderToEth("600")]))
          .to
          .be
          .revertedWith("ERC20: transfer amount exceeds balance");

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));
      });

      it("Should revert if length of addresses and amounts are not equal", async () => {
        const { wunder, acc1, acc2, minter } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        const src = acc1;
        const dst = acc2;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        await expect(wunder
          .connect(src)
          .batchTransfer([dst.address, dst.address], [wunderToEth("600")]))
          .to
          .be
          .revertedWith("Wunder: batchTransfer length mismatch");
      });

      it("Should revert if there is more than 256 addresses", async () => {
        const { wunder, acc1, acc2, minter } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        const src = acc1;
        const dst = acc2;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        const receipients = Array(257).fill(dst.address);
        const amounts = Array(257).fill(wunderToEth("1"));
        await expect(wunder
          .connect(src)
          .batchTransfer(receipients, amounts))
          .to
          .be
          .revertedWith("Wunder: recipients and amounts length must be less than 256");
      });


    });

    describe("BatchMint", () => {
      it("Should be able to mint to multiple accounts", async () => {
        const { wunder, acc1, acc2, acc3, minter } = await loadFixture(deployWithRolesAppliedWunder);

        // confirm acc1 has 0 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(0);

        // confirm acc2 has 0 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(0);

        // confirm acc3 has 0 Wunder
        expect(await wunder.balanceOf(acc3.address)).to.equal(0);

        // mint 1000 Wunder to acc1, acc2 and acc3 respectively
        await wunder.connect(minter).batchMint([acc1.address, acc2.address, acc3.address], [wunderToEth("1000"), wunderToEth("1000"), wunderToEth("1000")])

        // confirm acc1 has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));

        // confirm acc2 has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));

        // confirm acc3 has 1000 Wunder
        expect(await wunder.balanceOf(acc3.address)).to.equal(wunderToEth("1000"));
      });

      it("Should revert if length of addresses and amounts are not equal", async () => {
        const { wunder, acc1, acc2, minter } = await loadFixture(deployWithRolesAppliedWunder);

        // confirm acc1 has 0 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(0);

        // confirm acc2 has 0 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(0);

        await expect(wunder
          .connect(minter)
          .batchMint([acc1.address, acc2.address], [wunderToEth("1000")]))
          .to
          .be
          .revertedWith("Wunder: batchMint length mismatch");
      });

      it("Should revert if there is more than 256 addresses", async () => {
        const { wunder, acc1, acc2, minter } = await loadFixture(deployWithRolesAppliedWunder);

        // confirm acc1 has 0 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(0);

        // confirm acc2 has 0 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(0);

        const receipients = Array(257).fill(acc1.address);
        const amounts = Array(257).fill(wunderToEth("1"));
        await expect(wunder
          .connect(minter)
          .batchMint(receipients, amounts))
          .to
          .be
          .revertedWith("Wunder: recipients and amounts length must be less than 256");
      });
    });
  });

  describe("Pausing/Unpausing", () => {
    describe("Methods when paused", () => {
      // transfer, transferFrom, batchTransfer, batchMint, burn
      it("Shouldn't be able to transfer when paused", async () => {
        const { wunder, acc1, acc2, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        await expect(wunder.connect(acc1).transfer(acc2.address, wunderToEth("100"))).to.be.revertedWith("Pausable: paused");

        // confirm acc1 still has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));

        // confirm acc2 still has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));
      });

      it("Shouldn't be able to transferFrom when paused", async () => {
        const { wunder, acc1, acc2, acc3, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        // approve acc3 to spend 100 Wunder from acc1
        await wunder.connect(acc1).approve(acc3.address, wunderToEth("100"));

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        await expect(wunder.connect(acc3).transferFrom(acc1.address, acc2.address, wunderToEth("100"))).to.be.revertedWith("Pausable: paused");

        // confirm acc1 still has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));

        // confirm acc2 still has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));
      });

      it("Shouldn't be able to batchTransfer when paused", async () => {
        const { wunder, acc1, acc2, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        await expect(wunder.connect(acc1).batchTransfer([acc2.address, acc2.address], [wunderToEth("100"), wunderToEth("100")])).to.be.revertedWith("Pausable: paused");

        // confirm acc1 still has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));

        // confirm acc2 still has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));
      });

      it("Shouldn't be able to batchMint when paused", async () => {
        const { wunder, acc1, acc2, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        await expect(wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])).to.be.revertedWith("Pausable: paused");

        // confirm acc1 still has 0 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(0);

        // confirm acc2 still has 0 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(0);
      });

      it("Shouldn't be able to burn when paused", async () => {
        const { wunder, acc1, acc2, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        await expect(wunder.connect(acc1).burn(wunderToEth("100"))).to.be.revertedWith("Pausable: paused");

        // confirm acc1 still has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));

        // confirm acc2 still has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));
      });

    });


    describe("Methods when unpaused", () => {
      it("should be able to transfer when unpaused", async () => {
        const { wunder, acc1, acc2, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        // unpause the contract
        await wunder.connect(pauser).unpause();

        // confirm contract is unpaused
        expect(await wunder.paused()).to.be.false;

        // transfer 100 Wunder from acc1 to acc2
        await wunder.connect(acc1).transfer(acc2.address, wunderToEth("100"));

        // confirm acc1 has 900 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("900"));

        // confirm acc2 has 1100 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1100"));
      });

      it("should be able to transferFrom when unpaused", async () => {
        const { wunder, acc1, acc2, acc3, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        // approve acc3 to spend 100 Wunder from acc1
        await wunder.connect(acc1).approve(acc3.address, wunderToEth("100"));

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        // unpause the contract
        await wunder.connect(pauser).unpause();

        // confirm contract is unpaused
        expect(await wunder.paused()).to.be.false;

        // transfer 100 Wunder from acc1 to acc2
        await wunder.connect(acc3).transferFrom(acc1.address, acc2.address, wunderToEth("100"));

        // confirm acc1 has 900 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("900"));

        // confirm acc2 has 1100 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1100"));
      });

      it("Should be able to batchTransfer when unpaused", async () => {
        const { wunder, acc1, acc2, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")])

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        // unpause the contract
        await wunder.connect(pauser).unpause();

        // confirm contract is unpaused
        expect(await wunder.paused()).to.be.false;

        // transfer 100 Wunder from acc1 to acc2
        await wunder.connect(acc1).batchTransfer([acc2.address, acc2.address], [wunderToEth("100"), wunderToEth("100")]);

        // confirm acc1 has 900 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("800"));

        // confirm acc2 has 1100 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1200"));
      });

      it("Should be able to batchMint when unpaused", async () => {
        const { wunder, acc1, acc2, minter, pauser } = await loadFixture(deployWithRolesAppliedWunder);

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        // unpause the contract
        await wunder.connect(pauser).unpause();

        // confirm contract is unpaused
        expect(await wunder.paused()).to.be.false;

        // mint 1000 Wunder to acc1 and acc2
        await wunder.connect(minter).batchMint([acc1.address, acc2.address], [wunderToEth("1000"), wunderToEth("1000")]);

        // confirm acc1 has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));

        // confirm acc2 has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));
      });

      it("Should be able to burn when unpaused", async () => {
        const { wunder, acc1, minter, pauser, burner } = await loadFixture(deployWithRolesAppliedWunder);
        await wunder.connect(minter).batchMint([acc1.address], [wunderToEth("1000")])

        // pause the contract
        await wunder.connect(pauser).pause();

        // confirm contract is paused
        expect(await wunder.paused()).to.be.true;

        // unpause the contract
        await wunder.connect(pauser).unpause();

        // confirm contract is unpaused
        expect(await wunder.paused()).to.be.false;

        const totalSupply = await wunder.totalSupply();
        expect(totalSupply).to.equal(wunderToEth("1000"));

        // burn 100 Wunder from acc1
        await wunder.connect(acc1).transfer(burner.address, wunderToEth("100"));
        await wunder.connect(burner).burn(wunderToEth("100"));

        // confirm total supply is 900 Wunder
        expect(await wunder.totalSupply()).to.equal(wunderToEth("900"));

      });





    });

  });

  describe("Interfaces", () => {
    it("Should implement IERC20", async () => {
      const { wunder } = await loadFixture(deployWithRolesAppliedWunder);

      expect(await wunder.supportsInterface(INTERFACE_IDS.IERC20)).to.be.true;
    });

    it("Should implement IERC165", async () => {
      const { wunder } = await loadFixture(deployWithRolesAppliedWunder);

      expect(await wunder.supportsInterface(INTERFACE_IDS.IERC165)).to.be.true;
    });

    it("Should implement IWunder", async () => {
      const { wunder } = await loadFixture(deployWithRolesAppliedWunder);

      expect(await wunder.supportsInterface(INTERFACE_IDS.IWunder)).to.be.true;
    });

    it("Should implement IAccessControl", async () => {
      const { wunder } = await loadFixture(deployWithRolesAppliedWunder);

      expect(await wunder.supportsInterface(INTERFACE_IDS.IAccessControl)).to.be.true;
    });



  });

  describe("GAS Usage", () => {

    it("Evaluate GAS costs for 10 transactions of different sizes between acc1, acc2 and acc3", async () => {
      const { wunder, acc1, acc2, acc3, minter } = await loadFixture(deployWithRolesAppliedWunder);

      await wunder.connect(minter).batchMint([acc1.address, acc2.address, acc3.address], [wunderToEth("1000"), wunderToEth("1000"), wunderToEth("1000")])


      for (let i = 0; i < 10; i++) {
        const amount = Math.floor(Math.random() * 1000);
        await wunder.connect(acc1).transfer(acc2.address, amount);
        await wunder.connect(acc2).transfer(acc3.address, amount);
        await wunder.connect(acc3).transfer(acc1.address, amount);
      }
    });

    it("Evaluate GAs cost for 10 multi transactions of different sizes between acc1, acc2 and acc3", async () => {
      const { wunder, acc1, acc2, acc3, minter } = await loadFixture(deployWithRolesAppliedWunder);
      await wunder.connect(minter).batchMint([acc1.address, acc2.address, acc3.address], [wunderToEth("1000"), wunderToEth("1000"), wunderToEth("1000")])


      let acc2Total = wunderToEth("1000");
      let acc3Total = wunderToEth("1000");
      for (let i = 0; i < 10; i++) {
        const acc2Amount = Math.floor(Math.random() * 10);
        const acc3Amount = Math.floor(Math.random() * 10);

        acc2Total = acc2Total.add(acc2Amount);
        acc3Total = acc3Total.add(acc3Amount);


        await wunder.connect(acc1).batchTransfer(
          [acc2.address, acc3.address],
          [acc2Amount, acc3Amount]
        );
      }

      expect(await wunder.balanceOf(acc2.address)).to.equal(acc2Total);
      expect(await wunder.balanceOf(acc3.address)).to.equal(acc3Total);

    });
  });
});

