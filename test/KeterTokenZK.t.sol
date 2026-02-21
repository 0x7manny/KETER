// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import {KeterToken} from "../src/KeterToken.sol";
import {Registry} from "../src/Registry.sol";
import {HonkVerifier as UltraVerifier} from "../src/UltraVerifier.sol";

contract KeterTokenZKTest is Test {
    event ComplianceTransfer(address indexed from, address indexed to, uint256 amount, bytes32 proofHash, bytes32 indexed partition);
    event ProofVerified(address indexed sender, bytes32 merkleRoot, bytes32 nullifier, uint256 timestamp);

    KeterToken public token;
    Registry public registry;
    UltraVerifier public verifier;

    address constant SENDER = 0x6d5e982A63B9E4055B7b7CfBAC25ba908061e1A5;
    address constant RECIPIENT = 0x0000000000000000000000000000000000abcDeF;
    bytes32 constant MERKLE_ROOT = 0x05de0db30e5b12d705199ed6ea191ef7d3108e89529deb364f5bbfe3859ec730;
    bytes32 constant NULLIFIER_1 = 0x1a7f6c7ffcf90645d011edafab9f7b17be2c3b3f6195c9819dceacde25e37434;
    bytes32 constant NULLIFIER_2 = 0x0f8af2bfcf55571721665ba2dd29d70fe43e10d77926d60c303a545c27199216;
    uint256 constant AMOUNT = 500000;

    bytes32 constant DEFAULT_PARTITION = bytes32(0);
    bytes32 INVESTORS;

    bytes proof1;
    bytes proof2;

    function setUp() public {
        INVESTORS = bytes32("investors");
        registry = new Registry();
        verifier = new UltraVerifier();

        address[] memory controllers = new address[](0);
        bytes32[] memory defaultParts = new bytes32[](2);
        defaultParts[0] = DEFAULT_PARTITION;
        defaultParts[1] = INVESTORS;

        token = new KeterToken(
            "Keter Security Token", "KETER",
            address(registry), address(verifier),
            controllers, defaultParts
        );

        registry.setMerkleRoot(MERKLE_ROOT);
        token.issue(SENDER, 5_000_000, "");
        token.issueByPartition(INVESTORS, SENDER, 2_000_000, "");

        proof1 = vm.readFileBinary("circuit/test/fixtures/proof1");
        proof2 = vm.readFileBinary("circuit/test/fixtures/proof2");
    }

    function _pub(bytes32 _nullifier) internal pure returns (bytes32[] memory) {
        bytes32[] memory p = new bytes32[](5);
        p[0] = MERKLE_ROOT;
        p[1] = _nullifier;
        p[2] = bytes32(uint256(uint160(RECIPIENT)));
        p[3] = bytes32(uint256(uint160(SENDER)));
        p[4] = bytes32(AMOUNT);
        return p;
    }

    // ── SUCCESS ──

    function test_TransferWithProof_RealProof() public {
        vm.prank(SENDER);
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));
        assertEq(token.balanceOf(RECIPIENT), AMOUNT);
        assertEq(token.balanceOf(SENDER), 7_000_000 - AMOUNT);
        assertTrue(token.usedNullifiers(NULLIFIER_1));
    }

    function test_TransferWithProof_EmitsComplianceTransfer() public {
        vm.expectEmit(true, true, true, true);
        emit ComplianceTransfer(SENDER, RECIPIENT, AMOUNT, keccak256(proof1), DEFAULT_PARTITION);
        vm.prank(SENDER);
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));
    }

    function test_TransferWithProof_EmitsProofVerified() public {
        vm.expectEmit(true, false, false, false);
        emit ProofVerified(SENDER, MERKLE_ROOT, NULLIFIER_1, block.timestamp);
        vm.prank(SENDER);
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));
    }

    function test_TransferByPartitionWithProof_RealProof() public {
        vm.prank(SENDER);
        token.transferByPartitionWithProof(INVESTORS, RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));
        assertEq(token.balanceOfByPartition(INVESTORS, RECIPIENT), AMOUNT);
        assertEq(token.balanceOfByPartition(INVESTORS, SENDER), 2_000_000 - AMOUNT);
    }

    // ── NULLIFIERS ──

    function test_Nullifier_AcceptsFirstUse() public {
        vm.prank(SENDER);
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));
        assertTrue(token.usedNullifiers(NULLIFIER_1));
    }

    function test_Nullifier_RejectsReplay() public {
        bytes32[] memory pub = _pub(NULLIFIER_1);
        vm.prank(SENDER);
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, pub);

        vm.prank(SENDER);
        vm.expectRevert("KT: proof already used");
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, pub);
    }

    function test_TwoProofs_DifferentNullifiers() public {
        vm.prank(SENDER);
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));

        vm.prank(SENDER);
        token.transferWithProof(RECIPIENT, AMOUNT, proof2, _pub(NULLIFIER_2));

        assertEq(token.balanceOf(RECIPIENT), AMOUNT * 2);
        assertTrue(token.usedNullifiers(NULLIFIER_1));
        assertTrue(token.usedNullifiers(NULLIFIER_2));
    }

    // ── PRE-VERIFIER REVERTS ──

    function test_RevertWhen_RootMismatch() public {
        bytes32[] memory pub = _pub(NULLIFIER_1);
        pub[0] = keccak256("wrong_root");
        vm.prank(SENDER);
        vm.expectRevert("KT: root mismatch");
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, pub);
    }

    function test_RevertWhen_WrongInputCount() public {
        bytes32[] memory pub = new bytes32[](1);
        pub[0] = MERKLE_ROOT;
        vm.prank(SENDER);
        vm.expectRevert("KT: need 5 public inputs");
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, pub);
    }

    function test_RevertWhen_SenderMismatch() public {
        bytes32[] memory pub = _pub(NULLIFIER_1);
        address fakeSender = makeAddr("fake");
        token.issue(fakeSender, 1_000_000, "");
        vm.prank(fakeSender);
        vm.expectRevert("KT: sender mismatch");
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, pub);
    }

    function test_RevertWhen_RecipientMismatch() public {
        bytes32[] memory pub = _pub(NULLIFIER_1);
        address wrongRecipient = makeAddr("wrong");
        vm.prank(SENDER);
        vm.expectRevert("KT: recipient mismatch");
        token.transferWithProof(wrongRecipient, AMOUNT, proof1, pub);
    }

    function test_RevertWhen_AmountMismatch() public {
        bytes32[] memory pub = _pub(NULLIFIER_1);
        vm.prank(SENDER);
        vm.expectRevert("KT: amount mismatch");
        token.transferWithProof(RECIPIENT, AMOUNT - 1, proof1, pub);
    }

    function test_StaleRoot_Rejected() public {
        registry.setMerkleRoot(keccak256("new_root"));
        vm.prank(SENDER);
        vm.expectRevert("KT: root mismatch");
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));
    }

    // ── PAUSE ──

    function test_Pause_BlocksZKTransfer() public {
        token.pause();
        vm.prank(SENDER);
        vm.expectRevert("KT: paused");
        token.transferWithProof(RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));
    }

    function test_Pause_BlocksZKPartitionTransfer() public {
        token.pause();
        vm.prank(SENDER);
        vm.expectRevert("KT: paused");
        token.transferByPartitionWithProof(INVESTORS, RECIPIENT, AMOUNT, proof1, _pub(NULLIFIER_1));
    }

    // ── VERIFIER REJECTS BAD PROOFS ──

    function test_RevertWhen_InvalidProofBytes() public {
        bytes memory fakeProof = new bytes(8256);
        vm.prank(SENDER);
        vm.expectRevert();
        token.transferWithProof(RECIPIENT, AMOUNT, fakeProof, _pub(NULLIFIER_1));
    }

    function test_RevertWhen_TamperedProof() public {
        bytes memory tampered = new bytes(proof1.length);
        for (uint256 i = 0; i < proof1.length; i++) {
            tampered[i] = proof1[i];
        }
        tampered[500] = bytes1(uint8(tampered[500]) ^ 0xFF);
        vm.prank(SENDER);
        vm.expectRevert();
        token.transferWithProof(RECIPIENT, AMOUNT, tampered, _pub(NULLIFIER_1));
    }
}
