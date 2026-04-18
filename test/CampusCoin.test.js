/**
 * CampusCoin Test Suite
 * ─────────────────────
 * Run: npx hardhat test
 *
 * Tests every smart contract function:
 *   - registerParticipant
 *   - mintTokens (including duplicate prevention)
 *   - transferTokens
 *   - redeemTokens
 *   - Role-based access control
 *   - Edge cases & revert conditions
 */

const { expect }        = require("chai");
const { ethers }        = require("hardhat");
const { loadFixture }   = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// ── Fixture: Deploy fresh contract ──────────────────────────────────────────
async function deployCampusCoinFixture() {
  const [admin, organizer, student1, student2, student3, stranger] =
    await ethers.getSigners();

  const CampusCoin = await ethers.getContractFactory("CampusCoin");
  const contract   = await CampusCoin.deploy();

  return { contract, admin, organizer, student1, student2, student3, stranger };
}

// ── Helper fixture: already has organizer + 2 students registered ────────────
async function populatedFixture() {
  const base = await deployCampusCoinFixture();
  const { contract, admin, organizer, student1, student2 } = base;

  await contract.registerParticipant(organizer.address, "Events Club", 2);
  await contract.registerParticipant(student1.address,  "Arjun Sharma", 1);
  await contract.registerParticipant(student2.address,  "Priya Patel",  1);

  return base;
}

