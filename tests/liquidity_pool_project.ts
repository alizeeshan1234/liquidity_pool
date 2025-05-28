import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LiquidityPoolProject } from "../target/types/liquidity_pool_project";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import bs58 from "bs58";

describe("liquidity_pool_project", () => {
  let provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.liquidityPoolProject as Program<LiquidityPoolProject>;

  let mintA: PublicKey;
  let mintB: PublicKey;
  let lpTokenMint: PublicKey;
  let poolConfigAccount: PublicKey;
  let vaultTokenA: PublicKey;
  let vaultTokenB: PublicKey;
  let creatorTokenAccount: PublicKey;
  let lpMintAuthority: PublicKey;
  let poolAuthority: PublicKey;

  before(async () => {
    mintA = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      1
    );

    mintB = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      1
    );


    [poolConfigAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("poolconfig"), mintA.toBuffer(), mintB.toBuffer()],
      program.programId
    );

    let vaultTokenAata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      mintA,
      poolConfigAccount,
      true,
    );

    vaultTokenA = vaultTokenAata.address;

    let vaultTokenBata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      mintB,
      poolConfigAccount,
      true,
    );

    vaultTokenB = vaultTokenBata.address;


    [poolAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_authority"), poolConfigAccount.toBuffer()],
      program.programId,
    );

    [lpMintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp_mint")],
      program.programId
    );

    lpTokenMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      lpMintAuthority,
      null,
      1
    );

    let creatorTokenAccountATA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      lpTokenMint,
      provider.wallet.publicKey,
      true,
    );

    creatorTokenAccount = creatorTokenAccountATA.address;


  })

  it("Initialize liquidity pool", async () => {
    const fees = 0.5;
    const tx = await program.methods.initializeLiquidityPool(fees).accounts({
      creator: provider.wallet.publicKey,
      mintA,
      mintB,
      lpMint: lpTokenMint,
      poolConfigAccount,
      vaultTokenA,
      vaultTokenB,
      creatorTokenAccount,
      lpMintAuth: lpMintAuthority,
      poolAuthority,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId
    }).signers([provider.wallet.payer]).rpc();

    console.log(`Transaction Signature: ${tx}`);
  });

  it("BTC/USDC price feeds", async () => {
  // BTC/USD price account on devnet (example - verify the actual address)

  const btcPriceAccount = new PublicKey("0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43");

  const tx = await program.methods
  .getPrice(new PublicKey("9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96rjdp8")) 
  .accounts({
    user: provider.wallet.publicKey,
    priceUpdate: btcPriceAccount, 
  })
  .rpc();

  console.log(`Transaction Signature: ${tx}`);

  });

});
