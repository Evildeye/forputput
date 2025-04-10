
let processedSeeds = new Set(); // Track already processed seeds

async function generateAndCheckSeed() {
  const numSeeds = parseInt(document.getElementById("num-seeds").value); 
  const seedResultsContainer = document.getElementById("seed-results");
  const progressStatus = document.getElementById("progress-status");

  seedResultsContainer.innerHTML = ""; // Clear previous results
  progressStatus.textContent = `Progress: 0/${numSeeds}`;

  const seedsToGenerate = [];
  let generatedSeeds = 0;

  // Generate and queue seeds asynchronously
  while (generatedSeeds < numSeeds) {
    const randomMnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));

    if (!processedSeeds.has(randomMnemonic)) {
      processedSeeds.add(randomMnemonic);
      seedsToGenerate.push(randomMnemonic);
      generatedSeeds++;
    }
  }

  // Fetch and check wallets concurrently
  const walletPromises = seedsToGenerate.map(seed => checkWallet(seed));
  const walletResults = await Promise.all(walletPromises);

  // Append results after all have been processed
  walletResults.forEach(result => seedResultsContainer.appendChild(result));
  
  progressStatus.textContent = `Progress: ${numSeeds}/${numSeeds}`; // Final progress
}

async function checkWallet(seed) {
  const wallet = ethers.Wallet.fromMnemonic(seed);
  const address = wallet.address;

  // Fetch balances concurrently
  const [eth, bnb, tokens] = await Promise.all([getETHBalance(address), getBSCBalance(address), getERC20Tokens(wallet.address)]);

  const walletInfo = document.createElement("div");
  walletInfo.classList.add("wallet-info");

  // Add Address and Seed Phrase to wallet info
  walletInfo.innerHTML = `
    <p>Address: ${address}</p>
    <p>Seed Phrase: ${seed}</p>
    <p>ETH Balance: ${eth} ETH</p>
    <p>BNB Balance: ${bnb} BNB</p>
    <ul>
      ${tokens.filter(t => parseFloat(t.balance) > 0).map(t => `<li>${t.balance} ${t.symbol}</li>`).join('')}
    </ul>
  `;

  // Check if wallet has balance, and apply appropriate class
  if (parseFloat(eth) > 0 || parseFloat(bnb) > 0 || tokens.some(t => parseFloat(t.balance) > 0)) {
    walletInfo.classList.add("has-balance");
  } else {
    walletInfo.classList.add("no-balance");
  }

  return walletInfo;
}

// Async function to fetch ETH balance
async function getETHBalance(address) {
  const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/d3011414c0114807911c1b6cea9d79f4");
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

// Async function to fetch BNB balance
async function getBSCBalance(address) {
  const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/bsc/7TE7WEGMD443RZJ9I1BDHVEFB5FEIKD6W9");
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

// Placeholder for future ERC20 token fetching logic
async function getERC20Tokens(address) {
  return [];  // Placeholder for ERC20 tokens fetching logic
}
