import {
  Keypair,
  Connection,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';

import {
  createMetadata,
  Creator,
  Data,
} from './mx/metadata'

import {
  createMint,
  createAssociatedTokenAccountInstruction
} from './mx/account'

import {
  sendTransactionWithRetry,
  sendTransactionsWithManualRetry
} from './mx/contexts/connection'

import {
  programIds,
  findProgramAddress,
} from './mx/utils'
import { MintLayout, Token } from '@solana/spl-token';

export default async function mintNFT (
  connection: Connection,
  wallet: any,
  data: any,
  num: number,
){
  const TOKEN_PROGRAM_ID = programIds().token
  let creator = new Creator({address: wallet.publicKey.toBase58(), verified: true, share: 100})
  const payerPublicKey = wallet.publicKey;
  const instructions: Array<TransactionInstruction[]> = [];
  const signers: Array<Keypair[]> = [];

  for(let i = 0; i < num; i ++) {
    const decomSigners: Keypair[] = [];
    const decomInstructions: TransactionInstruction[] = [];
    const mintRent = await connection.getMinimumBalanceForRentExemption( MintLayout.span );
    // This is only temporarily owned by wallet...transferred to program by createMasterEdition below
    const mintKey = createMint(
      decomInstructions,
      payerPublicKey!,
      mintRent,
      0, // token decimal
      // Some weird bug with phantom where it's public key doesnt mesh with data encode wellff
      payerPublicKey!,
      payerPublicKey!,
      decomSigners,
    );
    const recipientKey: any = (
      await findProgramAddress(
        [
          payerPublicKey!.toBuffer(),
          programIds().token.toBuffer(),
          mintKey.toBuffer(),
        ],
        programIds().associatedToken,
      )
    )[0];
  
    createAssociatedTokenAccountInstruction(
      decomInstructions,
      recipientKey,
      payerPublicKey!,
      payerPublicKey!,
      mintKey,
    );
    await createMetadata(
      new Data({
        symbol: data.symbol,
        name: data.name,
        uri: data.image,
        sellerFeeBasisPoints: data.seller_fee_basis_points,
        creators: [
          creator
        ],
      }),
      payerPublicKey!.toString(),
      mintKey!.toString(),
      payerPublicKey!.toString(),
      decomInstructions,
      payerPublicKey!.toString(),
    );
    decomInstructions.push(
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintKey,
        recipientKey,
        payerPublicKey,
        [],
        1, // token supply
      ),
    )

    signers.push(decomSigners)
    instructions.push(decomInstructions)
  }

  await sendTransactionsWithManualRetry(
    connection,
    wallet,
    instructions,
    signers,
  );
}
