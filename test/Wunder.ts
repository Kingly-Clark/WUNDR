import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { INTERFACE_IDS } from "./utils";

const wunderToEth = (decimal: string) => ethers.utils.parseEther(decimal);
const accessControlMessage = (role: string, account: string) =>
  `AccessControl: account ${account.toLowerCase()} is missing role ${role.toLowerCase()}`;

describe("Wunder", () => {
  async function deployWunder() {
    const [owner, notOwner, minter, pauser, burner, governor, acc1, acc2, acc3] = await ethers.getSigners();

    const Wunder = await ethers.getContractFactory("Wunder");
    const wunder = await Wunder.deploy();

    return {
      wunder,
      owner,
      notOwner,
      minter,
      pauser,
      burner,
      governor,
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

  async function applyGovernRole(wunder: any, owner: any, govern: any) {
    await wunder.connect(owner).grantRole(await wunder.GOVERN_ROLE(), govern.address);
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
  async function deployFullWunder() {
    const { wunder,
      owner,
      notOwner,
      minter,
      pauser,
      burner,
      governor,
      acc1,
      acc2,
      acc3 } = await loadFixture(deployWunder);

    await applyMinterRole(wunder, owner, minter);
    await applyPauserRole(wunder, owner, pauser);
    await applyBurnerRole(wunder, owner, burner);
    await applyGovernRole(wunder, owner, governor);

    await wunder.connect(minter).mint(acc1.address, wunderToEth("1000"));
    await wunder.connect(minter).mint(acc2.address, wunderToEth("1000"));
    await wunder.connect(minter).mint(acc3.address, wunderToEth("1000"));

    return {
      wunder,
      owner,
      notOwner,
      minter,
      pauser,
      burner,
      governor,
      acc1,
      acc2,
      acc3
    };
  }

  describe("Deployment", () => {
    it("Should be able to deploy", async () => {
      const { wunder } = await loadFixture(deployWunder);

      expect(await wunder.name()).to.equal("Wunderpar Token");
      expect(await wunder.symbol()).to.equal("Wunder");
    });

    it("Should have granted owner DEFAULT_ADMIN_ROLE to deployer (owner)", async () => {
      const { wunder, owner } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should not have granted owner MINTER_ROLE to deployer (owner)", async () => {
      const { wunder, owner } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.MINTER_ROLE(), owner.address)).to.be.false;
    })

    it("Should not have granted owner PAUSER_ROLE to deployer (owner)", async () => {
      const { wunder, owner } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), owner.address)).to.be.false;
    });

    it("Should not have granted owner BURNER_ROLE to deployer (owner)", async () => {
      const { wunder, owner } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.BURNER_ROLE(), owner.address)).to.be.false;
    });

    it("Should not have granted owner GOVERN_ROLE to deployer (owner)", async () => {
      const { wunder, owner } = await loadFixture(deployWunder);

      expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), owner.address)).to.be.false;
    });
  });

  describe("Roles", () => {
    describe("Granting", () => {
      it("Should be able to grant MINTER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, owner, notOwner } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), notOwner.address)).to.be.false;

        // grant MINTER_ROLE to notOwner
        await wunder.grantRole(await wunder.MINTER_ROLE(), notOwner.address);

        // confirm notOwner has MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), notOwner.address)).to.be.true;
      });

      it("Should be able to grant BURNER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, owner, notOwner } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), notOwner.address)).to.be.false;

        // grant BURNER_ROLE to notOwner
        await wunder.grantRole(await wunder.BURNER_ROLE(), notOwner.address);

        // confirm notOwner has BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), notOwner.address)).to.be.true;
      });

      it("Should be able to grant GOVERN_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, owner, notOwner } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have GOVERN_ROLE
        expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), notOwner.address)).to.be.false;

        // grant GOVERN_ROLE to notOwner
        await wunder.grantRole(await wunder.GOVERN_ROLE(), notOwner.address);

        // confirm notOwner has GOVERN_ROLE
        expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), notOwner.address)).to.be.true;
      });

      it("Should be able to grant PAUSER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, owner, notOwner } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), notOwner.address)).to.be.false;

        // grant PAUSER_ROLE to notOwner
        await wunder.grantRole(await wunder.PAUSER_ROLE(), notOwner.address);

        // confirm notOwner has PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), notOwner.address)).to.be.true;
      });

    });

    describe("Revoking", () => {
      it("Should be able to revoke MINTER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, owner, notOwner } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), notOwner.address)).to.be.false;

        // grant MINTER_ROLE to notOwner
        await wunder.grantRole(await wunder.MINTER_ROLE(), notOwner.address);

        // confirm notOwner has MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), notOwner.address)).to.be.true;

        // revoke MINTER_ROLE from notOwner
        await wunder.revokeRole(await wunder.MINTER_ROLE(), notOwner.address);

        // confirm notOwner doesn't have MINTER_ROLE
        expect(await wunder.hasRole(await wunder.MINTER_ROLE(), notOwner.address)).to.be.false;
      });

      it("Should be able to revoke BURNER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, owner, notOwner } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), notOwner.address)).to.be.false;

        // grant BURNER_ROLE to notOwner
        await wunder.grantRole(await wunder.BURNER_ROLE(), notOwner.address);

        // confirm notOwner has BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), notOwner.address)).to.be.true;

        // revoke BURNER_ROLE from notOwner
        await wunder.revokeRole(await wunder.BURNER_ROLE(), notOwner.address);

        // confirm notOwner doesn't have BURNER_ROLE
        expect(await wunder.hasRole(await wunder.BURNER_ROLE(), notOwner.address)).to.be.false;
      });

      it("Should be able to revoke GOVERN_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, owner, notOwner } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have GOVERN_ROLE
        expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), notOwner.address)).to.be.false;

        // grant GOVERN_ROLE to notOwner
        await wunder.grantRole(await wunder.GOVERN_ROLE(), notOwner.address);

        // confirm notOwner has GOVERN_ROLE
        expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), notOwner.address)).to.be.true;

        // revoke GOVERN_ROLE from notOwner
        await wunder.revokeRole(await wunder.GOVERN_ROLE(), notOwner.address);

        // confirm notOwner doesn't have GOVERN_ROLE
        expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), notOwner.address)).to.be.false;
      });

      it("Should be able to revoke PAUSER_ROLE as DEFAULT_ADMIN_ROLE", async () => {
        // confirm owner has DEFAULT_ADMIN_ROLE
        const { wunder, owner, notOwner } = await loadFixture(deployWunder);
        expect(await wunder.hasRole(await wunder.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;

        // confirm notOwner doens't have PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), notOwner.address)).to.be.false;

        // grant PAUSER_ROLE to notOwner
        await wunder.grantRole(await wunder.PAUSER_ROLE(), notOwner.address);

        // confirm notOwner has PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), notOwner.address)).to.be.true;

        // revoke PAUSER_ROLE from notOwner
        await wunder.revokeRole(await wunder.PAUSER_ROLE(), notOwner.address);

        // confirm notOwner doesn't have PAUSER_ROLE
        expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), notOwner.address)).to.be.false;
      });


    });

    describe("Methods", () => {
      describe("MINTER_ROLE", () => {
        it("Should be able to `mint` Wunder as MINTER_ROLE", async () => {
          const { wunder, owner, minter } = await loadFixture(deployWunder);
          // confirm minter doens't have MINTER_ROLE
          expect(await wunder.hasRole(await wunder.MINTER_ROLE(), minter.address))
            .to
            .be
            .false;

          // grant MINTER_ROLE to minter
          await wunder
            .connect(owner)
            .grantRole(await wunder.MINTER_ROLE(), minter.address);

          // confirm minter has MINTER_ROLE
          expect(await wunder.hasRole(await wunder.MINTER_ROLE(), minter.address)).to.be.true;

          // mint 100 Wunder to minter
          await wunder
            .connect(minter)
            .mint(minter.address, 100);

          // confirm minter has 100 Wunder
          expect(await wunder.balanceOf(minter.address)).to.equal(100);

        });

        it("Shouldn't be able to `mint` Wunder as not MINTER_ROLE", async () => {
          const { wunder, minter } = await loadFixture(deployWunder);
          // confirm minter doens't have MINTER_ROLE
          expect(await wunder.hasRole(await wunder.MINTER_ROLE(), minter.address)).to.be.false;

          // mint 100 Wunder to minter
          await expect(wunder
            .connect(minter)
            .mint(minter.address, 100))
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.MINTER_ROLE(), minter.address));

        });
      });

      describe("BURNER_ROLE", () => {

        it("Should be able to `burn` Wunder as BURNER_ROLE", async () => {
          const { wunder, owner, burner } = await loadFixture(deployWunder);

          // confirm burner doens't have BURNER_ROLE
          expect(await wunder.hasRole(await wunder.BURNER_ROLE(), burner.address))
            .to
            .be
            .false;

          // grant BURNER_ROLE to burner
          await wunder.connect(owner).grantRole(await wunder.BURNER_ROLE(), burner.address);

          // confirm burner has BURNER_ROLE
          expect(await wunder.hasRole(await wunder.BURNER_ROLE(), burner.address))
            .to
            .be
            .true;

          await wunder.connect(owner).grantRole(await wunder.MINTER_ROLE(), burner.address);

          // mint 100 Wunder to burner
          await wunder.connect(burner).mint(burner.address, 100);

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

      describe("GOVERN_ROLE", () => {

        // function freeze(address account)
        it("Should be able to `freeze` an account as GOVERN_ROLE", async () => {
          const { wunder, owner, governor, acc1 } = await loadFixture(deployWunder);
          // confirm governor doens't have GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address))
            .to
            .be
            .false;

          // grant GOVERN_ROLE to governor
          await wunder.connect(owner).grantRole(await wunder.GOVERN_ROLE(), governor.address);

          // confirm governor has GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.true;

          // confirm acc1 is not frozen
          expect(await wunder.isFrozen(acc1.address)).to.be.false;

          // freeze acc1
          await wunder.connect(governor).freeze(acc1.address);

          // confirm acc1 is frozen
          expect(await wunder.isFrozen(acc1.address)).to.be.true;
        });

        it("Shouldn't be able to `freeze` an account as not GOVERN_ROLE", async () => {
          const { wunder, governor, acc1 } = await loadFixture(deployWunder);
          // confirm governor doens't have GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address))
            .to
            .be
            .false;

          // freeze acc1
          await expect(wunder.connect(governor).freeze(acc1.address))
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.GOVERN_ROLE(), governor.address));
        });

        // function unfreeze(address account)
        it("Should be able to `unfreeze` an account as GOVERN_ROLE", async () => {
          const { wunder, owner, governor, acc1 } = await loadFixture(deployWunder);
          // confirm governor doens't have GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.false;

          // grant GOVERN_ROLE to governor
          await wunder.connect(owner).grantRole(await wunder.GOVERN_ROLE(), governor.address);

          // confirm governor has GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.true;

          // confirm acc1 is not frozen
          expect(await wunder.isFrozen(acc1.address)).to.be.false;

          // freeze acc1
          await wunder.connect(governor).freeze(acc1.address);

          // confirm acc1 is frozen
          expect(await wunder.isFrozen(acc1.address)).to.be.true;

          // unfreeze acc1
          await wunder.connect(governor).unfreeze(acc1.address);

          // confirm acc1 is not frozen
          expect(await wunder.isFrozen(acc1.address)).to.be.false;
        });

        it("Shouldn't be able to `unfreeze` an account as not GOVERN_ROLE", async () => {
          const { wunder, governor, acc1 } = await loadFixture(deployWunder);
          // confirm governor doens't have GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.false;

          // unfreeze acc1
          await expect(wunder.connect(governor).unfreeze(acc1.address))
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.GOVERN_ROLE(), governor.address));
        });

        // function seize(address account)
        it("Should be able to `seize` an account as GOVERN_ROLE", async () => {
          const { wunder, owner, governor, minter, acc1 } = await loadFixture(deployWunder);
          // confirm governor doens't have GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.false;
          // grant GOVERN_ROLE to governor
          await wunder.connect(owner).grantRole(await wunder.GOVERN_ROLE(), governor.address);
          // confirm governor has GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.true;

          // grant MINTER_ROLE to minter
          await wunder.connect(owner).grantRole(await wunder.MINTER_ROLE(), minter.address);

          // mint 100 Wunder to acc1
          await wunder.connect(minter).mint(acc1.address, 100);

          // confirm acc1 has 100 Wunder
          expect(await wunder.balanceOf(acc1.address)).to.equal(100);

          // confirm wunder contract has 0 Wunder
          expect(await wunder.balanceOf(wunder.address)).to.equal(0);

          // freeze acc1 (acc1 is not frozen)
          await wunder.connect(governor).freeze(acc1.address);

          // seize acc1
          await wunder.connect(governor).seize(acc1.address);

          // confirm acc1 has 0 Wunder
          expect(await wunder.balanceOf(acc1.address)).to.equal(0);

          // confirm wunder contract has 100 Wunder
          expect(await wunder.balanceOf(wunder.address)).to.equal(100);

        });

        it("Shouldn't be able to `seize` an account as not GOVERN_ROLE", async () => {
          const { wunder, governor, minter, acc1 } = await loadFixture(deployWunder);
          // confirm governor doens't have GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.false;

          // seize acc1
          await expect(wunder.connect(governor).seize(acc1.address))
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.GOVERN_ROLE(), governor.address));
        });


        // function withdraw(uint256 amount)
        it("Should be able to `withdraw` Wunder as GOVERN_ROLE", async () => {
          const { wunder, owner, governor, minter, acc1 } = await loadFixture(deployWunder);
          // confirm governor doens't have GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.false;
          // grant GOVERN_ROLE to governor
          await wunder.connect(owner).grantRole(await wunder.GOVERN_ROLE(), governor.address);
          // confirm governor has GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.true;

          // grant MINTER_ROLE to minter
          await wunder.connect(owner).grantRole(await wunder.MINTER_ROLE(), minter.address);

          // mint 100 Wunder to acc1
          await wunder.connect(minter).mint(acc1.address, 100);

          // confirm acc1 has 100 Wunder
          expect(await wunder.balanceOf(acc1.address)).to.equal(100);

          // confirm wunder contract has 0 Wunder
          expect(await wunder.balanceOf(wunder.address)).to.equal(0);

          // freeze acc1 (acc1 is not frozen)
          await wunder.connect(governor).freeze(acc1.address);

          // seize acc1
          await wunder.connect(governor).seize(acc1.address);

          // confirm acc1 has 0 Wunder
          expect(await wunder.balanceOf(acc1.address)).to.equal(0);

          // confirm wunder contract has 100 Wunder
          expect(await wunder.balanceOf(wunder.address)).to.equal(100);

          // withdraw 100 Wunder
          await wunder.connect(governor).withdraw(100);

          // confirm acc1 has 0 Wunder
          expect(await wunder.balanceOf(acc1.address)).to.equal(0);

          // confirm wunder contract has 0 Wunder
          expect(await wunder.balanceOf(wunder.address)).to.equal(0);

          // confirm governor has 100 Wunder
          expect(await wunder.balanceOf(governor.address)).to.equal(100);

        });

        it("Shouldn't be able to `withdraw` Wunder as not GOVERN_ROLE", async () => {
          const { wunder, governor, minter, acc1 } = await loadFixture(deployWunder);
          // confirm governor doens't have GOVERN_ROLE
          expect(await wunder.hasRole(await wunder.GOVERN_ROLE(), governor.address)).to.be.false;

          // withdraw 100 Wunder
          await expect(wunder.connect(governor).withdraw(100))
            .to
            .be
            .revertedWith(accessControlMessage(await wunder.GOVERN_ROLE(), governor.address));
        });
      });

      describe("PAUSER_ROLE", () => {
        // function pause() public onlyRole(PAUSER_ROLE)
        it("Should be able to `pause` as PAUSER_ROLE", async () => {
          const { wunder, owner, pauser } = await loadFixture(deployWunder);
          // confirm pauser doens't have PAUSER_ROLE
          expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), pauser.address)).to.be.false;

          // grant PAUSER_ROLE to pauser
          await wunder.connect(owner).grantRole(await wunder.PAUSER_ROLE(), pauser.address);

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
          const { wunder, owner, pauser } = await loadFixture(deployWunder);
          // confirm pauser doens't have PAUSER_ROLE
          expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), pauser.address)).to.be.false;

          // grant PAUSER_ROLE to pauser
          await wunder.connect(owner).grantRole(await wunder.PAUSER_ROLE(), pauser.address);

          // confirm pauser has PAUSER_ROLE
          expect(await wunder.hasRole(await wunder.PAUSER_ROLE(), pauser.address)).to.be.true;

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

  describe("Government", () => {
    describe("Freezing ", () => {
      it("Should be able to transfer between 2 accounts that aren't frozen", async () => {
        const { wunder, acc1, acc2 } = await loadFixture(deployFullWunder);

        // confirm acc1 and acc2 aren't frozen
        expect(await wunder.isFrozen(acc1.address)).to.be.false;
        expect(await wunder.isFrozen(acc2.address)).to.be.false;

        // confirm acc1 has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));

        // confirm acc2 has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));

        // transfer 100 Wunder from acc1 to acc2
        await wunder.connect(acc1).transfer(acc2.address, wunderToEth("100"));

        // confirm acc1 has 900 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("900"));

        // confirm acc2 has 1100 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1100"));
      });

      it("Should not be able to transfer if source account is frozen", async () => {
        const { wunder, governor, acc1, acc2 } = await loadFixture(deployFullWunder);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // freeze src
        await wunder.connect(governor).freeze(src.address);

        // confirm src is frozen
        expect(await wunder.isFrozen(src.address)).to.be.true;

        // confirm dst is not frozen
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // transfer 100 Wunder from src to dst
        await expect(wunder.connect(src).transfer(dst.address, wunderToEth("100")))
          .to
          .be
          .revertedWith("Wunder: Account is frozen");

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));
      });

      it("Should not be able to transfer if destination account is frozen", async () => {
        const { wunder, governor, acc1, acc2 } = await loadFixture(deployFullWunder);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // freeze dst
        await wunder.connect(governor).freeze(dst.address);

        // confirm src is not frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;

        // confirm dst is frozen
        expect(await wunder.isFrozen(dst.address)).to.be.true;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // transfer 100 Wunder from src to dst
        await expect(wunder.connect(src).transfer(dst.address, wunderToEth("100")))
          .to
          .be
          .revertedWith("Wunder: Account is frozen");

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));
      });

      it("Should not be able to transfer if both source and destination accounts are frozen", async () => {
        const { wunder, governor, acc1, acc2 } = await loadFixture(deployFullWunder);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // freeze src
        await wunder.connect(governor).freeze(src.address);

        // freeze dst
        await wunder.connect(governor).freeze(dst.address);

        // confirm src is frozen
        expect(await wunder.isFrozen(src.address)).to.be.true;

        // confirm dst is frozen
        expect(await wunder.isFrozen(dst.address)).to.be.true;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // transfer 100 Wunder from src to dst
        await expect(wunder.connect(src).transfer(dst.address, wunderToEth("100")))
          .to
          .be
          .revertedWith("Wunder: Account is frozen");

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));
      });

      it("Should not be able to freeze an account if it is already frozen", async () => {
        const { wunder, governor, acc1 } = await loadFixture(deployFullWunder);

        // confirm acc1 isn't frozen
        expect(await wunder.isFrozen(acc1.address)).to.be.false;

        // freeze acc1
        await wunder.connect(governor).freeze(acc1.address);

        // confirm acc1 is frozen
        expect(await wunder.isFrozen(acc1.address)).to.be.true;

        // freeze acc1 again
        await expect(wunder.connect(governor).freeze(acc1.address))
          .to
          .be
          .revertedWith("Wunder: Account is frozen");

        // confirm acc1 is still frozen
        expect(await wunder.isFrozen(acc1.address)).to.be.true;
      });

      it("Should not be able to unfreeze an account if it is not frozen", async () => {
        const { wunder, governor, acc1 } = await loadFixture(deployFullWunder);

        // confirm acc1 isn't frozen
        expect(await wunder.isFrozen(acc1.address)).to.be.false;

        // unfreeze acc1
        await expect(wunder.connect(governor).unfreeze(acc1.address))
          .to
          .be
          .revertedWith("Wunder: Account is not frozen");

        // confirm acc1 is still not frozen
        expect(await wunder.isFrozen(acc1.address)).to.be.false;
      });

      it("Should not be able to mint to a frozen account", async () => {
        const { wunder, governor, minter, acc1 } = await loadFixture(deployFullWunder);

        // confirm acc1 isn't frozen
        expect(await wunder.isFrozen(acc1.address)).to.be.false;

        // freeze acc1
        await wunder.connect(governor).freeze(acc1.address);

        // confirm acc1 is frozen
        expect(await wunder.isFrozen(acc1.address)).to.be.true;

        // confirm acc1 has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));

        // mint 100 Wunder to acc1
        await expect(wunder.connect(minter).mint(acc1.address, wunderToEth("100")))
          .to
          .be
          .revertedWith("Wunder: Account is frozen");

        // confirm acc1 still has 1000 Wunder
        expect(await wunder.balanceOf(acc1.address)).to.equal(wunderToEth("1000"));
      });

      it("Should not be able to transfer to a frozen account using multiTransfer", async () => {
        const { wunder, governor, acc1, acc2, acc3 } = await loadFixture(deployFullWunder);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // freeze dst
        await wunder.connect(governor).freeze(dst.address);

        // confirm src is not frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;

        // confirm dst is frozen
        expect(await wunder.isFrozen(dst.address)).to.be.true;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // transfer 100 Wunder from src to dst
        await expect(wunder.connect(src)
          .multiTransfer([acc3.address, dst.address], [wunderToEth("100"), wunderToEth("100")]))
          .to
          .be
          .revertedWith("Wunder: Account is frozen");

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));
      });

      it("Should not be able to transfer from a frozen account using multiTransferFrom", async () => {
        const { wunder, governor, acc1, acc2, acc3 } = await loadFixture(deployFullWunder);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // freeze src
        await wunder.connect(governor).freeze(src.address);

        // confirm src is frozen
        expect(await wunder.isFrozen(src.address)).to.be.true;

        // confirm dst is not frozen
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        // transfer 100 Wunder from src to dst
        await expect(wunder.connect(src)
          .multiTransfer([acc3.address, dst.address], [wunderToEth("100"), wunderToEth("100")]))
          .to
          .be
          .revertedWith("Wunder: Account is frozen");

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));
      });

    });

    describe("Seizing", () => {

    });

    describe("Withdrawing", () => {

    });
  });

  describe("Transacting", () => {
    describe("Multitransfer", () => {

      // TODO: test multiTransfer with 0 addresses
      // TODO: test multiTransfer with 0 amounts
      // TODO: test multiTransfer with 0 addresses and 0 amounts
      // TODO: test multiTransfer with 1 address
      // TODO: test multiTransfer with 1 amount
      // TODO: test multiTransfer with mismatched addresses and amounts
      // TODO: test ERC20 allowance works with multiTransfer

      it("Should be able to transfer to multiple accounts", async () => {
        const { wunder, acc1, acc2, acc3 } = await loadFixture(deployFullWunder);

        const src = acc1;

        // confirm src and dst aren't frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;
        expect(await wunder.isFrozen(acc2.address)).to.be.false;
        expect(await wunder.isFrozen(acc3.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));
        // confirm acc2 has 1000 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1000"));
        // confirm acc3 has 1000 Wunder
        expect(await wunder.balanceOf(acc3.address)).to.equal(wunderToEth("1000"));

        // transfer 100 Wunder from src to acc2 and acc3 respectively
        await wunder.connect(src)
          .multiTransfer([acc2.address, acc3.address], [wunderToEth("100"), wunderToEth("100")]);

        // confirm src has 900 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("800"));

        // confirm acc2 has 1100 Wunder
        expect(await wunder.balanceOf(acc2.address)).to.equal(wunderToEth("1100"));

        // confirm acc3 has 1100 Wunder
        expect(await wunder.balanceOf(acc3.address)).to.equal(wunderToEth("1100"));
      });

      it("Should be able to transfer to the same account as destination account", async () => {
        const { wunder, acc1, acc2 } = await loadFixture(deployFullWunder);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        await wunder
          .connect(src)
          .multiTransfer([dst.address, dst.address], [wunderToEth("100"), wunderToEth("100")]);

        // confirm src has 800 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("800"));

        // confirm dst has 1200 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1200"));

      });

      it("Shouldn't be able to transfer to the same destination account if src funds run out after first transfer", async () => {
        const { wunder, acc1, acc2 } = await loadFixture(deployFullWunder);

        const src = acc1;
        const dst = acc2;

        // confirm src and dst aren't frozen
        expect(await wunder.isFrozen(src.address)).to.be.false;
        expect(await wunder.isFrozen(dst.address)).to.be.false;

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));

        await expect(wunder
          .connect(src)
          .multiTransfer([dst.address, dst.address], [wunderToEth("600"), wunderToEth("600")]))
          .to
          .be
          .revertedWith("ERC20: transfer amount exceeds balance");

        // confirm src has 1000 Wunder
        expect(await wunder.balanceOf(src.address)).to.equal(wunderToEth("1000"));

        // confirm dst has 1000 Wunder
        expect(await wunder.balanceOf(dst.address)).to.equal(wunderToEth("1000"));
      });

    });


  });

  describe("Pausing/Unpausing", () => {
    describe("Methods when paused", () => {

    });


    describe("Methods when unpaused", () => {

    });

  });

  describe("Interfaces", () => {
    it("Should implement IERC20", async () => {
      const { wunder } = await loadFixture(deployFullWunder);

      expect(await wunder.supportsInterface(INTERFACE_IDS.IERC20)).to.be.true;
    });

    it("Should implement IERC165", async () => {
      const { wunder } = await loadFixture(deployFullWunder);

      expect(await wunder.supportsInterface(INTERFACE_IDS.IERC165)).to.be.true;
    });

    it("Should implement IWunder", async () => {
      const { wunder } = await loadFixture(deployFullWunder);


      expect(await wunder.supportsInterface(INTERFACE_IDS.IWunder)).to.be.true;
    });

    it("Should implement IAccessControl", async () => {
      const { wunder } = await loadFixture(deployFullWunder);

      expect(await wunder.supportsInterface(INTERFACE_IDS.IAccessControl)).to.be.true;
    });



  });


  describe("GAS Usage", () => {

    it("Evaluate GAS costs for 10 transactions of different sizes between acc1, acc2 and acc3", async () => {
      const { wunder, owner, acc1, acc2, acc3 } = await loadFixture(deployFullWunder);

      // confirm acc1 and acc2 aren't frozen
      expect(await wunder.isFrozen(acc1.address)).to.be.false;
      expect(await wunder.isFrozen(acc2.address)).to.be.false;
      expect(await wunder.isFrozen(acc3.address)).to.be.false;
      for (let i = 0; i < 10; i++) {
        const amount = Math.floor(Math.random() * 1000);
        await wunder.connect(acc1).transfer(acc2.address, amount);
        await wunder.connect(acc2).transfer(acc3.address, amount);
        await wunder.connect(acc3).transfer(acc1.address, amount);
      }
    });

    it("Evaluate GAs cost for 10 multi transactions of different sizes between acc1, acc2 and acc3", async () => {
      const { wunder, owner, acc1, acc2, acc3 } = await loadFixture(deployFullWunder);

      // confirm acc1 and acc2 aren't frozen
      expect(await wunder.isFrozen(acc1.address)).to.be.false;
      expect(await wunder.isFrozen(acc2.address)).to.be.false;
      expect(await wunder.isFrozen(acc3.address)).to.be.false;


      let acc2Total = wunderToEth("1000");
      let acc3Total = wunderToEth("1000");
      for (let i = 0; i < 10; i++) {
        const acc2Amount = Math.floor(Math.random() * 10);
        const acc3Amount = Math.floor(Math.random() * 10);

        acc2Total = acc2Total.add(acc2Amount);
        acc3Total = acc3Total.add(acc3Amount);


        await wunder.connect(acc1).multiTransfer(
          [acc2.address, acc3.address],
          [acc2Amount, acc3Amount]
        );
      }

      expect(await wunder.balanceOf(acc2.address)).to.equal(acc2Total);
      expect(await wunder.balanceOf(acc3.address)).to.equal(acc3Total);

    });
  });
});
