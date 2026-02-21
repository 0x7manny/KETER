// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {KeterToken} from "../src/KeterToken.sol";
import {Registry} from "../src/Registry.sol";
import {UltraVerifier} from "../src/UltraVerifier.sol";

contract KeterTokenZKTest is Test {
    // Events (redeclared for expectEmit)
    event ComplianceTransfer(address indexed from, address indexed to, uint256 amount, bytes32 proofHash, bytes32 indexed partition);
    event ProofVerified(address indexed sender, bytes32 merkleRoot, bytes32 nullifier, uint256 timestamp);

    KeterToken public token;
    Registry public registry;
    UltraVerifier public verifier;

    address public issuer;
    address public investor1;
    address public investor2;

    bytes32 constant DEFAULT_PARTITION = bytes32(0);
    bytes32 INVESTORS;

    bytes32 MERKLE_ROOT;

    function setUp() public {
        issuer = address(this);
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");

        INVESTORS = bytes32("investors");
        MERKLE_ROOT = keccak256("keter_merkle_root_v1");

        registry = new Registry();
        verifier = new UltraVerifier(); // Mock — always returns true

        address[] memory controllers = new address[](0);
        bytes32[] memory defaultParts = new bytes32[](2);
        defaultParts[0] = DEFAULT_PARTITION;
        defaultParts[1] = INVESTORS;

        token = new KeterToken(
            "Keter Security Token", "KETER",
            address(registry), address(verifier),
            controllers, defaultParts
        );

        // Setup: root + tokens
        registry.setMerkleRoot(MERKLE_ROOT);
        token.issue(investor1, 10000, "");
        token.issueByPartition(INVESTORS, investor1, 5000, "");
    }

    // ═══════════════════════════════════════════════════════════════
    //  transferWithProof
    // ═══════════════════════════════════════════════════════════════

    function test_TransferWithProof_Success() public {
        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = MERKLE_ROOT;

        vm.prank(investor1);
        token.transferWithProof(investor2, 2000, hex"1234", pubInputs);

        assertEq(token.balanceOf(investor2), 2000);
    }

    function test_TransferWithProof_EmitsComplianceTransfer() public {
        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = MERKLE_ROOT;

        vm.expectEmit(true, true, true, true);
        emit ComplianceTransfer(
            investor1, investor2, 2000,
            keccak256(hex"1234"),
            DEFAULT_PARTITION
        );

        vm.prank(investor1);
        token.transferWithProof(investor2, 2000, hex"1234", pubInputs);
    }

    function test_TransferWithProof_EmitsProofVerified() public {
        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = MERKLE_ROOT;

        vm.expectEmit(true, false, false, false);
        emit ProofVerified(investor1, MERKLE_ROOT, bytes32(0), block.timestamp);

        vm.prank(investor1);
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);
    }

    function test_RevertWhen_RootMismatch() public {
        bytes32 wrongRoot = keccak256("wrong");
        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = wrongRoot;

        vm.prank(investor1);
        vm.expectRevert("KT: root mismatch");
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);
    }

    function test_RevertWhen_EmptyPublicInputs() public {
        bytes32[] memory pubInputs = new bytes32[](0);

        vm.prank(investor1);
        vm.expectRevert("KT: missing public inputs");
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);
    }

    // ═══════════════════════════════════════════════════════════════
    //  transferByPartitionWithProof
    // ═══════════════════════════════════════════════════════════════

    function test_TransferByPartitionWithProof() public {
        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = MERKLE_ROOT;

        vm.prank(investor1);
        token.transferByPartitionWithProof(INVESTORS, investor2, 3000, hex"abcd", pubInputs);

        assertEq(token.balanceOfByPartition(INVESTORS, investor1), 2000);
        assertEq(token.balanceOfByPartition(INVESTORS, investor2), 3000);
    }

    function test_RevertWhen_PartitionBalanceInsufficient() public {
        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = MERKLE_ROOT;

        vm.prank(investor1);
        vm.expectRevert("KT: insufficient partition balance");
        token.transferByPartitionWithProof(INVESTORS, investor2, 99999, hex"abcd", pubInputs);
    }

    // ═══════════════════════════════════════════════════════════════
    //  NULLIFIERS (anti-replay)
    // ═══════════════════════════════════════════════════════════════

    function test_Nullifier_AcceptsFirstUse() public {
        bytes32 nullifier = keccak256("unique_nullifier_1");
        bytes32[] memory pubInputs = new bytes32[](2);
        pubInputs[0] = MERKLE_ROOT;
        pubInputs[1] = nullifier;

        vm.prank(investor1);
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);

        assertTrue(token.usedNullifiers(nullifier));
        assertEq(token.balanceOf(investor2), 1000);
    }

    function test_Nullifier_RejectsReplay() public {
        bytes32 nullifier = keccak256("unique_nullifier_2");
        bytes32[] memory pubInputs = new bytes32[](2);
        pubInputs[0] = MERKLE_ROOT;
        pubInputs[1] = nullifier;

        vm.prank(investor1);
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);

        vm.prank(investor1);
        vm.expectRevert("KT: proof already used");
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);
    }

    function test_Nullifier_DifferentNullifiersWork() public {
        bytes32 null1 = keccak256("nullifier_A");
        bytes32 null2 = keccak256("nullifier_B");

        bytes32[] memory pub1 = new bytes32[](2);
        pub1[0] = MERKLE_ROOT;
        pub1[1] = null1;

        bytes32[] memory pub2 = new bytes32[](2);
        pub2[0] = MERKLE_ROOT;
        pub2[1] = null2;

        vm.prank(investor1);
        token.transferWithProof(investor2, 1000, hex"1234", pub1);

        vm.prank(investor1);
        token.transferWithProof(investor2, 1000, hex"5678", pub2);

        assertEq(token.balanceOf(investor2), 2000);
    }

    // ═══════════════════════════════════════════════════════════════
    //  DUAL PROOF
    // ═══════════════════════════════════════════════════════════════

    function test_DualProof_Success() public {
        bytes32[] memory senderPub = new bytes32[](1);
        senderPub[0] = MERKLE_ROOT;

        bytes32[] memory receiverPub = new bytes32[](1);
        receiverPub[0] = MERKLE_ROOT;

        vm.prank(investor1);
        token.transferWithDualProof(
            investor2, 2000,
            hex"aaaa", senderPub,
            hex"bbbb", receiverPub
        );

        assertEq(token.balanceOf(investor2), 2000);
    }

    function test_RevertWhen_DualProof_SenderRootMismatch() public {
        bytes32 wrongRoot = keccak256("wrong");
        bytes32[] memory senderPub = new bytes32[](1);
        senderPub[0] = wrongRoot;
        bytes32[] memory receiverPub = new bytes32[](1);
        receiverPub[0] = MERKLE_ROOT;

        vm.prank(investor1);
        vm.expectRevert("KT: root mismatch");
        token.transferWithDualProof(investor2, 1000, hex"aa", senderPub, hex"bb", receiverPub);
    }

    function test_RevertWhen_DualProof_ReceiverRootMismatch() public {
        bytes32 wrongRoot = keccak256("wrong");
        bytes32[] memory senderPub = new bytes32[](1);
        senderPub[0] = MERKLE_ROOT;
        bytes32[] memory receiverPub = new bytes32[](1);
        receiverPub[0] = wrongRoot;

        vm.prank(investor1);
        vm.expectRevert("KT: root mismatch");
        token.transferWithDualProof(investor2, 1000, hex"aa", senderPub, hex"bb", receiverPub);
    }

    function test_DualProofByPartition() public {
        bytes32[] memory senderPub = new bytes32[](1);
        senderPub[0] = MERKLE_ROOT;
        bytes32[] memory receiverPub = new bytes32[](1);
        receiverPub[0] = MERKLE_ROOT;

        vm.prank(investor1);
        token.transferByPartitionWithDualProof(
            INVESTORS, investor2, 4000,
            hex"aaaa", senderPub,
            hex"bbbb", receiverPub
        );

        assertEq(token.balanceOfByPartition(INVESTORS, investor1), 1000);
        assertEq(token.balanceOfByPartition(INVESTORS, investor2), 4000);
    }

    // ═══════════════════════════════════════════════════════════════
    //  ROOT UPDATE INVALIDATES OLD PROOFS
    // ═══════════════════════════════════════════════════════════════

    function test_StaleRoot_Rejected() public {
        bytes32 oldRoot = MERKLE_ROOT;
        bytes32 newRoot = keccak256("new_merkle_root");
        registry.setMerkleRoot(newRoot);

        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = oldRoot;

        vm.prank(investor1);
        vm.expectRevert("KT: root mismatch");
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);
    }

    function test_NewRoot_Accepted() public {
        bytes32 newRoot = keccak256("new_merkle_root");
        registry.setMerkleRoot(newRoot);

        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = newRoot;

        vm.prank(investor1);
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);

        assertEq(token.balanceOf(investor2), 1000);
    }

    // ═══════════════════════════════════════════════════════════════
    //  PAUSE BLOCKS ZK TRANSFERS
    // ═══════════════════════════════════════════════════════════════

    function test_Pause_BlocksZKTransfer() public {
        token.pause();

        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = MERKLE_ROOT;

        vm.prank(investor1);
        vm.expectRevert("KT: paused");
        token.transferWithProof(investor2, 1000, hex"1234", pubInputs);
    }

    function test_Pause_BlocksZKPartitionTransfer() public {
        token.pause();

        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = MERKLE_ROOT;

        vm.prank(investor1);
        vm.expectRevert("KT: paused");
        token.transferByPartitionWithProof(INVESTORS, investor2, 1000, hex"1234", pubInputs);
    }

    // ═══════════════════════════════════════════════════════════════
    //  FUZZ TESTS
    // ═══════════════════════════════════════════════════════════════

    function testFuzz_TransferWithProof_AnyAmount(uint256 amount) public {
        amount = bound(amount, 1, 10000); // investor1 has 10000 in DEFAULT

        bytes32[] memory pubInputs = new bytes32[](1);
        pubInputs[0] = MERKLE_ROOT;

        vm.prank(investor1);
        token.transferWithProof(investor2, amount, hex"1234", pubInputs);

        assertEq(token.balanceOf(investor2), amount);
    }

    function testFuzz_Nullifier_UniquePerTransfer(bytes32 null1, bytes32 null2) public {
        vm.assume(null1 != null2);

        bytes32[] memory pub1 = new bytes32[](2);
        pub1[0] = MERKLE_ROOT;
        pub1[1] = null1;

        bytes32[] memory pub2 = new bytes32[](2);
        pub2[0] = MERKLE_ROOT;
        pub2[1] = null2;

        vm.prank(investor1);
        token.transferWithProof(investor2, 100, hex"aa", pub1);

        vm.prank(investor1);
        token.transferWithProof(investor2, 100, hex"bb", pub2);

        assertEq(token.balanceOf(investor2), 200);
    }
}