// ════════════════════════════════════════════════════════════════════════════
describe("CampusCoin", function () {

  // ── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      const { contract, admin } = await loadFixture(deployCampusCoinFixture);
      expect(await contract.admin()).to.equal(admin.address);
    });

    it("Should register deployer as ADMIN participant", async function () {
      const { contract, admin } = await loadFixture(deployCampusCoinFixture);
      const p = await contract.getParticipant(admin.address);
      expect(p.registered).to.be.true;
      expect(p.role).to.equal(3); // Role.ADMIN = 3
      expect(p.pName).to.equal("Campus Admin");
    });

    it("Should seed 8 perks in the catalog", async function () {
      const { contract } = await loadFixture(deployCampusCoinFixture);
      const perkIds = await contract.getAllPerkIds();
      expect(perkIds.length).to.equal(8);
    });

    it("Should have zero minted tokens at start", async function () {
      const { contract } = await loadFixture(deployCampusCoinFixture);
      expect(await contract.totalMinted()).to.equal(0);
    });
  });

  // ── Registration ──────────────────────────────────────────────────────────
  describe("registerParticipant", function () {
    it("Admin can register a student", async function () {
      const { contract, student1 } = await loadFixture(deployCampusCoinFixture);
      await expect(contract.registerParticipant(student1.address, "Arjun", 1))
        .to.emit(contract, "ParticipantRegistered")
        .withArgs(student1.address, "Arjun", 1, await getTimestamp());

      const p = await contract.getParticipant(student1.address);
      expect(p.registered).to.be.true;
      expect(p.role).to.equal(1); // STUDENT
    });

    it("Admin can register an organizer", async function () {
      const { contract, organizer } = await loadFixture(deployCampusCoinFixture);
      await contract.registerParticipant(organizer.address, "Events Club", 2);
      const p = await contract.getParticipant(organizer.address);
      expect(p.role).to.equal(2); // ORGANIZER
    });

    it("Organizer can register new students", async function () {
      const { contract, organizer, student1, student2 } = await loadFixture(deployCampusCoinFixture);
      await contract.registerParticipant(organizer.address, "Events Club", 2);
      // Now organizer registers student1
      await contract.connect(organizer).registerParticipant(student1.address, "Priya", 1);
      const p = await contract.getParticipant(student1.address);
      expect(p.registered).to.be.true;
    });

    it("Stranger cannot register anyone", async function () {
      const { contract, stranger, student1 } = await loadFixture(deployCampusCoinFixture);
      await expect(
        contract.connect(stranger).registerParticipant(student1.address, "Test", 1)
      ).to.be.revertedWith("CC: caller is not organizer or admin");
    });

    it("Cannot register same address twice", async function () {
      const { contract, student1 } = await loadFixture(deployCampusCoinFixture);
      await contract.registerParticipant(student1.address, "Arjun", 1);
      await expect(
        contract.registerParticipant(student1.address, "Arjun Again", 1)
      ).to.be.revertedWith("CC: already registered");
    });

    it("Cannot register with empty name", async function () {
      const { contract, student1 } = await loadFixture(deployCampusCoinFixture);
      await expect(
        contract.registerParticipant(student1.address, "", 1)
      ).to.be.revertedWith("CC: name required");
    });

    it("Cannot register with zero address", async function () {
      const { contract } = await loadFixture(deployCampusCoinFixture);
      await expect(
        contract.registerParticipant(ethers.ZeroAddress, "Test", 1)
      ).to.be.revertedWith("CC: zero address");
    });

    it("Participan count increments correctly", async function () {
      const { contract, student1, student2 } = await loadFixture(deployCampusCoinFixture);
      expect(await contract.participantCount()).to.equal(1); // admin
      await contract.registerParticipant(student1.address, "A", 1);
      await contract.registerParticipant(student2.address, "B", 1);
      expect(await contract.participantCount()).to.equal(3);
    });
  });

  // ── Minting ───────────────────────────────────────────────────────────────
  describe("mintTokens", function () {
    it("Organizer can mint tokens for a student", async function () {
      const { contract, organizer, student1 } = await loadFixture(populatedFixture);
      await expect(
        contract.connect(organizer).mintTokens(student1.address, 50, "EVT001", "Tech Fest")
      ).to.emit(contract, "TokensMinted")
        .withArgs(organizer.address, student1.address, 50, "EVT001", "Tech Fest", await getTimestamp());

      expect(await contract.getBalance(student1.address)).to.equal(50);
    });

    it("Admin can mint tokens directly", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 100, "CLB001", "Club Founding");
      expect(await contract.getBalance(student1.address)).to.equal(100);
    });

    it("totalMinted increases correctly", async function () {
      const { contract, student1, student2 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 50, "EVT001", "Event A");
      await contract.mintTokens(student2.address, 75, "EVT002", "Event B");
      expect(await contract.totalMinted()).to.equal(125);
    });

    it("DUPLICATE PREVENTION: cannot reward same student for same activity twice", async function () {
      const { contract, organizer, student1 } = await loadFixture(populatedFixture);
      await contract.connect(organizer).mintTokens(student1.address, 50, "EVT001", "Tech Fest");
      await expect(
        contract.connect(organizer).mintTokens(student1.address, 50, "EVT001", "Tech Fest Again")
      ).to.be.revertedWith("CC: student already rewarded for this activity");
    });

    it("Same activity can reward DIFFERENT students", async function () {
      const { contract, student1, student2 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 50, "EVT001", "Tech Fest");
      await contract.mintTokens(student2.address, 50, "EVT001", "Tech Fest"); // same activityId, different student
      expect(await contract.getBalance(student1.address)).to.equal(50);
      expect(await contract.getBalance(student2.address)).to.equal(50);
    });

    it("Cannot mint for non-existent student", async function () {
      const { contract, stranger } = await loadFixture(populatedFixture);
      await expect(
        contract.mintTokens(stranger.address, 50, "EVT001", "Test")
      ).to.be.revertedWith("CC: student not registered");
    });

    it("Cannot mint with zero amount", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await expect(
        contract.mintTokens(student1.address, 0, "EVT001", "Test")
      ).to.be.revertedWith("CC: amount must be positive");
    });

    it("Cannot mint tokens to an organizer", async function () {
      const { contract, organizer } = await loadFixture(populatedFixture);
      await expect(
        contract.mintTokens(organizer.address, 50, "EVT001", "Test")
      ).to.be.revertedWith("CC: recipient must be a student");
    });

    it("Unregistered stranger cannot mint", async function () {
      const { contract, stranger, student1 } = await loadFixture(populatedFixture);
      await expect(
        contract.connect(stranger).mintTokens(student1.address, 50, "EVT001", "Test")
      ).to.be.revertedWith("CC: caller is not organizer or admin");
    });

    it("Activity log records correctly", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 50, "EVT001", "Tech Fest");
      expect(await contract.getActivityLogLength()).to.equal(1);
      const record = await contract.getActivityAt(0);
      expect(record.student).to.equal(student1.address);
      expect(record.amount).to.equal(50);
      expect(record.activityId).to.equal("EVT001");
    });
  });

  // ── Transfers ─────────────────────────────────────────────────────────────
  describe("transferTokens", function () {
    it("Student can transfer tokens to another student", async function () {
      const { contract, student1, student2 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 100, "EVT001", "Event");

      await expect(
        contract.connect(student1).transferTokens(student2.address, 30)
      ).to.emit(contract, "TokensTransferred")
        .withArgs(student1.address, student2.address, 30, await getTimestamp());

      expect(await contract.getBalance(student1.address)).to.equal(70);
      expect(await contract.getBalance(student2.address)).to.equal(30);
    });

    it("Reverts on insufficient balance", async function () {
      const { contract, student1, student2 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 20, "EVT001", "Event");
      await expect(
        contract.connect(student1).transferTokens(student2.address, 50)
      ).to.be.revertedWith("CC: insufficient balance");
    });

    it("Cannot transfer to self", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 50, "EVT001", "Event");
      await expect(
        contract.connect(student1).transferTokens(student1.address, 10)
      ).to.be.revertedWith("CC: cannot transfer to self");
    });

    it("Cannot transfer to unregistered address", async function () {
      const { contract, student1, stranger } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 50, "EVT001", "Event");
      await expect(
        contract.connect(student1).transferTokens(stranger.address, 10)
      ).to.be.revertedWith("CC: recipient not registered");
    });

    it("Unregistered address cannot call transfer", async function () {
      const { contract, stranger, student1 } = await loadFixture(populatedFixture);
      await expect(
        contract.connect(stranger).transferTokens(student1.address, 10)
      ).to.be.revertedWith("CC: caller not registered");
    });
  });

  // ── Redemption ────────────────────────────────────────────────────────────
  describe("redeemTokens", function () {
    it("Student can redeem a perk with sufficient balance", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 100, "EVT001", "Event");

      await expect(
        contract.connect(student1).redeemTokens("PERK002") // costs 50 CC
      ).to.emit(contract, "TokensRedeemed")
        .withArgs(student1.address, "PERK002", "Canteen Credit", 50, await getTimestamp());

      expect(await contract.getBalance(student1.address)).to.equal(50);
    });

    it("Perk stock decrements after redemption", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 100, "EVT001", "Event");
      const before = (await contract.getPerk("PERK002")).stock;
      await contract.connect(student1).redeemTokens("PERK002");
      const after = (await contract.getPerk("PERK002")).stock;
      expect(after).to.equal(before - 1n);
    });

    it("Reverts on insufficient balance for redemption", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 10, "EVT001", "Event");
      await expect(
        contract.connect(student1).redeemTokens("PERK001") // costs 100 CC
      ).to.be.revertedWith("CC: insufficient balance");
    });

    it("Reverts for non-existent perk", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 200, "EVT001", "Event");
      await expect(
        contract.connect(student1).redeemTokens("FAKE999")
      ).to.be.revertedWith("CC: perk not found or inactive");
    });

    it("Organizer cannot redeem (only students)", async function () {
      const { contract, organizer } = await loadFixture(populatedFixture);
      await expect(
        contract.connect(organizer).redeemTokens("PERK002")
      ).to.be.revertedWith("CC: only students can redeem");
    });

    it("totalRedeemedCount increments", async function () {
      const { contract, student1, student2 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 200, "EVT001", "Event A");
      await contract.mintTokens(student2.address, 200, "EVT002", "Event B");
      await contract.connect(student1).redeemTokens("PERK002");
      await contract.connect(student2).redeemTokens("PERK002");
      expect(await contract.totalRedeemedCount()).to.equal(2);
    });
  });

  // ── Admin Functions ───────────────────────────────────────────────────────
  describe("Admin Functions", function () {
    it("Admin can add a new perk", async function () {
      const { contract } = await loadFixture(deployCampusCoinFixture);
      await expect(
        contract.addPerk("CUSTOM01", "Custom Perk", "Special perk", "star", 200, 10)
      ).to.emit(contract, "PerkAdded")
        .withArgs("CUSTOM01", "Custom Perk", 200, 10);

      const perk = await contract.getPerk("CUSTOM01");
      expect(perk.pName).to.equal("Custom Perk");
      expect(perk.cost).to.equal(200);
    });

    it("Admin can restock a perk", async function () {
      const { contract } = await loadFixture(deployCampusCoinFixture);
      await contract.restockPerk("PERK001", 50);
      const perk = await contract.getPerk("PERK001");
      expect(perk.stock).to.equal(100); // was 50, now 100
    });

    it("Non-admin cannot add perks", async function () {
      const { contract, stranger } = await loadFixture(deployCampusCoinFixture);
      await expect(
        contract.connect(stranger).addPerk("BAD01", "Bad", "Bad desc", "x", 10, 10)
      ).to.be.revertedWith("CC: caller is not admin");
    });
  });

  // ── Stats & Views ─────────────────────────────────────────────────────────
  describe("View Functions", function () {
    it("getStats returns correct summary", async function () {
      const { contract, student1, student2 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 50, "EVT001", "A");
      await contract.mintTokens(student2.address, 75, "EVT002", "B");
      await contract.connect(student1).redeemTokens("PERK006"); // 40 CC

      const stats = await contract.getStats();
      expect(stats[0]).to.equal(125);  // totalMinted
      expect(stats[1]).to.equal(1);    // totalRedeemed
      expect(stats[3]).to.equal(2);    // studentCount
    });

    it("isActivityRewarded returns true after minting", async function () {
      const { contract, student1 } = await loadFixture(populatedFixture);
      await contract.mintTokens(student1.address, 50, "EVT001", "Test");
      expect(
        await contract.isActivityRewarded(student1.address, "EVT001")
      ).to.be.true;
      expect(
        await contract.isActivityRewarded(student1.address, "EVT999")
      ).to.be.false;
    });
  });

});

// Helper: approximate block timestamp
async function getTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}