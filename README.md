# Getting Started with App
-yarn
-yarn start

# Minting Token
Insert Name, symbol, memo, Image file, seller fee ( That is royalty: 1 % = 100, 100 % = 10000 ).

Max Name size = 32
Max Symbol size = 10

To change token decimals see the line 53 in src/utils/nft.ts file.

To change token supply see the line 101 in src/utils/nft.ts file.
  10000 * ( 10 ** 9 )  // total_supply * ( 10 ** decimals )

# Getting Tokens
- Click "Get Token" Button
It will show tokens that has got same symbol.

# Transfer Token
Insert Transfer address, amount and price

Price will distribute to creator's wallet.

receiver wallet will receive price * (1 - seller-fee / 10000)

creator wallet will receive price * seller-fee /10000 * share / 100

To change the creator wallet and share, see line 40, 41, 42 in the src/utils/nft.ts file.

  let creator = new Creator({address: wallet.publicKey.toBase58(), verified: true, share: 0})

  let creator1 = new Creator({address: "GLe1hmVpz1b4bJSxxK3H6cypxC2Z2DtyY2qDN2SDz6Hi", verified: false, share: 40})
  
  let creator2 = new Creator({address: "EiD4VB7cYVEsefEJbmnS5oSJhGFehQoED3Khz1DZpj62", verified: false, share: 60})
  
  let res = await uploadToPinata(name, symbol, "This is a NFT with supply", file, memo, [creator, {address: "GLe1hmVpz1b4bJSxxK3H6cypxC2Z2DtyY2qDN2SDz6Hi", verified: false, share: 40}, {address: "EiD4VB7cYVEsefEJbmnS5oSJhGFehQoED3Khz1DZpj62", verified: false, share: 60}])
 